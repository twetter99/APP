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
 */
function validateDateRanges(effectiveRanges, newDate, action) {
    // Convertir fecha a formato comparable
    const newDateISO = formatDateISO(newDate);
    
    for (const range of effectiveRanges || []) {
        const rangeStart = range.from;
        const rangeEnd = range.to; // null si está activo
        
        // Verificar solapamientos
        if (rangeEnd === null) {
            // Rango activo - verificar si la nueva fecha es posterior
            if (newDateISO <= rangeStart && action !== CHANGE_ACTIONS.BAJA_DEFINITIVA) {
                return {
                    valid: false,
                    error: `Fecha ${newDateISO} anterior al inicio del rango activo ${rangeStart}`
                };
            }
        } else {
            // Rango cerrado - verificar si hay solapamiento
            if (newDateISO >= rangeStart && newDateISO <= rangeEnd) {
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
        console.log(`🔍 Obteniendo estado efectivo para panel ${panelId} en fecha ${formatDateISO(date)}`);
        
        // Obtener datos del panel desde Firestore
        const panelDoc = await db.collection('panels').doc(panelId).get();
        
        if (!panelDoc.exists) {
            return {
                exists: false,
                state: null,
                tarifa: TARIFA_BASE_2025
            };
        }
        
        const panelData = panelDoc.data();
        const targetDate = formatDateISO(date);
        
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
                    range: range
                };
            }
        }
        
        // Si no se encuentra en rangos, el panel no existía en esa fecha
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
        const changesQuery = await db.collection('panels').doc(panelId)
            .collection('changes')
            .where('monthKey', '==', monthKey)
            .get();
        
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
        console.log(`🔄 Aplicando cambio para panel ${panelId}:`, payload);
        
        const { action, effectiveDate, motivo, tarifaBaseMes, uid, email } = payload;
        
        // Generar clave de idempotencia
        const idempotencyKey = generateIdempotencyKey(panelId, action, effectiveDate);
        
        // Ejecutar transacción
        const result = await db.runTransaction(async (transaction) => {
            // 1. Verificar idempotencia
            const changeDoc = db.collection('panels').doc(panelId)
                .collection('changes').doc(idempotencyKey);
            const existingChange = await transaction.get(changeDoc);
            
            if (existingChange.exists) {
                console.log('ℹ️ Cambio ya aplicado (idempotencia)');
                return { success: true, duplicate: true, data: existingChange.data() };
            }
            
            // 2. Obtener estado actual
            const panelDoc = db.collection('panels').doc(panelId);
            const panelSnapshot = await transaction.get(panelDoc);
            
            const currentData = panelSnapshot.exists ? panelSnapshot.data() : {
                codigo: panelId,
                estadoActual: null,
                effectiveRanges: [],
                tarifaBaseMes: TARIFA_BASE_2025
            };
            
            // 3. Validar transición
            const stateValidation = validateStateTransition(currentData.estadoActual, action);
            if (!stateValidation.valid) {
                throw new Error(stateValidation.error);
            }
            
            // 4. Validar rangos de fecha
            const rangeValidation = validateDateRanges(
                currentData.effectiveRanges, 
                effectiveDate, 
                action
            );
            if (!rangeValidation.valid) {
                throw new Error(rangeValidation.error);
            }
            
            // 5. Calcular impacto
            const preview = await previewChange(panelId, action, effectiveDate, payload);
            if (!preview.valid) {
                throw new Error(preview.error);
            }
            
            const changeData = preview.preview;
            
            // 6. Crear evento de cambio
            const changeRecord = {
                action: action,
                effectiveDate: firebase.firestore.Timestamp.fromDate(new Date(effectiveDate)),
                monthKey: changeData.monthKey,
                motivo: motivo || null,
                tarifaBaseMes: tarifaBaseMes || currentData.tarifaBaseMes || TARIFA_BASE_2025,
                diasFacturables: changeData.diasFacturables,
                importeAFacturar: changeData.importeAFacturar,
                snapshotBefore: {
                    estadoActual: currentData.estadoActual,
                    tarifaBaseMes: currentData.tarifaBaseMes
                },
                snapshotAfter: {
                    estadoActual: stateValidation.newState,
                    tarifaBaseMes: tarifaBaseMes || currentData.tarifaBaseMes
                },
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: { uid, email },
                idempotencyKey: idempotencyKey
            };
            
            transaction.set(changeDoc, changeRecord);
            
            // 7. Actualizar estado del panel
            const newEffectiveRanges = [...(currentData.effectiveRanges || [])];
            const dateISO = formatDateISO(effectiveDate);
            
            // Actualizar rangos según la acción
            if (action === CHANGE_ACTIONS.ALTA) {
                newEffectiveRanges.push({
                    from: dateISO,
                    to: null,
                    estado: PANEL_STATES.ACTIVO
                });
            } else if (action === CHANGE_ACTIONS.DESMONTAJE_TEMPORAL) {
                // Cerrar rango activo y crear nuevo desmontado
                const activeRange = newEffectiveRanges.find(r => r.to === null);
                if (activeRange) {
                    activeRange.to = dateISO;
                }
                newEffectiveRanges.push({
                    from: dateISO,
                    to: null,
                    estado: PANEL_STATES.DESMONTADO
                });
            } else if (action === CHANGE_ACTIONS.REINSTALACION) {
                // Cerrar rango desmontado y crear nuevo activo
                const desmontadoRange = newEffectiveRanges.find(r => r.to === null && r.estado === PANEL_STATES.DESMONTADO);
                if (desmontadoRange) {
                    desmontadoRange.to = dateISO;
                }
                newEffectiveRanges.push({
                    from: dateISO,
                    to: null,
                    estado: PANEL_STATES.ACTIVO
                });
            } else if (action === CHANGE_ACTIONS.BAJA_DEFINITIVA) {
                // Cerrar todos los rangos activos
                newEffectiveRanges.forEach(range => {
                    if (range.to === null) {
                        range.to = dateISO;
                    }
                });
                newEffectiveRanges.push({
                    from: dateISO,
                    to: null,
                    estado: PANEL_STATES.BAJA
                });
            }
            
            const updatedPanelData = {
                ...currentData,
                estadoActual: stateValidation.newState,
                effectiveRanges: newEffectiveRanges,
                tarifaBaseMes: tarifaBaseMes || currentData.tarifaBaseMes || TARIFA_BASE_2025,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: { uid, email }
            };
            
            transaction.set(panelDoc, updatedPanelData, { merge: true });
            
            // 8. Actualizar facturación mensual del panel
            const monthBillingDoc = db.collection('panel_month_billing')
                .doc(`${panelId}_${changeData.monthKey.replace('-', '')}`);
            
            const monthBillingSnapshot = await transaction.get(monthBillingDoc);
            const currentBilling = monthBillingSnapshot.exists ? monthBillingSnapshot.data() : {
                panelId: panelId,
                monthKey: changeData.monthKey,
                totalDiasFacturables: 0,
                totalImporte: 0,
                acciones: {}
            };
            
            currentBilling.totalDiasFacturables += changeData.diasFacturables;
            currentBilling.totalImporte += changeData.importeAFacturar;
            currentBilling.acciones[action] = (currentBilling.acciones[action] || 0) + 1;
            currentBilling.lastChangeAt = firebase.firestore.FieldValue.serverTimestamp();
            currentBilling.lastChangeBy = { uid, email };
            
            transaction.set(monthBillingDoc, currentBilling);
            
            // 9. Recalcular resumen global del mes correctamente
            // En lugar de sumar incrementalmente, recalcular desde panel_month_billing
            const summaryDoc = db.collection('billing_summary').doc(changeData.monthKey.replace('-', ''));
            
            // Obtener todos los panel_month_billing del mes para recalcular totales
            const monthPrefix = changeData.monthKey.replace('-', '');
            const monthBillingQuery = await db.collection('panel_month_billing')
                .where('monthKey', '==', changeData.monthKey)
                .get();
            
            let totalImporteMes = 0;
            let totalPanelesFacturables = 0;
            let totalAcciones = 0;
            
            // Incluir el panel actual que acabamos de actualizar
            const allPanelBilling = [currentBilling];
            
            // Agregar el resto de paneles del mes (excluyendo el actual para evitar duplicados)
            monthBillingQuery.forEach(doc => {
                const data = doc.data();
                if (data.panelId !== panelId) {
                    allPanelBilling.push(data);
                }
            });
            
            // Calcular totales reales
            allPanelBilling.forEach(billing => {
                totalImporteMes += billing.totalImporte || 0;
                if (billing.totalDiasFacturables > 0) {
                    totalPanelesFacturables += 1;
                }
                // Contar todas las acciones
                Object.values(billing.acciones || {}).forEach(count => {
                    totalAcciones += count;
                });
            });
            
            const updatedSummary = {
                monthKey: changeData.monthKey,
                totalPanelesFacturables: totalPanelesFacturables,
                totalImporteMes: Math.round(totalImporteMes * 100) / 100, // Redondeo bancario
                totalAcciones: totalAcciones,
                lastChangeAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastChangeBy: { uid, email }
            };
            
            transaction.set(summaryDoc, updatedSummary);
            
            return {
                success: true,
                duplicate: false,
                data: {
                    changeRecord,
                    updatedPanel: updatedPanelData,
                    billing: currentBilling,
                    summary: updatedSummary
                }
            };
        });
        
        console.log('✅ Cambio aplicado exitosamente:', result);
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
        
        // Obtener todos los cambios del mes
        const changesQuery = await db.collectionGroup('changes')
            .where('monthKey', '==', monthKey)
            .get();
        
        const billingByPanel = {};
        let totalImporte = 0;
        let totalAcciones = 0;
        
        changesQuery.forEach(doc => {
            const change = doc.data();
            const panelId = doc.ref.parent.parent.id;
            
            if (!billingByPanel[panelId]) {
                billingByPanel[panelId] = {
                    panelId: panelId,
                    monthKey: monthKey,
                    totalDiasFacturables: 0,
                    totalImporte: 0,
                    acciones: {}
                };
            }
            
            const billing = billingByPanel[panelId];
            billing.totalDiasFacturables += change.diasFacturables || 0;
            billing.totalImporte += change.importeAFacturar || 0;
            billing.acciones[change.action] = (billing.acciones[change.action] || 0) + 1;
            billing.lastChangeAt = change.createdAt;
            billing.lastChangeBy = change.createdBy;
            
            totalImporte += change.importeAFacturar || 0;
            totalAcciones += 1;
        });
        
        // Actualizar documentos en lote
        const batch = db.batch();
        
        // Actualizar facturación por panel
        Object.values(billingByPanel).forEach(billing => {
            const docRef = db.collection('panel_month_billing')
                .doc(`${billing.panelId}_${monthKey.replace('-', '')}`);
            batch.set(docRef, billing);
        });
        
        // Actualizar resumen global
        const summaryRef = db.collection('billing_summary').doc(monthKey.replace('-', ''));
        batch.set(summaryRef, {
            monthKey: monthKey,
            totalPanelesFacturables: Object.keys(billingByPanel).length,
            totalImporteMes: totalImporte,
            totalAcciones: totalAcciones,
            lastChangeAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await batch.commit();
        
        console.log(`✅ Reconstrucción completada para ${monthKey}:`, {
            paneles: Object.keys(billingByPanel).length,
            totalImporte: totalImporte,
            totalAcciones: totalAcciones
        });
        
        return {
            success: true,
            paneles: Object.keys(billingByPanel).length,
            totalImporte: totalImporte,
            totalAcciones: totalAcciones
        };
        
    } catch (error) {
        console.error('❌ Error en reconstrucción:', error);
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

// ===== EXPORTAR FUNCIONES =====
window.BillingService = {
    // Funciones principales
    getPanelEffectiveState,
    previewChange,
    applyChange,
    getMonthBillingSummary,
    
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