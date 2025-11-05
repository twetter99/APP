# 📑 Plantilla Excel para Cambios Mensuales

## Instrucciones para crear la plantilla

Crea un archivo Excel con 4 hojas. A continuación se muestra la estructura de cada una:

---

## HOJA 1: ALTAS

**Nombre de la hoja**: `ALTAS`

| Municipio | Código | Fecha Instalación | Tarifa |
|-----------|--------|------------------|--------|
| Madrid | 12345 | 15/11/2025 | 75.50 |
| Alcalá de Henares | 67890 | 20/11/2025 | |
| Getafe | TFT-001 | 01/11/2025 | 80.00 |
| Móstoles | 99999 | | 65.00 |

**Notas**:
- Fila 1 (encabezados): Municipio, Código, Fecha Instalación, Tarifa
- Municipio: Texto, obligatorio
- Código: Texto o número, obligatorio, debe ser único
- Fecha Instalación: Formato DD/MM/YYYY, opcional
- Tarifa: Número decimal, opcional (si está vacío usa tarifa base)

---

## HOJA 2: BAJAS

**Nombre de la hoja**: `BAJAS`

| Código | Fecha Baja | Motivo |
|--------|-----------|--------|
| 12345 | 15/11/2025 | Vandalismo |
| 67890 | 30/11/2025 | Fin de contrato |
| 99999 | | No especificado |

**Notas**:
- Fila 1 (encabezados): Código, Fecha Baja, Motivo
- Código: Debe existir en el sistema
- Fecha Baja: Formato DD/MM/YYYY, opcional
- Motivo: Texto libre, opcional

**⚠️ IMPORTANTE**: Una BAJA elimina el panel completamente. Si solo quieres marcarlo como inactivo, usa DESMONTAJES.

---

## HOJA 3: DESMONTAJES

**Nombre de la hoja**: `DESMONTAJES`

| Código | Fecha Desmontaje |
|--------|-----------------|
| 12345 | 25/11/2025 |
| 67890 | 28/11/2025 |
| 99999 | 30/11/2025 |

**Notas**:
- Fila 1 (encabezados): Código, Fecha Desmontaje
- Código: Debe existir en el sistema
- Fecha Desmontaje: Formato DD/MM/YYYY, obligatorio

**Diferencia con BAJAS**:
- DESMONTAJE: Panel se marca como inactivo pero permanece en el sistema
- BAJA: Panel se elimina completamente

---

## HOJA 4: CAMBIOS_TARIFA

**Nombre de la hoja**: `CAMBIOS_TARIFA`

| Código | Nueva Tarifa | Fecha Cambio |
|--------|--------------|--------------|
| 12345 | 85.00 | 01/11/2025 |
| 67890 | 70.50 | 15/11/2025 |
| 99999 | 90.00 | |

**Notas**:
- Fila 1 (encabezados): Código, Nueva Tarifa, Fecha Cambio
- Código: Debe existir en el sistema
- Nueva Tarifa: Número decimal en euros, obligatorio
- Fecha Cambio: Formato DD/MM/YYYY, opcional

---

## Consejos para Crear el Archivo

### 1. Usar Microsoft Excel
- Abre Excel
- Crea un nuevo libro
- Renombra las hojas a: ALTAS, BAJAS, DESMONTAJES, CAMBIOS_TARIFA
- Elimina las hojas que no necesites

### 2. Formatear las Celdas
- **Código**: Formato "Texto" (para evitar que códigos como "07234" se conviertan en "7234")
- **Fechas**: Formato "DD/MM/YYYY"
- **Tarifa**: Formato "Número" con 2 decimales

### 3. Validar Datos Antes de Subir
✅ Verificar que los códigos de panel existan (para BAJAS, DESMONTAJES, CAMBIOS_TARIFA)
✅ Verificar que los códigos nuevos no existan (para ALTAS)
✅ Verificar formato de fechas
✅ Verificar que las tarifas sean números válidos

### 4. Guardar el Archivo
- Guardar como: "Cambios_Noviembre_2025.xlsx"
- Formato: Excel (.xlsx) o Excel 97-2003 (.xls)

---

## Ejemplo Completo de Uso

### Escenario: Noviembre 2025

**ALTAS** (3 nuevos paneles):
- Madrid, código 20001, instalado el 5/11/2025, tarifa estándar
- Getafe, código 20002, instalado el 10/11/2025, tarifa 85€
- Alcorcón, código 20003, sin fecha específica, tarifa estándar

**BAJAS** (2 paneles eliminados):
- Código 15678, baja el 15/11/2025, motivo: "Fin de contrato"
- Código 15679, baja el 20/11/2025, motivo: "Reubicación"

**DESMONTAJES** (1 panel desmontado):
- Código 16789, desmontado el 25/11/2025

**CAMBIOS_TARIFA** (2 cambios):
- Código 12345, nueva tarifa 95€, desde 01/11/2025
- Código 12346, nueva tarifa 75€, desde 15/11/2025

### Archivo Excel Resultante

**Hoja ALTAS**:
```
Municipio          | Código | Fecha Instalación | Tarifa
Madrid            | 20001  | 05/11/2025       |
Getafe            | 20002  | 10/11/2025       | 85.00
Alcorcón          | 20003  |                  |
```

**Hoja BAJAS**:
```
Código | Fecha Baja  | Motivo
15678  | 15/11/2025 | Fin de contrato
15679  | 20/11/2025 | Reubicación
```

**Hoja DESMONTAJES**:
```
Código | Fecha Desmontaje
16789  | 25/11/2025
```

**Hoja CAMBIOS_TARIFA**:
```
Código | Nueva Tarifa | Fecha Cambio
12345  | 95.00       | 01/11/2025
12346  | 75.00       | 15/11/2025
```

---

## Formatos de Fecha Aceptados

El sistema acepta múltiples formatos de fecha:

✅ **DD/MM/YYYY**: 15/11/2025 (recomendado)
✅ **DD-MM-YYYY**: 15-11-2025
✅ **YYYY-MM-DD**: 2025-11-15
✅ **DD/MM/YY**: 15/11/25
✅ **Fecha Excel**: 45628 (número serial de Excel)

❌ **Evitar**:
- Formatos ambiguos como MM/DD/YYYY (estilo americano)
- Fechas con texto: "15 de Noviembre"
- Fechas incompletas: "15/11" sin año

---

## Troubleshooting

### Error: "Panel ya existe"
**Problema**: Código de panel en ALTAS ya está en el sistema
**Solución**: Verifica que el código sea nuevo o usa CAMBIOS_TARIFA si quieres modificar uno existente

### Error: "Panel no encontrado"
**Problema**: Código en BAJAS/DESMONTAJES/CAMBIOS_TARIFA no existe
**Solución**: Verifica el código en la tabla principal de la aplicación

### Error: Fechas no se reconocen
**Problema**: Formato de fecha incorrecto
**Solución**: Usa formato DD/MM/YYYY o YYYY-MM-DD

### Los códigos se modifican en Excel
**Problema**: Códigos como "07234" se convierten en "7234"
**Solución**: 
1. Selecciona la columna de códigos
2. Clic derecho → Formato de celdas
3. Selecciona "Texto"
4. Vuelve a escribir los códigos

---

## Plantilla Descargable

Para facilitar tu trabajo, puedes:

1. **Crear desde cero**: Sigue las instrucciones arriba
2. **Copiar estructura**: Copia las tablas de este documento a Excel
3. **Guardar como plantilla**: Guarda el archivo vacío como "Plantilla_Cambios_Mensuales.xlsx"

---

## Checklist Pre-Envío

Antes de procesar el archivo en la aplicación:

- [ ] Nombres de hojas correctos (ALTAS, BAJAS, DESMONTAJES, CAMBIOS_TARIFA)
- [ ] Encabezados en la fila 1 de cada hoja
- [ ] Códigos en formato texto
- [ ] Fechas en formato DD/MM/YYYY
- [ ] Tarifas son números (no texto)
- [ ] No hay filas vacías entre datos
- [ ] Archivo guardado como .xlsx o .xls
- [ ] Mes y año seleccionados correctamente en la aplicación
- [ ] Backup realizado antes de procesar

---

**Última actualización**: 4 de Noviembre de 2025
