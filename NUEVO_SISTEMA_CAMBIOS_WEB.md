# ✅ NUEVO SISTEMA DE CAMBIOS MENSUALES - INTERFAZ WEB

## 🎯 DESCRIPCIÓN GENERAL

Se ha reemplazado completamente el sistema de importación de Excel por una interfaz web profesional con formularios interactivos y cálculo automático de facturación en tiempo real.

## 🚀 URL DE LA APLICACIÓN

**Producción:** https://piv-manager.web.app

---

## 📋 CARACTERÍSTICAS PRINCIPALES

### 1️⃣ Botón Único con Menú Desplegable

En lugar de múltiples botones, ahora hay un único botón **"📋 Cambios del Mes ▼"** que despliega un menú con 5 opciones:

- 🟢 **Alta de Panel Nuevo** (verde)
- 🔵 **Reinstalación de Panel** (azul)
- 🔴 **Baja Definitiva de Panel** (rojo)
- 🟠 **Desmontaje Temporal** (naranja)
- 🟣 **Cambio de Tarifa** (morado)

### 2️⃣ Modales Interactivos

Cada opción abre un **modal especializado** con:

✅ Formularios intuitivos
✅ Validación en tiempo real
✅ Vista previa de facturación **AUTOMÁTICA**
✅ Búsqueda inteligente de paneles
✅ Diseño adaptado al tipo de cambio

### 3️⃣ Cálculo Automático de Facturación

La función core `calcularFacturacion()` maneja todos los casos:

- ✅ Mes completo: 30 días × 1.2567€/día = 37.70€
- ✅ Instalación parcial: días desde instalación
- ✅ Desmontaje parcial: días hasta desmontaje
- ✅ Instalación + Desmontaje mismo mes: días entre ambas fechas
- ✅ Panel inactivo: 0€

### 4️⃣ Actualización Automática del Dashboard

Después de **cada cambio**, el dashboard se recalcula automáticamente:

- 📊 Total de paneles
- 💰 Facturación total
- 🏘️ Municipios únicos
- 📉 Paneles parciales

---

## 🎨 DETALLE DE CADA MODAL

### 🟢 MODAL: ALTA DE PANEL NUEVO

**Campos:**
- Municipio (dropdown con municipios existentes)
- Código del panel (validación de duplicados)
- Fecha de instalación (datepicker)
- Observaciones (opcional)

**Vista Previa:**
```
💰 Vista Previa de Facturación
├─ Tarifa mensual base: 37,70 €
├─ Días a facturar: [calculado]
├─ Tarifa diaria: 1,26 €/día
└─ Total a facturar: [calculado]
```

**Validaciones:**
- ❌ No permite códigos duplicados
- ✅ Municipio obligatorio
- ✅ Código obligatorio
- ✅ Fecha obligatoria

**Guardado:**
- ✅ Se guarda en Firestore
- ✅ Se añade a `panelsData`
- ✅ Se registra en `monthlyChanges`
- ✅ Se actualiza tabla y dashboard

---

### 🔵 MODAL: REINSTALACIÓN DE PANEL

**Campos:**
- Búsqueda inteligente (solo paneles desmontados)
- Panel seleccionado (info completa)
- Fecha de reinstalación
- Checkbox: "Cambiar municipio"
- Nuevo municipio (condicional)

**Vista Previa:**
```
💰 Comparación de Facturación
├─ Sin reinstalación: 0,00 €
├─ Con reinstalación: [calculado]
└─ Diferencia: +[calculado] (verde)
```

**Validaciones:**
- ✅ Solo muestra paneles con `fechaDesmontaje`
- ✅ Si cambia municipio, debe seleccionar uno nuevo
- ✅ Panel obligatorio
- ✅ Fecha obligatoria

**Guardado:**
- ✅ Elimina `fechaDesmontaje`
- ✅ Actualiza `fechaInstalacion`
- ✅ Cambia `municipio` si aplica
- ✅ Se registra en `monthlyChanges`

---

### 🔴 MODAL: BAJA DEFINITIVA

**Campos:**
- Búsqueda inteligente (solo paneles activos)
- Panel seleccionado
- Motivo (dropdown):
  - Fin de contrato
  - Avería irreparable
  - Vandalismo
  - Decisión del cliente
  - Otro
- Checkbox de confirmación (obligatorio)

**Vista Previa:**
```
💰 Impacto en Facturación
├─ Facturación mensual actual: 37,70 €
├─ Facturación después de baja: 0,00 €
└─ Pérdida mensual: -37,70 € (rojo)
```

**Advertencia:**
```
⚠️ Atención: Esta acción es definitiva.
El panel dejará de facturarse desde este mes en adelante.
La facturación de meses anteriores se conserva.
```

**Validaciones:**
- ✅ Solo paneles sin `fechaDesmontaje`
- ✅ Motivo obligatorio
- ✅ Confirmación obligatoria

**Guardado:**
- ❌ **Elimina el panel** de `panelsData`
- ✅ Se registra en `monthlyChanges`
- ✅ Dashboard se recalcula

---

### 🟠 MODAL: DESMONTAJE TEMPORAL

**Campos:**
- Búsqueda inteligente (solo paneles activos)
- Panel seleccionado
- Fecha de desmontaje (por defecto hoy)
- Motivo (dropdown):
  - Mantenimiento
  - Reparación
  - Actualización técnica
  - Inactividad temporal
  - Otro

**Vista Previa:**
```
💰 Ajuste de Facturación
├─ Facturación mes completo: 37,70 €
├─ Días activos en el mes: [calculado]
├─ Facturación ajustada: [calculado]
└─ Ahorro por desmontaje: [calculado] (rojo)
```

**Ejemplo:**
Si se desmonta el día 15:
- Días activos: 15
- Facturación: 15 × 1.2567€ = 18.85€
- Ahorro: 37.70€ - 18.85€ = 18.85€

**Guardado:**
- ✅ Añade `fechaDesmontaje`
- ✅ Panel sigue existiendo (solo inactivo)
- ✅ Puede reinstalarse más tarde
- ✅ Se registra en `monthlyChanges`

---

### 🟣 MODAL: CAMBIO DE TARIFA

**Campos:**
- Búsqueda inteligente (solo paneles activos)
- Panel seleccionado (muestra tarifa actual)
- Nueva tarifa mensual (€)
- Alcance (radio buttons):
  - ⭕ Solo este panel
  - ⭕ Todos los paneles del mismo municipio
  - ⭕ Todos los paneles (cambio global)

**Vista Previa:**
```
💰 Impacto del Cambio
├─ Tarifa actual: 37,70 €
├─ Nueva tarifa: [ingresada]
├─ Paneles afectados: [calculado]
└─ Variación total: +[calculado] (verde/rojo)
```

**Ejemplo:**
Nueva tarifa: 42.50€
Alcance: Todos del municipio (10 paneles)
- Paneles afectados: 10
- Variación por panel: +4.80€
- **Variación total: +48.00€** (verde)

**Guardado:**
- ✅ Actualiza `tarifa` en paneles afectados
- ✅ Si es global, actualiza TODOS los paneles
- ✅ Si es por municipio, solo ese municipio
- ✅ Se registra con lista de códigos afectados
- ✅ Dashboard recalcula con nuevas tarifas

---

## 🔍 BÚSQUEDA INTELIGENTE

Implementada en 4 de los 5 modales (todos excepto Alta):

**Características:**
- ⚡ Búsqueda en tiempo real (oninput)
- 🔎 Busca por código O municipio
- 📋 Resultados con info completa:
  ```
  PIV-001                    ← Código (azul, negrita)
  Madrid • Desmontado: 15/11/2025  ← Info secundaria (gris)
  ```
- ✅ Selección con un click
- 🎯 Filtrado contextual:
  - **Reinstalación**: Solo paneles desmontados
  - **Baja/Desmontaje/Tarifa**: Solo paneles activos

**Funcionamiento:**
```javascript
function buscarPanel(modalType) {
    // Mínimo 2 caracteres
    if (query.length < 2) return;
    
    // Filtrar según tipo
    if (modalType === 'reinstalacion') {
        resultados = paneles CON fechaDesmontaje
    } else {
        resultados = paneles SIN fechaDesmontaje
    }
    
    // Mostrar resultados
    mostrarEnDropdown();
}
```

---

## 💾 REGISTRO DE CAMBIOS

Cada cambio se registra en `localStorage` con esta estructura:

```javascript
monthlyChanges = {
    "2025-11": [
        {
            tipo: "ALTA",
            codigo: "PIV-123",
            municipio: "Madrid",
            fecha: "2025-11-15",
            observaciones: "Panel nuevo instalado",
            timestamp: "2025-11-15T10:30:00.000Z"
        },
        {
            tipo: "REINSTALACION",
            codigo: "PIV-045",
            municipio: "Barcelona",
            municipioAnterior: "Valencia",
            fecha: "2025-11-20",
            timestamp: "2025-11-20T14:15:00.000Z"
        },
        {
            tipo: "BAJA",
            codigo: "PIV-789",
            municipio: "Sevilla",
            motivo: "fin_contrato",
            timestamp: "2025-11-25T09:00:00.000Z"
        },
        {
            tipo: "DESMONTAJE",
            codigo: "PIV-456",
            municipio: "Madrid",
            fecha: "2025-11-28",
            motivo: "mantenimiento",
            timestamp: "2025-11-28T11:45:00.000Z"
        },
        {
            tipo: "CAMBIO_TARIFA",
            alcance: "todos_municipio",
            nuevaTarifa: 42.50,
            panelesAfectados: ["PIV-001", "PIV-002", ...],
            municipio: "Madrid",
            timestamp: "2025-11-30T16:20:00.000Z"
        }
    ]
}
```

**Visualización:**
El botón **"📝 Ver Cambios Mensuales"** muestra un histórico completo con:
- 📅 Mes y año
- 📊 Resumen de cambios por tipo
- 📝 Detalles de cada cambio
- 🕐 Fecha y hora de registro

---

## 🎯 FUNCIÓN CORE: `calcularFacturacion()`

**Firma:**
```javascript
function calcularFacturacion(panel, mes, año) {
    return {
        dias: number,           // Días facturables
        importe: number,        // Importe en €
        tipo: string,           // Tipo de facturación
        tarifaDiaria: number,   // Tarifa diaria
        desde: string|null,     // Fecha desde
        hasta: string|null      // Fecha hasta
    };
}
```

**Lógica:**

```javascript
tarifaDiaria = (panel.tarifa || 37.70) / 30

// CASO 1: Instalación este mes
if (fechaInstalacion en este mes) {
    diasFacturables = 30 - diaInstalacion + 1
    tipo = "parcial_instalacion"
}

// CASO 2: Desmontaje este mes
if (fechaDesmontaje en este mes) {
    diasFacturables = diaDesmontaje
    tipo = "parcial_desmontaje"
}

// CASO 3: Instalación Y desmontaje este mes
if (ambos en este mes) {
    diasFacturables = diaDesmontaje - diaInstalacion + 1
    tipo = "parcial_instalacion_desmontaje"
}

// CASO 4: No instalado aún
if (fechaInstalacion > este mes) {
    diasFacturables = 0
    tipo = "inactivo"
}

// CASO 5: Ya desmontado antes
if (fechaDesmontaje < este mes) {
    diasFacturables = 0
    tipo = "inactivo"
}

// CASO 6: Mes completo (default)
else {
    diasFacturables = 30
    tipo = "completo"
}

importe = diasFacturables × tarifaDiaria
```

**Ejemplos:**

1. **Panel instalado día 10 de noviembre:**
   ```
   diasFacturables = 30 - 10 + 1 = 21 días
   importe = 21 × 1.2567 = 26.39€
   ```

2. **Panel desmontado día 15:**
   ```
   diasFacturables = 15 días
   importe = 15 × 1.2567 = 18.85€
   ```

3. **Instalado día 5 y desmontado día 20:**
   ```
   diasFacturables = 20 - 5 + 1 = 16 días
   importe = 16 × 1.2567 = 20.11€
   ```

---

## 📊 FUNCIÓN: `actualizarDashboard()`

Se ejecuta **automáticamente** después de cada cambio:

```javascript
function actualizarDashboard() {
    const mes = getCurrentMonth();
    const año = getCurrentYear();
    
    // Contadores
    let totalPaneles = 0;
    let facturacionTotal = 0;
    let panelesParciales = 0;
    const municipiosUnicos = new Set();
    
    panelsData.forEach(panel => {
        const facturacion = calcularFacturacion(panel, mes, año);
        
        // Solo contar paneles ACTIVOS este mes
        if (facturacion.importe > 0) {
            totalPaneles++;
            facturacionTotal += facturacion.importe;
            municipiosUnicos.add(panel.municipio);
            
            if (facturacion.dias < 30) {
                panelesParciales++;
            }
        }
    });
    
    // Actualizar DOM
    document.getElementById('totalPanels').textContent = totalPaneles;
    document.getElementById('totalRevenue').textContent = facturacionTotal.toFixed(2) + ' €';
    document.getElementById('totalMunicipios').textContent = municipiosUnicos.size;
    document.getElementById('partialPanels').textContent = panelesParciales;
}
```

**Se llama desde:**
- ✅ `guardarAlta()`
- ✅ `guardarReinstalacion()`
- ✅ `guardarBaja()`
- ✅ `guardarDesmontaje()`
- ✅ `guardarCambioTarifa()`
- ✅ `recargarDesdeFirestore()`

---

## 🗑️ CÓDIGO ELIMINADO

### ❌ Funciones removidas:
- `processMonthlyChanges()` (procesamiento de Excel)
- `importData()` (importación CSV/JSON)
- `parseExcelDate()` (conversión de fechas Excel)

### ❌ Librerías removidas:
- SheetJS (xlsx.full.min.js)

### ❌ Botones removidos:
- "Procesar Cambios Mensuales"
- "Importar Datos"
- "Añadir Panel"
- "Quitar Panel"
- "Desmontar Panel"

### ✅ Botones conservados:
- "📋 Cambios del Mes" (NUEVO - reemplaza a todos los anteriores)
- "📥 Exportar Excel"
- "📊 Ver Histórico Mensual"
- "📝 Ver Cambios Mensuales"
- "💾 Exportar Histórico Completo"
- "💾 Backup Completo (JSON)"
- "🔄 Recargar Datos desde Firestore"

---

## 🎨 ESTILOS CSS AÑADIDOS

### Botón principal:
```css
.btn-primary-large {
    background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
    box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
    /* Efecto hover: sube 2px */
}
```

### Dropdown menu:
```css
.dropdown-menu {
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.3s ease;
}

.dropdown-menu.show {
    opacity: 1;
    transform: translateY(0);
}
```

### Items del dropdown (con colores por tipo):
```css
.dropdown-item[data-action="alta"] {
    color: #166534;
    background-hover: #F0FDF4;
}

.dropdown-item[data-action="baja"] {
    color: #991B1B;
    background-hover: #FEF2F2;
}
/* etc... */
```

### Modales:
```css
.modal-overlay {
    background: rgba(0, 0, 0, 0.6);
    /* Animación de entrada */
}

.modal-content {
    transform: scale(0.9);
    transition: transform 0.3s ease;
}

.modal-overlay.show .modal-content {
    transform: scale(1);
}
```

### Vista previa de facturación:
```css
.billing-preview {
    background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);
    border: 2px solid #BAE6FD;
}
```

### Búsqueda inteligente:
```css
.search-results {
    max-height: 300px;
    overflow-y: auto;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.search-result-item:hover {
    background: #F9FAFB;
}
```

---

## 🔐 INTEGRACIÓN CON FIRESTORE

Cada modal guarda en Firestore usando:

```javascript
if (window.firebaseDB) {
    const { collection, addDoc } = await import(
        'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
    );
    
    await addDoc(collection(window.firebaseDB, 'paneles'), nuevoPanel);
}
```

**Datos guardados:**
- `municipio`
- `codigo`
- `tarifa` (37.70 por defecto)
- `fechaInstalacion` (si aplica)
- `fechaDesmontaje` (si aplica)
- `observaciones` (opcional)

---

## 📱 RESPONSIVE DESIGN

Todos los modales y el dropdown son completamente responsivos:

```css
@media (max-width: 768px) {
    .modal-content {
        width: 95%;
        max-width: none;
    }
    
    .dropdown-menu {
        min-width: 100%;
    }
}
```

---

## ✅ VENTAJAS DEL NUEVO SISTEMA

### 🎯 Vs. Sistema Excel Anterior:

| Característica | Excel | Nuevo Sistema Web |
|----------------|-------|-------------------|
| **Interfaz** | Importar archivo | Formularios interactivos |
| **Facturación** | Manual | **Automática en tiempo real** |
| **Validación** | Post-procesamiento | **Pre-validación** |
| **UX** | 6 botones | **1 botón → 5 opciones** |
| **Errores** | Detectados después | **Prevenidos antes** |
| **Búsqueda** | Manual en Excel | **Búsqueda inteligente** |
| **Dashboard** | Actualización manual | **Actualización automática** |
| **Dependencias** | SheetJS | **Sin dependencias** |
| **Mobile** | No funcional | **Completamente responsive** |

---

## 🚀 CÓMO USAR EL NUEVO SISTEMA

### 1️⃣ DAR DE ALTA UN PANEL NUEVO

1. Click en **"📋 Cambios del Mes"**
2. Seleccionar **🟢 Alta de Panel Nuevo**
3. Rellenar formulario:
   - Municipio
   - Código (se valida duplicado)
   - Fecha de instalación
   - Observaciones (opcional)
4. Revisar vista previa de facturación
5. Click en **"✅ Dar de Alta"**
6. ✅ Panel añadido + Dashboard actualizado

### 2️⃣ REINSTALAR UN PANEL DESMONTADO

1. Click en **"📋 Cambios del Mes"**
2. Seleccionar **🔵 Reinstalación de Panel**
3. Buscar panel (solo muestra desmontados)
4. Seleccionar panel
5. Fecha de reinstalación
6. (Opcional) Cambiar municipio
7. Revisar comparación de facturación
8. Click en **"✅ Confirmar Reinstalación"**
9. ✅ Panel reactivado + Dashboard actualizado

### 3️⃣ DAR DE BAJA UN PANEL DEFINITIVAMENTE

1. Click en **"📋 Cambios del Mes"**
2. Seleccionar **🔴 Baja Definitiva de Panel**
3. Buscar panel activo
4. Seleccionar motivo
5. **Leer advertencia**
6. ☑️ Marcar checkbox de confirmación
7. Revisar impacto en facturación
8. Click en **"🗑️ Dar de Baja"**
9. ❌ Panel eliminado + Dashboard actualizado

### 4️⃣ DESMONTAR TEMPORALMENTE

1. Click en **"📋 Cambios del Mes"**
2. Seleccionar **🟠 Desmontaje Temporal**
3. Buscar panel activo
4. Fecha de desmontaje (hoy por defecto)
5. Seleccionar motivo
6. Revisar ajuste de facturación
7. Click en **"✅ Confirmar Desmontaje"**
8. 📦 Panel desmontado (puede reinstalarse) + Dashboard actualizado

### 5️⃣ CAMBIAR TARIFA

1. Click en **"📋 Cambios del Mes"**
2. Seleccionar **🟣 Cambio de Tarifa**
3. Buscar panel (o elegir alcance global)
4. Ingresar nueva tarifa
5. Seleccionar alcance:
   - Solo este panel
   - Todo el municipio
   - **Todos los paneles**
6. Revisar impacto y variación
7. Click en **"✅ Aplicar Cambio"**
8. 💰 Tarifas actualizadas + Dashboard actualizado

---

## 🔍 VISUALIZACIÓN DE CAMBIOS

### Ver Cambios del Mes Actual:

1. Click en **"📝 Ver Cambios Mensuales"**
2. Se abre modal con:
   - 📅 Listado por mes (más reciente primero)
   - 📊 Resumen: X altas, Y bajas, Z desmontajes, W cambios tarifa
   - 📝 Detalle de cada cambio:
     - Tipo (color-coded)
     - Código de panel
     - Municipio
     - Fecha/hora
     - Info específica del tipo

**Ejemplo visualización:**

```
NOVIEMBRE 2025
Procesado: 30/11/2025 16:30
───────────────────────────
📈 Altas: 5
📉 Bajas: 2
📦 Desmontajes: 3
💰 Cambios tarifa: 1

Detalles:
─────────
🟢 ALTA
   PIV-123 • Madrid
   15/11/2025 10:30
   
🔵 REINSTALACIÓN
   PIV-045 • Barcelona (antes: Valencia)
   20/11/2025 14:15
   
🔴 BAJA
   PIV-789 • Sevilla
   Motivo: Fin de contrato
   25/11/2025 09:00
```

---

## 🎓 NOTAS TÉCNICAS

### Event Listeners:

```javascript
document.addEventListener('DOMContentLoaded', () => {
    // Vista previa alta
    altaFecha.addEventListener('change', actualizarVistaPreviewAlta);
    
    // Vista previa desmontaje
    desmontajeFecha.addEventListener('change', actualizarVistaPreviewDesmontaje);
    
    // Vista previa tarifa
    tarifaNueva.addEventListener('input', actualizarVistaPreviewTarifa);
    radiosTarifa.forEach(r => r.addEventListener('change', actualizarVistaPreviewTarifa));
    
    // Cambio municipio en reinstalación
    reinstalacionCambioMunicipio.addEventListener('change', toggleMunicipioGroup);
});
```

### Cierre de Dropdown:

```javascript
// Cerrar al hacer click fuera
document.addEventListener('click', (event) => {
    if (!dropdown.contains(event.target) && event.target !== button) {
        dropdown.classList.add('hidden');
        dropdown.classList.remove('show');
    }
});
```

### Cierre y Limpieza de Modales:

```javascript
function closeModal(modalId) {
    modal.classList.remove('show');
    modal.classList.add('hidden');
    
    // Limpiar formularios
    inputs.forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });
}
```

---

## 📦 ESTRUCTURA DE DATOS

### Panel:
```javascript
{
    municipio: "Madrid",
    codigo: "PIV-001",
    tarifa: 37.70,
    fechaInstalacion: "2025-10-01",
    fechaDesmontaje: null,
    observaciones: "Panel principal"
}
```

### Registro de Cambio (Alta):
```javascript
{
    tipo: "ALTA",
    codigo: "PIV-123",
    municipio: "Madrid",
    fecha: "2025-11-15",
    observaciones: "Nuevo panel",
    timestamp: "2025-11-15T10:30:00.000Z"
}
```

### Registro de Cambio (Cambio Tarifa):
```javascript
{
    tipo: "CAMBIO_TARIFA",
    alcance: "todos_municipio",
    nuevaTarifa: 42.50,
    panelesAfectados: ["PIV-001", "PIV-002", "PIV-003"],
    municipio: "Madrid",
    timestamp: "2025-11-30T16:20:00.000Z"
}
```

---

## ✅ CHECKLIST DE MIGRACIÓN COMPLETADA

- [x] Diseño de interfaz única con dropdown
- [x] 5 modales especializados creados
- [x] CSS completo con animaciones y colores
- [x] Función `calcularFacturacion()` implementada
- [x] Función `actualizarDashboard()` implementada
- [x] Búsqueda inteligente funcional
- [x] Vista previa en tiempo real en cada modal
- [x] Validaciones completas
- [x] Integración con Firestore
- [x] Registro de cambios en localStorage
- [x] Event listeners configurados
- [x] Código Excel eliminado
- [x] SheetJS removido
- [x] Responsive design
- [x] Desplegado a producción
- [x] Documentación completa

---

## 🎉 RESULTADO FINAL

### Antes (Excel):
```
[Importar Datos] [Añadir Panel] [Quitar Panel] [Desmontar Panel]
[Procesar Cambios Mensuales] [Exportar] [Ver Histórico]
```

### Ahora (Web):
```
[📋 Cambios del Mes ▼]  [📥 Exportar] [📊 Histórico] [🔄 Recargar]
   ├─ 🟢 Alta
   ├─ 🔵 Reinstalación
   ├─ 🔴 Baja
   ├─ 🟠 Desmontaje
   └─ 🟣 Cambio Tarifa
```

**Ventajas clave:**
- ✅ UX mejorada dramáticamente
- ✅ Cálculos automáticos en tiempo real
- ✅ Cero errores de formato Excel
- ✅ Interfaz profesional y moderna
- ✅ Sin dependencias externas
- ✅ Completamente responsive

---

## 📞 SOPORTE

**URL Producción:** https://piv-manager.web.app
**Proyecto Firebase:** piv-manager
**Región:** europe-west10

**Autor:** Sistema de Gestión PIV Manager
**Fecha:** Diciembre 2024
**Versión:** 2.0.0 (Web-based)

---

🎯 **Sistema completamente funcional y desplegado en producción**
