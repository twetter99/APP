const db = window.firebaseDB;
// Activar logs de Firestore para diagnóstico profundo (se puede desactivar después)
try {
    if (window.firebase && firebase.firestore && typeof firebase.firestore.setLogLevel === 'function') {
        firebase.firestore.setLogLevel('debug');
        console.log('🧪 Firestore log level: debug');
    }
} catch (e) {
    console.warn('⚠️ No se pudo activar log de Firestore:', e);
}
/**
 * 🧮 BILLING SERVICE - Sistema Integral de Gestión de Facturación
 * 
 * Maneja estados de paneles, eventos históricos y cálculos de facturación
 * siguiendo las reglas de negocio establecidas.
 */

// ===== CONSTANTES Y CONFIGURACIÓN =====
const PANEL_STATES = {
    ACTIVO: 'ACTIVO',
    DESMONTADO: 'DESMONTADO', 
    BAJA: 'BAJA'
};

const CHANGE_ACTIONS = {
    ALTA: 'ALTA',
    REINSTALACION: 'REINSTALACION',
    DESMONTAJE_TEMPORAL: 'DESMONTAJE_TEMPORAL',
    BAJA_DEFINITIVA: 'BAJA_DEFINITIVA',
    CAMBIO_TARIFA: 'CAMBIO_TARIFA'
};

const TARIFA_BASE_2025 = 37.70; // Tope mensual vigente
const DIAS_BASE_MES = 30;

// ===== MÁQUINA DE ESTADOS =====
const STATE_TRANSITIONS = {
    [PANEL_STATES.ACTIVO]: {
        [CHANGE_ACTIONS.DESMONTAJE_TEMPORAL]: PANEL_STATES.DESMONTADO,
        [CHANGE_ACTIONS.BAJA_DEFINITIVA]: PANEL_STATES.BAJA,
        [CHANGE_ACTIONS.CAMBIO_TARIFA]: PANEL_STATES.ACTIVO
    },
    [PANEL_STATES.DESMONTADO]: {
        [CHANGE_ACTIONS.REINSTALACION]: PANEL_STATES.ACTIVO,
        [CHANGE_ACTIONS.BAJA_DEFINITIVA]: PANEL_STATES.BAJA
    },
    [PANEL_STATES.BAJA]: {
        // No hay transiciones salientes - estado final
    },
    'NUEVO': {
        [CHANGE_ACTIONS.ALTA]: PANEL_STATES.ACTIVO
    }
};

// ===== UTILIDADES DE FECHA =====
function formatDateKey(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

function formatDateISO(date) {
    return new Date(date).toISOString().split('T')[0];
}

function getDayOfMonth(date) {
    return new Date(date).getDate();
}

/**
 * Suma días a una fecha y retorna en formato ISO
 */
function addDays(dateISO, days) {
    const date = new Date(dateISO + 'T00:00:00');
    date.setDate(date.getDate() + days);
    return formatDateISO(date);
}

// ===== FUNCIONES DE CÁLCULO =====
/**
 * Calcula días facturables según reglas de negocio
 */
function calcularDiasFacturables(fechaAlta, fechaDesmontaje) {
    if (fechaAlta && fechaDesmontaje) {
        // ALTA A y DESMONTAJE D → días = D - A + 1 (clamp 0..30)
        const diaAlta = getDayOfMonth(fechaAlta);
        const diaDesmontaje = getDayOfMonth(fechaDesmontaje);
        return Math.max(0, Math.min(30, diaDesmontaje - diaAlta + 1));
    } else if (fechaDesmontaje) {
        // Solo DESMONTAJE en día D → días = D
        return Math.min(30, getDayOfMonth(fechaDesmontaje));
    } else if (fechaAlta) {
        // Solo ALTA en día A → días = 30 - A + 1
        const diaAlta = getDayOfMonth(fechaAlta);
        return Math.max(0, 30 - diaAlta + 1);
    }
    return 30; // Mes completo
}

/**
 * Calcula importe a facturar con redondeo bancario
 */
function calcularImporteFacturar(diasFacturables, tarifaBaseMes = TARIFA_BASE_2025) {
    const tarifaDiaria = tarifaBaseMes / DIAS_BASE_MES;
    return Math.round(tarifaDiaria * diasFacturables * 100) / 100;
}

/**
 * Genera clave de idempotencia para evitar duplicados
 */
function generateIdempotencyKey(panelId, action, effectiveDate) {
    const input = `${panelId}_${action}_${formatDateISO(effectiveDate)}`;
    // Simulación de hash simple (en producción usar crypto)
    return btoa(input).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
}

// ===== VALIDACIONES DE ESTADO =====
/**
 * Valida si una transición de estado es válida
 */
function validateStateTransition(currentState, action) {
    const allowedActions = STATE_TRANSITIONS[currentState || 'NUEVO'];
    if (!allowedActions || !allowedActions[action]) {
        return {
            valid: false,
            error: `Transición inválida: ${currentState || 'NUEVO'} → ${action}`
        };
    }
    return { valid: true, newState: allowedActions[action] };
}

/**
 * Valida solapamientos en rangos efectivos
 * Los rangos son inclusivos: [from, to]
 * Con la lógica de transiciones, los rangos son adyacentes pero no se solapan
 */
function validateDateRanges(effectiveRanges, newDate, action) {
    // Convertir fecha a formato comparable
    const newDateISO = formatDateISO(newDate);
    
    for (const range of effectiveRanges || []) {
        const rangeStart = range.from;
        const rangeEnd = range.to; // null si está activo
        
        // Verificar solapamientos
        if (rangeEnd === null) {
            // Rango activo - la nueva fecha debe ser posterior o igual al inicio
            if (newDateISO < rangeStart && action !== CHANGE_ACTIONS.BAJA_DEFINITIVA) {
                return {
                    valid: false,
                    error: `Fecha ${newDateISO} anterior al inicio del rango activo ${rangeStart}`
                };
            }
        } else {
            // Rango cerrado - verificar si hay solapamiento estricto
            // Con la nueva lógica, los rangos adyacentes comparten fecha de frontera
            // pero el nuevo rango empieza al día siguiente
            if (newDateISO > rangeStart && newDateISO < rangeEnd) {
                return {
                    valid: false,
                    error: `Fecha ${newDateISO} solapa con rango existente ${rangeStart} - ${rangeEnd}`
                };
            }
        }
    }
    
    return { valid: true };
}

// ===== FUNCIONES PRINCIPALES =====

/**
 * Obtiene el estado efectivo de un panel en una fecha específica
 */
async function getPanelEffectiveState(panelId, date) {
    try {
        console.log(`🔍 Obteniendo estado efectivo para panel ${panelId} (tipo: ${typeof panelId}) en fecha ${formatDateISO(date)}`);

        // Normalizar id en ambos formatos
        const panelIdStr = String(panelId).trim();
        const panelIdNum = !isNaN(Number(panelIdStr)) ? Number(panelIdStr) : null;

        // 1º intento: buscar por codigo como string
        let panelQuery = await db.collection('paneles')
            .where('codigo', '==', panelIdStr)
            .limit(1)
            .get();
        console.log(`🔍 Query (string) resultado: ${panelQuery.empty ? 'VACÍO' : 'ENCONTRADO'}, docs: ${panelQuery.size}`);

        // 2º intento (fallback): si vacío y es numérico, buscar por número
        if (panelQuery.empty && panelIdNum !== null) {
            console.log('🔁 Fallback búsqueda numérica...');
            panelQuery = await db.collection('paneles')
                .where('codigo', '==', panelIdNum)
                .limit(1)
                .get();
            console.log(`🔍 Query (number) resultado: ${panelQuery.empty ? 'VACÍO' : 'ENCONTRADO'}, docs: ${panelQuery.size}`);
        }

        if (panelQuery.empty) {
            // Fallback legacy desde dataset en memoria
            const legacyPanel = (window.panelsData || []).find(p => String(p.codigo).trim() === panelIdStr);
            if (legacyPanel) {
                console.log(`🗂️ Fallback legacy en memoria para panel ${panelIdStr}`);
                // Determinar estado base por fechaDesmontaje / fechaBaja hipotética
                let estadoBase = PANEL_STATES.ACTIVO;
                if (legacyPanel.fechaBaja) {
                    estadoBase = PANEL_STATES.BAJA;
                } else if (legacyPanel.fechaDesmontaje) {
                    estadoBase = PANEL_STATES.DESMONTADO;
                }
                return {
                    exists: true,
                    state: estadoBase,
                    tarifa: TARIFA_BASE_2025,
                    isLegacy: true,
                    legacyData: {
                        fechaDesmontaje: legacyPanel.fechaDesmontaje || null,
                        fechaBaja: legacyPanel.fechaBaja || null,
                        municipio: legacyPanel.municipio || null
                    },
                    docId: null // Aún no existe en Firestore
                };
            }
            console.log(`❌ Panel ${panelIdStr} NO encontrado en base de datos (string y/o number) y no existe en memoria`);
            return {
                exists: false,
                state: null,
                tarifa: TARIFA_BASE_2025
            };
        }
        
        const panelDoc = panelQuery.docs[0];
        const panelData = panelDoc.data();
        const targetDate = formatDateISO(date);
        
        console.log(`📄 Panel encontrado - codigo: ${panelData.codigo}, estadoActual: ${panelData.estadoActual}, effectiveRanges: ${panelData.effectiveRanges ? panelData.effectiveRanges.length : 0}`);
        
        // Buscar en rangos efectivos
        const effectiveRanges = panelData.effectiveRanges || [];
        
        for (const range of effectiveRanges) {
            const rangeStart = range.from;
            const rangeEnd = range.to; // null si está activo
            
            if (targetDate >= rangeStart && (rangeEnd === null || targetDate <= rangeEnd)) {
                return {
                    exists: true,
                    state: range.estado,
                    tarifa: panelData.tarifaBaseMes || TARIFA_BASE_2025,
                    range: range,
                    docId: panelDoc.id // Incluir ID real del documento
                };
            }
        }
        
        // ===== SOPORTE PARA PANELES LEGACY =====
        // Si no hay rangos efectivos pero el panel existe en Firestore,
        // es un panel legacy que necesita estado base calculado
        if (effectiveRanges.length === 0) {
            console.log(`⚠️ Panel legacy detectado: ${panelId} - calculando estado base`);
            
            // Determinar estado base desde campos antiguos
            let estadoBase = PANEL_STATES.ACTIVO; // Por defecto ACTIVO
            
            if (panelData.fechaBaja) {
                estadoBase = PANEL_STATES.BAJA;
            } else if (panelData.fechaDesmontaje) {
                estadoBase = PANEL_STATES.DESMONTADO;
            } else if (panelData.estado) {
                // Usar campo estado si existe
                const estadoLegacy = panelData.estado.toUpperCase();
                if (estadoLegacy === 'DESMONTADO') {
                    estadoBase = PANEL_STATES.DESMONTADO;
                } else if (estadoLegacy === 'BAJA') {
                    estadoBase = PANEL_STATES.BAJA;
                } else {
                    estadoBase = PANEL_STATES.ACTIVO;
                }
            }
            
            console.log(`📋 Estado base calculado para panel legacy ${panelId}: ${estadoBase}`);
            
            return {
                exists: true,
                state: estadoBase,
                tarifa: panelData.tarifaBaseMes || panelData.tarifa || TARIFA_BASE_2025,
                isLegacy: true, // Marcar como legacy
                legacyData: {
                    fechaDesmontaje: panelData.fechaDesmontaje,
                    fechaBaja: panelData.fechaBaja,
                    estado: panelData.estado
                },
                docId: panelDoc.id // Incluir ID real del documento
            };
        }
        
        // Si no se encuentra en rangos y no es legacy, el panel no existía en esa fecha
        return {
            exists: false,
            state: null,
            tarifa: TARIFA_BASE_2025
        };
        
    } catch (error) {
        console.error('❌ Error obteniendo estado efectivo:', error);
        throw new Error(`Error obteniendo estado del panel: ${error.message}`);
    }
}

/**
 * Previsualiza un cambio sin aplicarlo
 */
async function previewChange(panelId, action, effectiveDate, payload = {}) {
    try {
        console.log(`🔮 Previsualizando cambio: ${action} para panel ${panelId} en ${formatDateISO(effectiveDate)}`);
        
        // Obtener estado actual
        const currentState = await getPanelEffectiveState(panelId, effectiveDate);
        
        // Validar transición
        const stateValidation = validateStateTransition(
            currentState.exists ? currentState.state : null, 
            action
        );
        
        if (!stateValidation.valid) {
            return {
                valid: false,
                error: stateValidation.error
            };
        }
        
        // Calcular impacto en facturación
        const monthKey = formatDateKey(effectiveDate);
        let diasFacturables = 0;
        let importeAFacturar = 0;
        
        // Obtener cambios existentes en el mes para calcular días
        // Primero buscar el panel por código (string y fallback numérico)
        const panelIdStr = String(panelId).trim();
        const panelIdNum = !isNaN(Number(panelIdStr)) ? Number(panelIdStr) : null;

        let panelQuery = await db.collection('paneles')
            .where('codigo', '==', panelIdStr)
            .limit(1)
            .get();
        if (panelQuery.empty && panelIdNum !== null) {
            panelQuery = await db.collection('paneles')
                .where('codigo', '==', panelIdNum)
                .limit(1)
                .get();
        }
        
        let changesQuery;
        if (!panelQuery.empty) {
            const panelDoc = panelQuery.docs[0];
            changesQuery = await panelDoc.ref
                .collection('changes')
                .where('monthKey', '==', monthKey)
                .get();
        } else {
            // Si el panel no existe, no hay cambios previos
            changesQuery = { empty: true, forEach: () => {} };
        }
        
        const existingChanges = [];
        changesQuery.forEach(doc => {
            existingChanges.push(doc.data());
        });
        
        // Simular el cálculo incluyendo el nuevo cambio
        const tarifaBaseMes = payload.tarifaBaseMes || currentState.tarifa;
        
        // Lógica de cálculo según tipo de acción
        switch (action) {
            case CHANGE_ACTIONS.ALTA:
                diasFacturables = calcularDiasFacturables(effectiveDate, null);
                break;
                
            case CHANGE_ACTIONS.DESMONTAJE_TEMPORAL:
                diasFacturables = calcularDiasFacturables(null, effectiveDate);
                break;
                
            case CHANGE_ACTIONS.REINSTALACION:
                diasFacturables = calcularDiasFacturables(effectiveDate, null);
                break;
                
            case CHANGE_ACTIONS.BAJA_DEFINITIVA:
                diasFacturables = calcularDiasFacturables(null, effectiveDate);
                break;
                
            case CHANGE_ACTIONS.CAMBIO_TARIFA:
                diasFacturables = 30; // Mes completo con nueva tarifa
                break;
        }
        
        importeAFacturar = calcularImporteFacturar(diasFacturables, tarifaBaseMes);
        const importeNoFacturado = calcularImporteFacturar(30, tarifaBaseMes) - importeAFacturar;
        
        return {
            valid: true,
            preview: {
                estadoActual: currentState.exists ? currentState.state : 'NUEVO',
                estadoFuturo: stateValidation.newState,
                tarifaBaseMes: tarifaBaseMes,
                diasFacturables: diasFacturables,
                importeAFacturar: importeAFacturar,
                importeNoFacturado: Math.max(0, importeNoFacturado),
                monthKey: monthKey,
                effectiveDate: formatDateISO(effectiveDate)
            }
        };
        
    } catch (error) {
        console.error('❌ Error en preview:', error);
        return {
            valid: false,
            error: `Error en previsualización: ${error.message}`
        };
    }
}

/**
 * Aplica un cambio con transacción completa
 */
async function applyChange(panelId, payload) {
    try {
        console.log(`🔄 Aplicando cambio para panel ${panelId} (tipo: ${typeof panelId}):`, payload);
        
        // ✅ LIMPIAR COMPLETAMENTE EL INPUT - Crear objeto nuevo sin contaminar
        const cleanPayload = {
            action: String(payload.action || ''),
            effectiveDate: String(payload.effectiveDate || ''),
            motivo: payload.motivo ? String(payload.motivo) : null,
            tarifaBaseMes: payload.tarifaBaseMes ? Number(payload.tarifaBaseMes) : null,
            uid: String(payload.uid || ''),
            email: String(payload.email || '')
        };
        
        const { action, effectiveDate, motivo, tarifaBaseMes, uid, email } = cleanPayload;
        
        // Asegurar que panelId es string
        const panelIdStr = String(panelId).trim();
        const panelIdNum = !isNaN(Number(panelIdStr)) ? Number(panelIdStr) : null;
        console.log(`🔄 Panel ID normalizado a string: "${panelIdStr}"`);
        
    // Generar clave de idempotencia
    const idempotencyKey = generateIdempotencyKey(panelIdStr, action, effectiveDate);
    console.log('🧪 DEBUG: idempotencyKey generado:', idempotencyKey);

        // ✅ Buscar el documento del panel POR FUERA de la transacción para obtener un DocumentReference
        console.log('🔍 Lookup de panel por código (pre-transacción):', panelIdStr);
        let panelDocRef = null;
        let preTxPanelSnapshot = null;
        try {
            let preQuery = await db.collection('paneles')
                .where('codigo', '==', panelIdStr)
                .limit(1)
                .get();
            if (preQuery.empty && panelIdNum !== null) {
                console.log('🔁 Fallback búsqueda numérica pre-transacción...');
                preQuery = await db.collection('paneles')
                    .where('codigo', '==', panelIdNum)
                    .limit(1)
                    .get();
            }
            if (!preQuery.empty) {
                preTxPanelSnapshot = preQuery.docs[0];
                panelDocRef = preTxPanelSnapshot.ref;
                console.log(`✅ Panel encontrado pre-transacción con docId: ${panelDocRef.id}`);
            } else {
                panelDocRef = db.collection('paneles').doc();
                console.log(`🆕 Panel no encontrado pre-transacción, se creará nuevo docId: ${panelDocRef.id}`);
            }
        } catch (lookupErr) {
            console.error('❌ Error en lookup pre-transacción:', lookupErr);
            throw lookupErr;
        }
        
        // Ejecutar transacción
        const result = await db.runTransaction(async (transaction) => {
            let __step = 'tx:start';
            try {
                console.log('🧪 DEBUG TX:', __step);
                // 1. Obtener el snapshot del documento del panel usando SOLO DocumentReference
                __step = 'tx:get:panelDoc';
                const panelSnapshot = await transaction.get(panelDocRef);
                let panelDoc = panelDocRef;
                let currentData;

                if (!panelSnapshot.exists) {
                    console.log(`📝 Panel ${panelIdStr} no existe (tx), inicializando como legacy antes de crear`);
                    const legacyPanel = (window.panelsData || []).find(p => String(p.codigo).trim() === panelIdStr);
                    let estadoBase = PANEL_STATES.ACTIVO;
                    let municipioBase = legacyPanel ? legacyPanel.municipio || 'DESCONOCIDO' : 'DESCONOCIDO';
                    if (legacyPanel) {
                        if (legacyPanel.fechaBaja) {
                            estadoBase = PANEL_STATES.BAJA;
                        } else if (legacyPanel.fechaDesmontaje) {
                            estadoBase = PANEL_STATES.DESMONTADO;
                        }
                    }
                    const legacyStartDate = '2025-10-01';
                    currentData = {
                        codigo: panelIdStr,
                        municipio: municipioBase,
                        estadoActual: estadoBase,
                        effectiveRanges: [{ from: legacyStartDate, to: null, estado: estadoBase }],
                        tarifaBaseMes: TARIFA_BASE_2025,
                        creadoLegacy: true
                    };
                    console.log(`✅ Panel legacy preparado para creación con estado ${estadoBase} municipio ${municipioBase}`);
                } else {
                    // Panel existe - usar documento encontrado
                    const rawData = panelSnapshot.data();

                    // AISLAR: Crear objeto completamente limpio sin referencias a Firestore
                    currentData = {
                        codigo: String(rawData.codigo || ''),
                        municipio: String(rawData.municipio || ''),
                        estadoActual: String(rawData.estadoActual || ''),
                        tarifaBaseMes: Number(rawData.tarifaBaseMes || TARIFA_BASE_2025),
                        effectiveRanges: [],
                        estado: rawData.estado ? String(rawData.estado) : undefined,
                        fechaBaja: rawData.fechaBaja ? (typeof rawData.fechaBaja === 'string' ? rawData.fechaBaja : (rawData.fechaBaja.toDate ? formatDateISO(rawData.fechaBaja.toDate()) : null)) : undefined,
                        fechaDesmontaje: rawData.fechaDesmontaje ? (typeof rawData.fechaDesmontaje === 'string' ? rawData.fechaDesmontaje : (rawData.fechaDesmontaje.toDate ? formatDateISO(rawData.fechaDesmontaje.toDate()) : null)) : undefined,
                        creadoLegacy: rawData.creadoLegacy === true
                    };

                    // Copiar effectiveRanges limpiamente
                    if (rawData.effectiveRanges && Array.isArray(rawData.effectiveRanges)) {
                        for (const range of rawData.effectiveRanges) {
                            currentData.effectiveRanges.push({
                                from: String(range.from || ''),
                                to: range.to ? String(range.to) : null,
                                estado: String(range.estado || '')
                            });
                        }
                    }

                    console.log(`✅ Panel ${panelIdStr} encontrado con ID de documento: ${panelDoc.id}`);
                }
            
            // 2. Verificar idempotencia
            __step = 'tx:get:changeDoc';
            const changeDoc = panelDoc.collection('changes').doc(idempotencyKey);
            const existingChange = await transaction.get(changeDoc);
            
            if (existingChange.exists) {
                console.log('ℹ️ Cambio ya aplicado (idempotencia)');
                return { success: true, duplicate: true, data: existingChange.data() };
            }
            
            // ===== REALIZAR TODAS LAS LECTURAS RESTANTES ANTES DE CUALQUIER ESCRITURA =====
            
            // Pre-calcular monthKey para las siguientes lecturas
            const monthKey = formatDateKey(effectiveDate);
            
            // Lectura 3: monthBillingDoc
            __step = 'tx:prepare:monthBillingDoc';
            const monthBillingDoc = db.collection('panel_month_billing')
                .doc(`${panelIdStr}_${monthKey.replace('-', '')}`);

            __step = 'tx:get:monthBillingDoc';
            const monthBillingSnapshot = await transaction.get(monthBillingDoc);
            
            // Lectura 4: summaryDoc
            __step = 'tx:get:summaryDoc';
            const summaryDoc = db.collection('billing_summary').doc(monthKey.replace('-', ''));
            const summarySnapshot = await transaction.get(summaryDoc);
            
            console.log('✅ Todas las lecturas completadas. Iniciando construcción de objetos...');
            
            // ===== SOPORTE PARA PANELES LEGACY (solo si existía sin rangos) =====
            const isLegacyPanelExisting = panelSnapshot && currentData.effectiveRanges.length === 0;
            if (isLegacyPanelExisting) {
                console.log(`🔧 Inicializando effectiveRanges para panel legacy existente sin rangos: ${panelIdStr}`);
                let estadoBase = PANEL_STATES.ACTIVO;
                if (currentData.fechaBaja) {
                    estadoBase = PANEL_STATES.BAJA;
                } else if (currentData.fechaDesmontaje) {
                    estadoBase = PANEL_STATES.DESMONTADO;
                } else if (currentData.estado) {
                    const estadoLegacy = currentData.estado.toUpperCase();
                    if (estadoLegacy === 'DESMONTADO') estadoBase = PANEL_STATES.DESMONTADO;
                    else if (estadoLegacy === 'BAJA') estadoBase = PANEL_STATES.BAJA;
                }
                const legacyStartDate = '2025-10-01';
                currentData.effectiveRanges = [{ from: legacyStartDate, to: null, estado: estadoBase }];
                currentData.estadoActual = estadoBase;
                console.log(`✅ Panel legacy existente inicializado con estado ${estadoBase}`);
            }
            
            // 3. Validar transición
            const stateValidation = validateStateTransition(currentData.estadoActual, action);
            if (!stateValidation.valid) {
                throw new Error(stateValidation.error);
            }
            
            // 4. Validar rangos de fecha
            __step = 'tx:validate:ranges';
            const rangeValidation = validateDateRanges(
                currentData.effectiveRanges, 
                effectiveDate, 
                action
            );
            if (!rangeValidation.valid) {
                throw new Error(rangeValidation.error);
            }
            
            // 5. Calcular impacto directamente (sin previewChange que hace queries)
            __step = 'tx:calc:impact';
            // monthKey ya fue calculado arriba para las lecturas
            const tarifaMes = tarifaBaseMes || currentData.tarifaBaseMes || TARIFA_BASE_2025;
            let diasFacturables = 0;
            
            // Calcular días según la acción
            switch (action) {
                case CHANGE_ACTIONS.ALTA:
                    diasFacturables = calcularDiasFacturables(effectiveDate, null);
                    break;
                case CHANGE_ACTIONS.DESMONTAJE_TEMPORAL:
                    diasFacturables = calcularDiasFacturables(null, effectiveDate);
                    break;
                case CHANGE_ACTIONS.REINSTALACION:
                    diasFacturables = calcularDiasFacturables(effectiveDate, null);
                    break;
                case CHANGE_ACTIONS.BAJA_DEFINITIVA:
                    diasFacturables = calcularDiasFacturables(null, effectiveDate);
                    break;
                case CHANGE_ACTIONS.CAMBIO_TARIFA:
                    diasFacturables = 30;
                    break;
            }
            
            const importeAFacturar = calcularImporteFacturar(diasFacturables, tarifaMes);
            
            const changeData = {
                estadoActual: currentData.estadoActual,
                estadoFuturo: stateValidation.newState,
                tarifaBaseMes: tarifaMes,
                diasFacturables: diasFacturables,
                importeAFacturar: importeAFacturar,
                monthKey: monthKey,
                effectiveDate: formatDateISO(effectiveDate)
            };
            
            // 6. Crear evento de cambio - OBJETO COMPLETAMENTE NUEVO
            __step = 'tx:build:changeRecord';
            const changeRecord = {
                action: String(action),
                effectiveDate: firebase.firestore.Timestamp.fromDate(new Date(effectiveDate)),
                monthKey: String(changeData.monthKey),
                motivo: motivo ? String(motivo) : null,
                tarifaBaseMes: Number(tarifaMes),
                diasFacturables: Number(changeData.diasFacturables),
                importeAFacturar: Number(changeData.importeAFacturar),
                snapshotBefore: {
                    estadoActual: String(currentData.estadoActual),
                    tarifaBaseMes: Number(currentData.tarifaBaseMes)
                },
                snapshotAfter: {
                    estadoActual: String(stateValidation.newState),
                    tarifaBaseMes: Number(tarifaMes)
                },
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: { 
                    uid: String(uid), 
                    email: String(email) 
                },
                idempotencyKey: String(idempotencyKey)
            };
            
            // 🔍 DEBUGGER - Verificar changeRecord antes de guardar
            console.log('🔍 DEBUGGER - Intentando guardar changeRecord');
            console.log('🔍 Tipo de changeRecord:', typeof changeRecord);
            console.log('🔍 Keys de changeRecord:', Object.keys(changeRecord));
            console.log('🔍 Valores de changeRecord:', Object.entries(changeRecord).map(([k, v]) => ({
                key: k,
                value: v,
                type: typeof v,
                constructor: v?.constructor?.name
            })));
            
            // NOTA: No escribir todavía. Todos los reads deben ejecutarse antes de los writes.
            
            // 7. Actualizar estado del panel - OBJETO COMPLETAMENTE NUEVO
            // Copiar rangos manualmente creando objetos completamente nuevos
            __step = 'tx:build:newEffectiveRanges';
            const newEffectiveRanges = [];
            
            for (const range of currentData.effectiveRanges) {
                newEffectiveRanges.push({
                    from: String(range.from),
                    to: range.to ? String(range.to) : null,
                    estado: String(range.estado)
                });
            }
            
            const dateISO = formatDateISO(effectiveDate);
            
            // Actualizar rangos según la acción
            if (action === CHANGE_ACTIONS.ALTA) {
                newEffectiveRanges.push({
                    from: String(dateISO),
                    to: null,
                    estado: String(PANEL_STATES.ACTIVO)
                });
            } else if (action === CHANGE_ACTIONS.DESMONTAJE_TEMPORAL) {
                // Cerrar rango activo en fecha de desmontaje
                const activeRange = newEffectiveRanges.find(r => r.to === null);
                if (activeRange) {
                    activeRange.to = String(dateISO);
                }
                newEffectiveRanges.push({
                    from: String(addDays(dateISO, 1)),
                    to: null,
                    estado: String(PANEL_STATES.DESMONTADO)
                });
            } else if (action === CHANGE_ACTIONS.REINSTALACION) {
                // Cerrar rango desmontado en fecha de reinstalación
                const desmontadoRange = newEffectiveRanges.find(r => r.to === null && r.estado === PANEL_STATES.DESMONTADO);
                if (desmontadoRange) {
                    desmontadoRange.to = String(dateISO);
                }
                newEffectiveRanges.push({
                    from: String(addDays(dateISO, 1)),
                    to: null,
                    estado: String(PANEL_STATES.ACTIVO)
                });
            } else if (action === CHANGE_ACTIONS.BAJA_DEFINITIVA) {
                // Cerrar todos los rangos activos
                newEffectiveRanges.forEach(range => {
                    if (range.to === null) {
                        range.to = String(dateISO);
                    }
                });
                newEffectiveRanges.push({
                    from: String(dateISO),
                    to: null,
                    estado: String(PANEL_STATES.BAJA)
                });
            }
            
            // Crear objeto completamente nuevo para actualizar panel
            __step = 'tx:build:updatedPanelData';
            const updatedPanelData = {
                codigo: String(currentData.codigo),
                municipio: String(currentData.municipio),
                estadoActual: String(stateValidation.newState),
                effectiveRanges: newEffectiveRanges,
                tarifaBaseMes: Number(tarifaMes),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: { 
                    uid: String(uid), 
                    email: String(email) 
                }
            };
            
            // Preservar campos opcionales como strings limpios
            if (currentData.fechaBaja) {
                updatedPanelData.fechaBaja = String(currentData.fechaBaja);
            }
            if (currentData.fechaDesmontaje) {
                updatedPanelData.fechaDesmontaje = String(currentData.fechaDesmontaje);
            }
            if (currentData.estado) {
                updatedPanelData.estado = String(currentData.estado);
            }
            if (currentData.creadoLegacy) {
                updatedPanelData.creadoLegacy = true;
            }
            
            // 🔍 DEBUGGER - Verificar updatedPanelData antes de guardar
            console.log('🔍 DEBUGGER - Intentando guardar updatedPanelData');
            console.log('🔍 Tipo de updatedPanelData:', typeof updatedPanelData);
            console.log('🔍 Keys de updatedPanelData:', Object.keys(updatedPanelData));
            console.log('🔍 Valores de updatedPanelData:', Object.entries(updatedPanelData).map(([k, v]) => ({
                key: k,
                value: v,
                type: typeof v,
                constructor: v?.constructor?.name,
                isArray: Array.isArray(v)
            })));
            
            // NOTA: NO escribir panelDoc todavía - primero todos los reads
            
            // 8. Actualizar facturación mensual del panel - OBJETO COMPLETAMENTE NUEVO
            // monthBillingDoc y monthBillingSnapshot ya fueron leídos arriba
            
            let updatedBilling;
            if (monthBillingSnapshot.exists) {
                const existingBilling = monthBillingSnapshot.data();
                
                // Crear objeto de acciones completamente nuevo
                const newAcciones = {};
                const existingAcciones = existingBilling.acciones || {};
                
                // Copiar solo valores numéricos
                for (const key in existingAcciones) {
                    if (typeof existingAcciones[key] === 'number') {
                        newAcciones[String(key)] = Number(existingAcciones[key]);
                    }
                }
                
                // Agregar o incrementar la acción actual
                newAcciones[String(action)] = (newAcciones[String(action)] || 0) + 1;
                
                __step = 'tx:build:updatedBilling:exists';
                updatedBilling = {
                    panelId: String(panelIdStr),
                    monthKey: String(changeData.monthKey),
                    totalDiasFacturables: Number((existingBilling.totalDiasFacturables || 0) + changeData.diasFacturables),
                    totalImporte: Number((existingBilling.totalImporte || 0) + changeData.importeAFacturar),
                    acciones: newAcciones,
                    lastChangeAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastChangeBy: { 
                        uid: String(uid), 
                        email: String(email) 
                    }
                };
            } else {
                __step = 'tx:build:updatedBilling:new';
                updatedBilling = {
                    panelId: String(panelIdStr),
                    monthKey: String(changeData.monthKey),
                    totalDiasFacturables: Number(changeData.diasFacturables),
                    totalImporte: Number(changeData.importeAFacturar),
                    acciones: {
                        [String(action)]: 1
                    },
                    lastChangeAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastChangeBy: { 
                        uid: String(uid), 
                        email: String(email) 
                    }
                };
            }
            
            // 🔍 DEBUGGER - Verificar updatedBilling antes de guardar
            console.log('🔍 DEBUGGER - Intentando guardar updatedBilling');
            console.log('🔍 Tipo de updatedBilling:', typeof updatedBilling);
            console.log('🔍 Keys de updatedBilling:', Object.keys(updatedBilling));
            console.log('🔍 Valores de updatedBilling:', Object.entries(updatedBilling).map(([k, v]) => ({
                key: k,
                value: v,
                type: typeof v,
                constructor: v?.constructor?.name,
                isArray: Array.isArray(v)
            })));
            
            // NOTA: NO escribir monthBillingDoc todavía - primero todos los reads
            
            // 9. Actualizar resumen global del mes - OBJETO COMPLETAMENTE NUEVO
            // summaryDoc y summarySnapshot ya fueron leídos arriba
            
            let updatedSummary;
            if (summarySnapshot.exists) {
                // Actualizar incrementalmente el resumen existente
                const currentSummary = summarySnapshot.data();
                const newTotalImporte = Number((currentSummary.totalImporteMes || 0) + changeData.importeAFacturar);
                
                __step = 'tx:build:updatedSummary:exists';
                updatedSummary = {
                    monthKey: String(changeData.monthKey),
                    totalPanelesFacturables: Number(currentSummary.totalPanelesFacturables || 0),
                    totalImporteMes: Math.round(newTotalImporte * 100) / 100,
                    totalAcciones: Number((currentSummary.totalAcciones || 0) + 1),
                    lastChangeAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastChangeBy: { 
                        uid: String(uid), 
                        email: String(email) 
                    }
                };
                
                // Si es el primer cambio de este panel en el mes, incrementar contador de paneles
                if (!monthBillingSnapshot.exists) {
                    updatedSummary.totalPanelesFacturables += 1;
                }
            } else {
                // Crear nuevo resumen si no existe
                __step = 'tx:build:updatedSummary:new';
                updatedSummary = {
                    monthKey: String(changeData.monthKey),
                    totalPanelesFacturables: 1,
                    totalImporteMes: Number(changeData.importeAFacturar),
                    totalAcciones: 1,
                    lastChangeAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastChangeBy: { 
                        uid: String(uid), 
                        email: String(email) 
                    }
                };
            }
            
            // 🔍 DEBUGGER - Verificar updatedSummary antes de guardar
            console.log('🔍 DEBUGGER - Intentando guardar updatedSummary');
            console.log('🔍 Tipo de updatedSummary:', typeof updatedSummary);
            console.log('🔍 Keys de updatedSummary:', Object.keys(updatedSummary));
            console.log('🔍 Valores de updatedSummary:', Object.entries(updatedSummary).map(([k, v]) => ({
                key: k,
                value: v,
                type: typeof v,
                constructor: v?.constructor?.name
            })));
            
            // ===== Escribir todos los documentos (después de terminar TODOS los reads) =====
            __step = 'tx:write:changeDoc';
            transaction.set(changeDoc, changeRecord);

            __step = 'tx:write:panelDoc';
            transaction.set(panelDoc, updatedPanelData, { merge: true });

            __step = 'tx:write:monthBillingDoc';
            transaction.set(monthBillingDoc, updatedBilling);

            __step = 'tx:write:summaryDoc';
            transaction.set(summaryDoc, updatedSummary);
            
            return {
                success: true,
                duplicate: false,
                data: {
                    changeRecord,
                    updatedPanel: updatedPanelData,
                    billing: updatedBilling,
                    summary: updatedSummary
                }
            };
            } catch (txErr) {
                console.error('⛔️ DEBUG TX FAILED at step:', __step, txErr);
                // Volcar contexto mínimo para ayudar a diagnóstico
                try {
                    console.error('⛔️ Contexto rápido:', {
                        step: __step,
                        panelIdStr,
                        action,
                        effectiveDate,
                        idempotencyKey
                    });
                } catch {}
                throw txErr;
            }
        });
        
        console.log('✅ Cambio aplicado exitosamente:', result);
        
        // CRÍTICO: Reconstruir facturación del mes para calcular correctamente desde los eventos
        const monthKey = formatDateKey(payload.effectiveDate);
        console.log(`🔨 Reconstruyendo facturación del mes ${monthKey} después del cambio...`);
        await rebuildMonthlyBilling(monthKey);
        console.log(`✅ Facturación reconstruida correctamente para ${monthKey}`);
        
        return result;
        
    } catch (error) {
        console.error('❌ Error aplicando cambio:', error);
        throw new Error(`Error aplicando cambio: ${error.message}`);
    }
}

// ===== FUNCIONES DE MIGRACIÓN =====

/**
 * Reconstruye facturación mensual a partir del histórico de cambios
 */
async function rebuildMonthlyBilling(monthKey) {
    try {
        console.log(`🔨 Reconstruyendo facturación para mes ${monthKey}`);
        
        // Verificar autenticación
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) {
            throw new Error('Usuario no autenticado');
        }
        
        const billingByPanel = {};
        let totalImporte = 0;
        let totalAcciones = 0;
        
        // Obtener TODOS los paneles
        console.log('📦 Obteniendo paneles...');
        const panelsSnapshot = await db.collection('paneles').get();
        console.log(`✅ ${panelsSnapshot.size} paneles encontrados`);
        
        // Procesar cada panel individualmente (SIN collectionGroup)
        for (const panelDoc of panelsSnapshot.docs) {
            const panelId = panelDoc.id;
            const panelData = panelDoc.data();
            const codigo = String(panelData.codigo || panelId);
            
            try {
                // Leer eventos de ESTE panel específico para el mes
                const changesSnapshot = await db.collection('paneles')
                    .doc(panelId)
                    .collection('changes')
                    .where('monthKey', '==', monthKey)
                    .get();
                
                if (changesSnapshot.empty) {
                    continue; // No hay eventos para este panel
                }
                
                // Inicializar billing
                if (!billingByPanel[codigo]) {
                    billingByPanel[codigo] = {
                        panelId: codigo,
                        monthKey: monthKey,
                        totalDiasFacturables: 0,
                        totalImporte: 0,
                        acciones: {},
                        municipio: panelData.municipio || 'Desconocido'
                    };
                }
                
                const billing = billingByPanel[codigo];
                
                // Acumular datos de eventos
                changesSnapshot.forEach(doc => {
                    const change = doc.data();
                    billing.totalDiasFacturables += change.diasFacturables || 0;
                    billing.totalImporte += change.importeAFacturar || 0;
                    billing.acciones[change.action] = (billing.acciones[change.action] || 0) + 1;
                    billing.lastChangeAt = change.createdAt;
                    billing.lastChangeBy = change.createdBy;
                    
                    totalImporte += change.importeAFacturar || 0;
                    totalAcciones += 1;
                });
                
            } catch (error) {
                console.warn(`⚠️ Error en panel ${codigo}:`, error.message);
            }
        }
        
        console.log(`💾 Guardando ${Object.keys(billingByPanel).length} registros...`);
        
        // Guardar en batch
        const batch = db.batch();
        
        Object.values(billingByPanel).forEach(billing => {
            const docId = `${billing.panelId}_${monthKey.replace('-', '')}`;
            const docRef = db.collection('panel_month_billing').doc(docId);
            batch.set(docRef, billing);
        });
        
        await batch.commit();
        
        // Actualizar resumen global
        const summaryRef = db.collection('billing_summary').doc(monthKey.replace('-', ''));
        await summaryRef.set({
            monthKey: monthKey,
            totalPanelesFacturables: Object.keys(billingByPanel).length,
            totalImporteMes: Math.round(totalImporte * 100) / 100,
            totalAcciones: totalAcciones,
            lastChangeAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`✅ Completado: ${Object.keys(billingByPanel).length} paneles, ${totalImporte.toFixed(2)} €`);
        
        return {
            success: true,
            paneles: Object.keys(billingByPanel).length,
            totalImporte: Math.round(totalImporte * 100) / 100,
            totalAcciones: totalAcciones
        };
        
    } catch (error) {
        console.error('❌ Error:', error);
        throw new Error(`Error reconstruyendo facturación: ${error.message}`);
    }
}

/**
 * Obtiene los totales de facturación del mes desde Firestore
 */
async function getMonthBillingSummary(monthKey) {
    try {
        console.log(`📊 Obteniendo resumen de facturación para ${monthKey}`);
        
        const summaryDoc = await db.collection('billing_summary')
            .doc(monthKey.replace('-', ''))
            .get();
        
        if (summaryDoc.exists) {
            const data = summaryDoc.data();
            return {
                totalRevenue: data.totalImporteMes || 0,
                activePanels: data.totalPanelesFacturables || 0,
                totalActions: data.totalAcciones || 0,
                lastChangeAt: data.lastChangeAt,
                monthKey: data.monthKey
            };
        } else {
            // Si no existe el documento, retornar null para indicar que no hay datos
            return null;
        }
        
    } catch (error) {
        console.error('❌ Error obteniendo resumen mensual:', error);
        throw error;
    }
}

/**
 * Migración: Reconstruir billing_summary desde panel_month_billing existente
 */
async function migrateBillingSummary(monthKey = null) {
    try {
        console.log('🔄 Iniciando migración de billing_summary...');
        
        // Si no se especifica monthKey, procesar el mes actual
        if (!monthKey) {
            const now = new Date();
            monthKey = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}`;
        }
        
        // Consultar todos los registros de panel_month_billing para este mes
        const billingQuery = db.collection('panel_month_billing')
            .where('monthKey', '==', monthKey);
        
        const billingSnapshot = await billingQuery.get();
        
        let totalImporteMes = 0;
        let totalPanelesFacturables = 0;
        let totalDays = 0;
        
        billingSnapshot.forEach(docSnapshot => {
            const billing = docSnapshot.data();
            totalImporteMes += billing.totalAmount || 0;
            totalPanelesFacturables += 1;
            totalDays += billing.billableDays || 0;
        });
        
        // Crear/actualizar documento de resumen
        const summaryData = {
            monthKey,
            totalImporteMes,
            totalPanelesFacturables,
            totalDays,
            totalAcciones: 0, // Se actualizará con los cambios
            lastChangeAt: new Date(),
            updatedAt: new Date()
        };
        
        await db.collection('billing_summary').doc(monthKey).set(summaryData);
        
        console.log(`✅ Migración completada para ${monthKey}:`, summaryData);
        return summaryData;
        
    } catch (error) {
        console.error('❌ Error en migración de billing_summary:', error);
        throw error;
    }
}

/**
 * Actualiza un evento existente y recalcula facturación
 */
async function updateChange(panelId, changeId, newPayload) {
    try {
        console.log(`🔄 Actualizando evento ${changeId} del panel ${panelId}`);
        
        const panelIdStr = String(panelId).trim();
        const panelIdNum = !isNaN(Number(panelIdStr)) ? Number(panelIdStr) : null;
        
        // Buscar panel (por código string, numérico y fallback por docId directo)
        let panelQuery = await db.collection('paneles')
            .where('codigo', '==', panelIdStr)
            .limit(1)
            .get();

        if (panelQuery.empty && panelIdNum !== null) {
            panelQuery = await db.collection('paneles')
                .where('codigo', '==', panelIdNum)
                .limit(1)
                .get();
        }

        let panelDoc;
        if (!panelQuery.empty) {
            panelDoc = panelQuery.docs[0];
            console.log(`✅ Panel encontrado por código para updateChange. docId: ${panelDoc.id}`);
        } else {
            console.warn(`⚠️ Panel ${panelIdStr} no encontrado por código en updateChange. Intentando docId directo...`);
            const byIdSnapshot = await db.collection('paneles').doc(panelIdStr).get();
            if (!byIdSnapshot.exists) {
                throw new Error(`Panel ${panelIdStr} no encontrado`);
            }
            panelDoc = byIdSnapshot;
            console.log(`✅ Panel encontrado por docId directo para updateChange. docId: ${panelDoc.id}`);
        }
        
        const changeRef = panelDoc.ref.collection('changes').doc(changeId);
        const changeSnapshot = await changeRef.get();
        
        if (!changeSnapshot.exists) {
            throw new Error(`Evento ${changeId} no encontrado`);
        }
        
        const oldChange = changeSnapshot.data();
        const monthKey = oldChange.monthKey;
        
        // Eliminar el evento viejo y aplicar el nuevo
        await deleteChange(panelId, changeId, { skipRebuild: true });
        await applyChange(panelId, newPayload);
        
        // Reconstruir facturación del mes
        await rebuildMonthlyBilling(monthKey);
        
        console.log(`✅ Evento actualizado exitosamente`);
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error actualizando evento:', error);
        throw error;
    }
}

/**
 * Elimina un evento y recalcula facturación
 */
async function deleteChange(panelId, changeId, options = {}) {
    try {
        console.log(`🗑️ Eliminando evento ${changeId} del panel ${panelId}`);
        
        const panelIdStr = String(panelId).trim();
        const panelIdNum = !isNaN(Number(panelIdStr)) ? Number(panelIdStr) : null;
        
        // Buscar panel (por código string, numérico y fallback por docId directo)
        let panelQuery = await db.collection('paneles')
            .where('codigo', '==', panelIdStr)
            .limit(1)
            .get();

        if (panelQuery.empty && panelIdNum !== null) {
            panelQuery = await db.collection('paneles')
                .where('codigo', '==', panelIdNum)
                .limit(1)
                .get();
        }

        let panelDoc;
        if (!panelQuery.empty) {
            panelDoc = panelQuery.docs[0];
            console.log(`✅ Panel encontrado por código para deleteChange. docId: ${panelDoc.id}`);
        } else {
            console.warn(`⚠️ Panel ${panelIdStr} no encontrado por código en deleteChange. Intentando docId directo...`);
            const byIdSnapshot = await db.collection('paneles').doc(panelIdStr).get();
            if (!byIdSnapshot.exists) {
                throw new Error(`Panel ${panelIdStr} no encontrado`);
            }
            panelDoc = byIdSnapshot;
            console.log(`✅ Panel encontrado por docId directo para deleteChange. docId: ${panelDoc.id}`);
        }

        const changeRef = panelDoc.ref.collection('changes').doc(changeId);
        const changeSnapshot = await changeRef.get();
        
        if (!changeSnapshot.exists) {
            throw new Error(`Evento ${changeId} no encontrado`);
        }
        
        const changeData = changeSnapshot.data();
        const monthKey = changeData.monthKey;
        
        // Eliminar el documento del evento
        await changeRef.delete();
        
        console.log(`✅ Evento eliminado de Firestore`);
        
        // Reconstruir facturación del mes (a menos que skipRebuild esté activo)
        if (!options.skipRebuild) {
            await rebuildMonthlyBilling(monthKey);
            console.log(`✅ Facturación del mes ${monthKey} reconstruida`);
        }
        
        return { success: true, monthKey };
        
    } catch (error) {
        console.error('❌ Error eliminando evento:', error);
        throw error;
    }
}

/**
 * Obtiene todos los eventos de un panel
 */
async function getPanelChanges(panelId, monthKey = null) {
    try {
        console.log(`📋 Obteniendo eventos del panel ${panelId}, monthKey: ${monthKey}`);
        
        const panelIdStr = String(panelId).trim();
        const panelIdNum = !isNaN(Number(panelIdStr)) ? Number(panelIdStr) : null;
        
        // Buscar panel por codigo (string/num) y, si no aparece, intentar por docId directo (fallback)
        let panelDocRef = null;
        let panelQuery = await db.collection('paneles')
            .where('codigo', '==', panelIdStr)
            .limit(1)
            .get();
        
        if (panelQuery.empty && panelIdNum !== null) {
            panelQuery = await db.collection('paneles')
                .where('codigo', '==', panelIdNum)
                .limit(1)
                .get();
        }
        
        if (!panelQuery.empty) {
            panelDocRef = panelQuery.docs[0].ref;
            console.log(`✅ Panel encontrado por código. docId: ${panelDocRef.id}`);
        } else {
            // Fallback: intentar por docId exacto
            console.warn(`⚠️ Panel no encontrado por código (${panelIdStr}). Intentando docId directo...`);
            const byIdSnapshot = await db.collection('paneles').doc(panelIdStr).get();
            if (byIdSnapshot.exists) {
                panelDocRef = byIdSnapshot.ref;
                console.log(`✅ Panel encontrado por docId: ${panelDocRef.id}`);
            } else {
                console.log(`❌ Panel ${panelIdStr} no encontrado (código ni docId)`);
                return [];
            }
        }
        
        let changesSnapshot;
        
        try {
            // Intentar con ordenamiento
            let query = panelDocRef.collection('changes');
            
            if (monthKey) {
                query = query.where('monthKey', '==', monthKey);
            }
            
            query = query.orderBy('effectiveDate', 'desc');
            changesSnapshot = await query.get();
            
        } catch (error) {
            // Si falla por falta de índice, intentar sin ordenamiento
            console.warn('⚠️ No se puede ordenar, intentando sin orderBy:', error.message);
            
            let query = panelDocRef.collection('changes');
            
            if (monthKey) {
                query = query.where('monthKey', '==', monthKey);
            }
            
            changesSnapshot = await query.get();
        }
        
        const changes = [];
        
        changesSnapshot.forEach(doc => {
            changes.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Ordenar manualmente si se obtuvieron resultados
        changes.sort((a, b) => {
            const dateA = a.effectiveDate?.toDate ? a.effectiveDate.toDate() : new Date(a.effectiveDate);
            const dateB = b.effectiveDate?.toDate ? b.effectiveDate.toDate() : new Date(b.effectiveDate);
            return dateB - dateA; // Descendente (más reciente primero)
        });
        
        console.log(`✅ ${changes.length} eventos encontrados para panel ${panelIdStr} (doc: ${panelDocRef.id}) en mes ${monthKey || 'todos'}`);
        return changes;
        
    } catch (error) {
        console.error('❌ Error obteniendo eventos:', error);
        return [];
    }
}

// ===== EXPORTAR FUNCIONES =====
window.BillingService = {
    // Funciones principales
    getPanelEffectiveState,
    previewChange,
    applyChange,
    getMonthBillingSummary,
    getPanelChanges,
    updateChange,
    deleteChange,
    
    // Utilidades
    calcularDiasFacturables,
    calcularImporteFacturar,
    validateStateTransition,
    validateDateRanges,
    
    // Migración
    rebuildMonthlyBilling,
    migrateBillingSummary,
    
    // Constantes
    PANEL_STATES,
    CHANGE_ACTIONS,
    TARIFA_BASE_2025,
    
    // Formateadores
    formatDateKey,
    formatDateISO,
    generateIdempotencyKey
};

console.log('🧮 BillingService cargado correctamente');