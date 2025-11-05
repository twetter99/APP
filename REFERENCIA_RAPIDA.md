# 📌 PIV Manager - Referencia Rápida

## 🔗 Enlaces Importantes

| Recurso | URL |
|---------|-----|
| **Aplicación** | https://piv-manager.web.app |
| **Firebase Console** | https://console.firebase.google.com/project/piv-manager |
| **Firestore Database** | https://console.firebase.google.com/project/piv-manager/firestore |
| **Authentication** | https://console.firebase.google.com/project/piv-manager/authentication |

## 📚 Documentación

| Documento | Para qué sirve |
|-----------|----------------|
| **RESUMEN_SISTEMA.md** | 🚀 Empieza aquí - Guía rápida |
| **GESTION_CAMBIOS_MENSUALES.md** | 📋 Todo sobre cambios mensuales |
| **PLANTILLA_EXCEL_CAMBIOS.md** | 📄 Cómo crear el Excel |
| **COMO_CARGAR_DATOS.md** | 📥 Cargar desde Firestore |
| **README.md** | 🔧 Guía técnica completa |

## 🎯 Acciones Rápidas

### Procesar Cambios del Mes
```
1. Crear Excel con hojas: ALTAS, BAJAS, DESMONTAJES, CAMBIOS_TARIFA
2. Ir a https://piv-manager.web.app
3. Iniciar sesión con Google
4. Seleccionar mes/año
5. Click "📋 Procesar Cambios Mensuales"
6. Seleccionar archivo Excel
7. Verificar resumen
```

### Ver Historial de Cambios
```
1. Click "📝 Ver Cambios Mensuales"
2. Revisar todos los cambios por mes
```

### Exportar Datos
```
1. Click "💾 Exportar Excel"
2. Guardar archivo con fecha actual
```

### Hacer Backup
```
1. Click "💾 Backup Completo (JSON)"
2. Guardar en lugar seguro
```

### Recargar desde Firestore
```
1. Click en sección "Sincronización con Firestore"
2. Click "🔄 Recargar Datos desde Firestore"
```

## 📋 Tipos de Cambios

| Tipo | Hoja Excel | Qué hace | Ejemplo |
|------|-----------|----------|---------|
| **📈 ALTA** | ALTAS | Agrega panel nuevo | Panel instalado en Nov 2025 |
| **📉 BAJA** | BAJAS | Elimina panel | Panel retirado permanentemente |
| **📦 DESMONTAJE** | DESMONTAJES | Marca inactivo | Panel desmontado temporalmente |
| **💰 CAMBIO_TARIFA** | CAMBIOS_TARIFA | Cambia precio | Tarifa aumenta a 85€ |

## 📄 Estructura Excel Mínima

### ALTAS
```
Municipio | Código | Fecha Instalación | Tarifa
Madrid    | 12345  | 15/11/2025       | 75.50
```

### BAJAS
```
Código | Fecha Baja  | Motivo
12345  | 15/11/2025 | Fin de contrato
```

### DESMONTAJES
```
Código | Fecha Desmontaje
12345  | 25/11/2025
```

### CAMBIOS_TARIFA
```
Código | Nueva Tarifa | Fecha Cambio
12345  | 85.00       | 01/11/2025
```

## ⚡ Atajos de Teclado (Navegador)

| Tecla | Acción |
|-------|--------|
| F12 | Abrir consola del desarrollador |
| Ctrl+F | Buscar en la página |
| Ctrl+Shift+R | Recargar sin caché |
| Ctrl+S | Guardar (al exportar) |

## ⚠️ Reglas Importantes

1. ✅ **Mes mínimo**: Noviembre 2025 (Oct 2025 es línea base)
2. ✅ **Códigos únicos**: No duplicar en ALTAS
3. ✅ **Paneles existentes**: BAJAS/DESMONTAJES requieren panel existente
4. ✅ **Formato fechas**: DD/MM/YYYY (ej: 15/11/2025)
5. ✅ **Backup**: Antes de cambios importantes

## 🔍 Diagnóstico Rápido

### Error: "Panel no encontrado"
```
Problema: Panel no existe en el sistema
Solución: Buscar código en tabla principal
```

### Error: "Solo desde Noviembre 2025"
```
Problema: Mes seleccionado es Oct 2025 o anterior
Solución: Cambiar selector a Nov 2025 o posterior
```

### Error: "Panel ya existe"
```
Problema: Código duplicado en ALTAS
Solución: Verificar si panel ya está cargado
```

### Facturación muestra 0,00 €
```
Problema: Datos no cargados desde Firestore
Solución: Click "🔄 Recargar Datos desde Firestore"
```

### Cambios no se aplican
```
Problema: Excel con formato incorrecto
Solución: 
1. Verificar nombres de hojas
2. Verificar estructura de columnas
3. Ver consola (F12) para errores
```

## 📊 Cálculo de Facturación

```
Días Facturables = Días activos en el mes

Facturación = (Días Facturables × Tarifa) / Días del Mes

Ejemplo:
- Mes: Noviembre (30 días)
- Tarifa: 60 €
- Instalado: 10/11/2025
- Días facturables: 21 (del 10 al 30)
- Facturación: (21 × 60) / 30 = 42,00 €
```

## 🎯 Workflow Mensual

```
DÍA 1-3:  Recopilar cambios
    ↓
DÍA 4:    Preparar Excel
    ↓
DÍA 5:    Procesar en app
    ↓
DÍA 6:    Revisar resultados
    ↓
DÍA 7:    Exportar y backup
    ↓
DÍA 8-10: Generar facturación
```

## 🛠️ Comandos de Terminal (Desarrolladores)

```powershell
# Desplegar a producción
npm run deploy

# Solo hosting
npm run deploy:hosting

# Ver logs
npm run logs

# Servir localmente
npm run serve:local
```

## 📞 Contactos

| Rol | Contacto |
|-----|----------|
| **Usuario Principal** | twetter@gmail.com |
| **Firebase Project** | piv-manager |
| **Support** | Ver consola Firebase |

## 🔐 Credenciales

- **Firebase Console**: Usar cuenta Google (twetter@gmail.com)
- **Hosting URL**: https://piv-manager.web.app
- **Project ID**: piv-manager

## 📈 Estadísticas

| Métrica | Ubicación en App |
|---------|-----------------|
| Total Paneles | Card superior izquierda |
| Facturación Mensual | Card superior centro |
| Municipios | Card superior derecha |
| Paneles Parciales | Card superior derecha |

## 🎨 Botones Principales

| Botón | Función |
|-------|---------|
| ➕ Añadir Panel Nuevo | Agregar panel manualmente |
| ➖ Eliminar Panel | Eliminar panel seleccionado |
| 📦 Desmontar Panel | Marcar como desmontado |
| 📋 Procesar Cambios Mensuales | Cargar Excel con cambios |
| 💾 Exportar Excel | Descargar datos actuales |
| 📂 Importar Datos | Importar desde Excel |
| 📊 Ver Histórico Mensual | Ver facturación por mes |
| 📝 Ver Cambios Mensuales | Ver detalle de cambios |
| 💾 Backup Completo (JSON) | Backup de todo |
| 🔄 Recargar desde Firestore | Actualizar desde nube |

## 🎯 Estados de Panel

| Estado | Significado | Color |
|--------|-------------|-------|
| **Activo** | Panel operativo | Verde ✅ |
| **Desmontado** | Panel inactivo | Naranja ⚠️ |
| **Parcial** | Con fecha instalación/desmontaje | Azul ℹ️ |

## 📅 Calendario de Facturación

| Día | Actividad |
|-----|-----------|
| 1-3 | Recopilar cambios del mes |
| 4-5 | Procesar en sistema |
| 6-7 | Revisar y exportar |
| 8-10 | Facturación final |
| 15 | Envío de facturas |
| 30 | Cierre mensual |

---

**Última actualización**: 4 de Noviembre de 2025  
**Versión**: 2.0  
**Línea Base**: Octubre 2025  

**🚀 URL**: https://piv-manager.web.app
