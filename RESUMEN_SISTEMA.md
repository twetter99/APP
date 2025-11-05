# ✅ Sistema de Cambios Mensuales - Resumen Ejecutivo

## 🎯 Objetivo

Has cargado la **línea base de Octubre 2025** con todos los paneles existentes. Ahora el sistema está configurado para gestionar cambios mensuales a partir de **Noviembre 2025**.

## 📋 ¿Qué puedes hacer?

### 4 Tipos de Cambios Mensuales

| Tipo | Qué hace | Cuándo usarlo |
|------|----------|---------------|
| **📈 ALTA** | Agrega nuevo panel | Panel nuevo instalado |
| **📉 BAJA** | Elimina panel completamente | Panel ya no existe (retirado permanentemente) |
| **📦 DESMONTAJE** | Marca panel como inactivo | Panel se desmonta pero sigue en el sistema |
| **💰 CAMBIO_TARIFA** | Cambia precio de un panel | Ajuste de tarifa para panel existente |

## 🚀 Proceso Rápido (3 pasos)

### 1️⃣ Prepara tu archivo Excel
Crea un Excel con estas hojas (solo las que necesites):
- `ALTAS`
- `BAJAS`
- `DESMONTAJES`
- `CAMBIOS_TARIFA`

📄 Ver: `PLANTILLA_EXCEL_CAMBIOS.md` para estructura detallada

### 2️⃣ Selecciona el mes
- Ve a https://piv-manager.web.app
- Inicia sesión
- Selecciona Mes y Año (ej: Noviembre 2025)

### 3️⃣ Procesa cambios
- Click en **"📋 Procesar Cambios Mensuales"**
- Selecciona tu archivo Excel
- Revisa el resumen
- ¡Listo!

## 📊 Estructura del Excel

### Hoja ALTAS
```
Municipio | Código | Fecha Instalación | Tarifa
Madrid    | 12345  | 15/11/2025       | 75.50
```

### Hoja BAJAS
```
Código | Fecha Baja  | Motivo
12345  | 15/11/2025 | Fin de contrato
```

### Hoja DESMONTAJES
```
Código | Fecha Desmontaje
12345  | 25/11/2025
```

### Hoja CAMBIOS_TARIFA
```
Código | Nueva Tarifa | Fecha Cambio
12345  | 85.00       | 01/11/2025
```

## 🔍 Ver Historial

### Opción 1: Ver todos los cambios
**📝 Ver Cambios Mensuales** → Muestra detalle completo por mes

### Opción 2: Ver facturación
**📊 Ver Histórico Mensual** → Resumen de facturación por mes

## ✨ Características Destacadas

### ✅ Validaciones Automáticas
- No permite cambios antes de Noviembre 2025
- Detecta paneles duplicados
- Avisa de paneles no encontrados
- Valida formatos de fecha

### ✅ Registro Completo
- Cada cambio se registra con fecha y hora
- Historial completo por mes
- Backup automático en localStorage

### ✅ Cálculo Inteligente
- Facturación prorrateada por días
- Considera fechas de instalación/desmontaje
- Tarifas personalizadas por panel

## ⚡ Casos de Uso Rápidos

### Caso 1: Alta simple
```excel
Hoja ALTAS:
Municipio | Código | Fecha Instalación | Tarifa
Madrid    | 20001  | 05/11/2025       |
```
→ Panel se factura desde el 5/11/2025 con tarifa base

### Caso 2: Alta con tarifa especial
```excel
Hoja ALTAS:
Municipio | Código | Fecha Instalación | Tarifa
Getafe    | 20002  | 10/11/2025       | 85.00
```
→ Panel se factura desde el 10/11/2025 a 85€/mes

### Caso 3: Baja definitiva
```excel
Hoja BAJAS:
Código | Fecha Baja  | Motivo
15678  | 15/11/2025 | Vandalismo
```
→ Panel se elimina completamente el 15/11/2025

### Caso 4: Desmontaje temporal
```excel
Hoja DESMONTAJES:
Código | Fecha Desmontaje
16789  | 25/11/2025
```
→ Panel se factura hasta el 25/11/2025, luego inactivo

### Caso 5: Cambio de tarifa
```excel
Hoja CAMBIOS_TARIFA:
Código | Nueva Tarifa | Fecha Cambio
12345  | 95.00       | 01/11/2025
```
→ Panel cambia a 95€/mes desde el 01/11/2025

## ⚠️ Reglas Importantes

1. **Mes mínimo**: Solo Noviembre 2025 o posterior
2. **Octubre 2025**: Es la línea base, no se modifica con cambios mensuales
3. **Códigos únicos**: No duplicar códigos en ALTAS
4. **Paneles existentes**: BAJAS/DESMONTAJES/CAMBIOS_TARIFA requieren panel existente
5. **Backup**: Haz backup antes de cambios importantes

## 📞 ¿Necesitas Ayuda?

### Documentación Completa
- **Guía Completa**: `GESTION_CAMBIOS_MENSUALES.md`
- **Plantilla Excel**: `PLANTILLA_EXCEL_CAMBIOS.md`
- **Carga de Datos**: `COMO_CARGAR_DATOS.md`

### Soporte Rápido
1. **Error "Panel no encontrado"**
   → Verifica el código en la tabla principal

2. **Error "Solo desde Noviembre 2025"**
   → Cambia el mes seleccionado a Nov 2025 o posterior

3. **Error "Panel ya existe"**
   → El código ya está en el sistema, no uses ALTAS

4. **Cambios no se aplican**
   → Verifica nombres de hojas: ALTAS, BAJAS, DESMONTAJES, CAMBIOS_TARIFA

### Consola del Navegador
Para ver errores detallados:
1. Presiona F12
2. Ve a la pestaña "Console"
3. Busca mensajes en rojo

## 🎯 Workflow Mensual Recomendado

```
Día 1-3:   Recopilar cambios del mes
    ↓
Día 4:     Preparar Excel con cambios
    ↓
Día 5:     Procesar en la aplicación
    ↓
Día 6:     Revisar resultados
    ↓
Día 7:     Exportar y hacer backup
    ↓
Día 8-10:  Generar facturación
```

## 📊 Estadísticas Visibles

Después de procesar cambios, verás actualizado:
- ✅ Total paneles activos
- ✅ Facturación mensual total
- ✅ Número de municipios
- ✅ Paneles con facturación parcial

## 🔄 Ejemplo Completo

**Escenario**: Procesar cambios de Noviembre 2025

**Paso 1**: Excel con 4 hojas
- ALTAS: 3 nuevos paneles
- BAJAS: 2 paneles eliminados
- DESMONTAJES: 1 panel desmontado
- CAMBIOS_TARIFA: 2 cambios de precio

**Paso 2**: En la app
1. Selecciona: Noviembre 2025
2. Click "Procesar Cambios Mensuales"
3. Selecciona archivo Excel

**Resultado**:
```
✅ Cambios procesados para Noviembre 2025:

📈 Altas: 3
📉 Bajas: 2
📦 Desmontajes: 1
💰 Cambios de tarifa: 2

📊 Total paneles activos: 1,250
```

**Paso 3**: Verificar
1. Click "Ver Cambios Mensuales"
2. Revisa detalles de todos los cambios
3. Exporta Excel para revisión

## 🎉 ¡Todo Listo!

Tu sistema está configurado para:
- ✅ Gestionar cambios mensuales desde Nov 2025
- ✅ Calcular facturación automática
- ✅ Registrar historial completo
- ✅ Exportar reportes

**URL de la aplicación**: https://piv-manager.web.app

---

**Fecha**: 4 de Noviembre de 2025  
**Versión**: 2.0 - Sistema de Cambios Mensuales  
**Estado**: ✅ Desplegado y funcionando
