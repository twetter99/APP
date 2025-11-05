# 📋 Sistema de Gestión de Cambios Mensuales

## Conceptos Clave

### Línea Base: Octubre 2025
- **Octubre 2025** es tu **línea base** con todos los paneles existentes
- Esta base contiene todos los paneles activos a 30/10/2025
- Incluye la facturación de referencia

### Cambios Mensuales: A partir de Noviembre 2025
A partir de **Noviembre 2025**, cada mes puedes registrar 4 tipos de cambios:

1. **ALTA** 📈: Nuevo panel instalado
2. **BAJA** 📉: Panel eliminado completamente del sistema
3. **DESMONTAJE** 📦: Panel desmontado (sigue en el sistema pero inactivo)
4. **CAMBIO_TARIFA** 💰: Modificación de la tarifa de un panel existente

## 📊 Formato del Archivo Excel

Prepara un archivo Excel (.xlsx o .xls) con las siguientes hojas:

### Hoja 1: ALTAS
Nuevos paneles a instalar en el mes.

| Municipio | Código | Fecha Instalación | Tarifa |
|-----------|--------|------------------|--------|
| Madrid | 12345 | 15/11/2025 | 75.50 |
| Alcalá de Henares | 67890 | 20/11/2025 | |
| Getafe | TFT-001 | 01/11/2025 | 80.00 |

**Columnas:**
- **Municipio** (obligatorio): Nombre del municipio
- **Código** (obligatorio): Código único del panel
- **Fecha Instalación** (opcional): Formato DD/MM/YYYY
- **Tarifa** (opcional): Tarifa personalizada en euros (deja vacío para usar tarifa base)

### Hoja 2: BAJAS
Paneles que se eliminan completamente del sistema.

| Código | Fecha Baja | Motivo |
|--------|-----------|--------|
| 12345 | 15/11/2025 | Vandalismo |
| 67890 | 30/11/2025 | Fin de contrato |
| 99999 | 10/11/2025 | |

**Columnas:**
- **Código** (obligatorio): Código del panel a eliminar
- **Fecha Baja** (opcional): Formato DD/MM/YYYY
- **Motivo** (opcional): Razón de la baja

**⚠️ Importante:** Una BAJA elimina el panel completamente. Si solo quieres marcarlo como inactivo, usa DESMONTAJES.

### Hoja 3: DESMONTAJES
Paneles que se desmontan pero siguen en el sistema.

| Código | Fecha Desmontaje |
|--------|-----------------|
| 12345 | 25/11/2025 |
| 67890 | 28/11/2025 |

**Columnas:**
- **Código** (obligatorio): Código del panel a desmontar
- **Fecha Desmontaje** (obligatorio): Formato DD/MM/YYYY

**ℹ️ Diferencia BAJA vs DESMONTAJE:**
- **BAJA**: El panel desaparece del sistema (no se factura más)
- **DESMONTAJE**: El panel sigue en el sistema pero marcado como inactivo (facturación parcial hasta fecha de desmontaje)

### Hoja 4: CAMBIOS_TARIFA
Cambios de tarifa para paneles existentes.

| Código | Nueva Tarifa | Fecha Cambio |
|--------|--------------|--------------|
| 12345 | 85.00 | 01/11/2025 |
| 67890 | 70.50 | 15/11/2025 |

**Columnas:**
- **Código** (obligatorio): Código del panel
- **Nueva Tarifa** (obligatorio): Nueva tarifa en euros
- **Fecha Cambio** (opcional): Formato DD/MM/YYYY

## 🚀 Cómo Procesar Cambios Mensuales

### Paso 1: Preparar el archivo Excel
1. Crea un archivo Excel con las 4 hojas (solo incluye las que necesites)
2. Nombra las hojas exactamente: `ALTAS`, `BAJAS`, `DESMONTAJES`, `CAMBIOS_TARIFA`
3. Rellena los datos según las especificaciones arriba

### Paso 2: Seleccionar el mes correcto
1. En la aplicación, selecciona el **Mes** y **Año** correctos
2. **⚠️ IMPORTANTE**: Solo puedes procesar cambios desde **Noviembre 2025** en adelante
3. Si seleccionas Octubre 2025 o anterior, el sistema te lo impedirá

### Paso 3: Procesar el archivo
1. Haz clic en **"📋 Procesar Cambios Mensuales"**
2. Selecciona tu archivo Excel
3. El sistema procesará automáticamente todos los cambios

### Paso 4: Revisar el resumen
El sistema mostrará un resumen:
```
✅ Cambios procesados para Noviembre 2025:

📈 Altas: 5
📉 Bajas: 2
📦 Desmontajes: 3
💰 Cambios de tarifa: 1

📊 Total paneles activos: 1,250
```

## 📝 Ver Historial de Cambios

### Opción 1: Ver todos los cambios
1. Haz clic en **"📝 Ver Cambios Mensuales"**
2. Verás un resumen completo organizado por mes
3. Cada mes muestra:
   - Lista de altas con detalles
   - Lista de bajas con motivos
   - Lista de desmontajes
   - Lista de cambios de tarifa

### Opción 2: Exportar cambios
Los cambios se guardan automáticamente en localStorage y se incluyen en el:
- **Backup Completo (JSON)**: Incluye todos los cambios registrados

## ⚙️ Cómo Funciona Internamente

### Registro Automático
Cada vez que procesas cambios mensuales, el sistema:

1. **Valida el mes**: Asegura que sea >= Noviembre 2025
2. **Registra cada cambio**: Guarda detalles completos en `monthlyChanges[mes-año]`
3. **Actualiza panelsData**: Aplica los cambios a la base de datos activa
4. **Guarda historial**: Persiste en localStorage

### Estructura de Datos
```javascript
monthlyChanges = {
  "2025-11": {
    mes: "11",
    año: "2025",
    fecha_proceso: "2025-11-04T10:30:00.000Z",
    altas: [
      {
        municipio: "Madrid",
        codigo: "12345",
        fechaInstalacion: "2025-11-15",
        tarifa: 75.50,
        fecha_registro: "2025-11-04T10:30:00.000Z"
      }
    ],
    bajas: [...],
    desmontajes: [...],
    cambios_tarifa: [...]
  },
  "2025-12": { ... }
}
```

## 📈 Casos de Uso Comunes

### Caso 1: Alta y Baja en el mismo mes
**Escenario**: Un panel se instala el día 5 y se da de baja el día 25 del mismo mes.

**Solución**:
1. En la hoja ALTAS: Agrega el panel con fecha 05/11/2025
2. En la hoja BAJAS: Agrega el mismo código con fecha 25/11/2025
3. **Resultado**: Se facturará solo del 5 al 25 (20 días)

### Caso 2: Panel se desmonta temporalmente
**Escenario**: Panel se desmonta en Noviembre pero podría reinstalarse en Diciembre.

**Solución**:
- Usa **DESMONTAJES** (no BAJAS)
- El panel permanece en el sistema
- Si se reinstala en Diciembre:
  - Crea nueva ALTA en Diciembre con el mismo código
  - O edita manualmente para eliminar fecha de desmontaje

### Caso 3: Cambio de tarifa a mitad de mes
**Escenario**: Tarifa cambia el día 15 del mes.

**Solución**:
1. En CAMBIOS_TARIFA: Código, nueva tarifa, 15/11/2025
2. **Nota**: Actualmente el sistema aplica la nueva tarifa para todo el mes
3. **Recomendación futura**: Implementar facturación prorrateada

### Caso 4: Corrección de error
**Escenario**: Procesaste cambios incorrectos para un mes.

**Solución**:
1. No hay "deshacer" automático
2. Opciones:
   - Crear cambios inversos (dar de alta lo que diste de baja, etc.)
   - Restaurar backup anterior
   - Editar manualmente en localStorage (avanzado)

## 🔐 Validaciones del Sistema

El sistema valida automáticamente:

✅ **Fecha mínima**: Solo noviembre 2025 o posterior
✅ **Duplicados en ALTAS**: No permite alta de panel ya existente
✅ **Paneles no encontrados**: Avisa si intentas dar de baja/desmontar panel inexistente
✅ **Formato de fechas**: Acepta DD/MM/YYYY y otros formatos estándar
✅ **Hojas opcionales**: No es necesario tener las 4 hojas, solo las que uses

## ⚠️ Advertencias Importantes

1. **Mes correcto**: Siempre verifica que el mes seleccionado coincida con tus cambios
2. **Códigos únicos**: Asegúrate de que los códigos de panel sean únicos
3. **Backup regular**: Haz backup antes de procesar cambios importantes
4. **No reversible**: Los cambios no se pueden deshacer automáticamente
5. **Línea base**: No modifiques manualmente la línea base de Octubre 2025

## 📊 Reporting y Análisis

### Facturación Mensual
La facturación se calcula automáticamente considerando:
- Días activos del panel en el mes
- Fecha de instalación (si existe)
- Fecha de desmontaje (si existe)
- Tarifa personalizada o tarifa base

### Fórmula de Facturación
```
Si panel tiene tarifaCustom:
  Tarifa = tarifaCustom
Sino:
  Tarifa = tarifa base (del selector)

Si tiene fechaInstalacion en el mes:
  Días facturables = días desde instalación hasta fin de mes

Si tiene fechaDesmontaje en el mes:
  Días facturables = días desde inicio hasta desmontaje

Facturación = (Días facturables × Tarifa) / Días del mes
```

### Ejemplo Cálculo
- Mes: Noviembre 2025 (30 días)
- Tarifa base: 60 €
- Panel instalado: 10/11/2025
- Días facturables: 21 días (del 10 al 30)
- **Facturación**: (21 × 60) / 30 = **42,00 €**

## 🔄 Workflow Recomendado

### Proceso Mensual
```
1. DÍA 1-3 DEL MES:
   ├─ Recibir notificaciones de cambios del mes anterior
   ├─ Compilar cambios en archivo Excel
   └─ Verificar datos con responsables

2. DÍA 4-5:
   ├─ Seleccionar mes correcto en la app
   ├─ Procesar archivo de cambios
   ├─ Revisar resumen y errores
   └─ Verificar en "Ver Cambios Mensuales"

3. DÍA 6-7:
   ├─ Revisar facturación calculada
   ├─ Exportar Excel para revisión
   └─ Hacer backup completo

4. DÍA 8-10:
   ├─ Generar informe de facturación
   ├─ Enviar a contabilidad
   └─ Archivar backup del mes
```

## 📞 Soporte y Troubleshooting

### Problema: "Panel no encontrado"
**Causa**: Intentas dar de baja/desmontar un panel que no existe
**Solución**: Verifica el código del panel en la tabla principal

### Problema: "Solo desde Noviembre 2025"
**Causa**: Tienes seleccionado Octubre 2025 o anterior
**Solución**: Cambia el selector de mes a Noviembre 2025 o posterior

### Problema: "Panel ya existe"
**Causa**: Intentas dar de alta un panel con código duplicado
**Solución**: Verifica si el panel ya está en el sistema

### Problema: Cambios no se aplican
**Causa**: Archivo Excel con formato incorrecto
**Solución**: 
- Verifica nombres de hojas (ALTAS, BAJAS, DESMONTAJES, CAMBIOS_TARIFA)
- Verifica estructura de columnas
- Revisa la consola del navegador (F12) para errores

## 🎯 Próximas Mejoras Sugeridas

1. **Sincronización con Firestore**: Guardar cambios mensuales en la nube
2. **Facturación prorrateada**: Cambios de tarifa a mitad de mes
3. **Aprobación de cambios**: Workflow de revisión antes de aplicar
4. **Notificaciones**: Alertas de paneles próximos a desmontar
5. **Dashboard de cambios**: Gráficas de evolución mensual
6. **Export detallado**: PDF con resumen de cambios mensuales
7. **Auditoría**: Log completo de quién y cuándo hizo cambios
8. **Deshacer cambios**: Función para revertir procesamiento de un mes

## 📁 Archivos Relacionados

- **Aplicación**: https://piv-manager.web.app
- **Código fuente**: `public/index.html`
- **Datos**: localStorage (`paneles_cambios_mensuales`)
- **Backup**: Función "Backup Completo (JSON)"

---

**Última actualización**: 4 de Noviembre de 2025
**Versión del sistema**: 2.0 - Cambios Mensuales
