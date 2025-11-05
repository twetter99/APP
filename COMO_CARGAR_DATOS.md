# 🔄 Cómo Cargar los Datos desde Firestore

## Problema resuelto
La aplicación ahora puede cargar automáticamente los paneles desde Firestore que ya fueron migrados.

## 📋 Pasos para ver tus datos

### Opción 1: Carga automática
1. Ve a https://piv-manager.web.app
2. Inicia sesión con Google
3. Los datos se cargarán automáticamente desde Firestore
4. Verás las estadísticas actualizadas:
   - **Total Paneles**: Cantidad de paneles activos
   - **Facturación Mensual**: Cálculo basado en días facturables
   - **Municipios**: Número de municipios únicos
   - **Paneles Parciales**: Paneles con instalación/desmontaje parcial

### Opción 2: Recarga manual
Si los datos no aparecen automáticamente:

1. Busca la tarjeta azul **"Sincronización con Firestore"**
2. Haz clic en **"🔄 Recargar Datos desde Firestore"**
3. Confirma la operación
4. Los datos se cargarán inmediatamente

## 📊 Qué verás

### Estadísticas
- **Total Paneles**: Todos los paneles en la base de datos
- **Facturación Mensual**: Calculada según:
  - Tarifa base (configurable)
  - Días facturables del mes
  - Paneles activos vs desmontados

### Tabla de Paneles
Cada panel mostrará:
- **Municipio**: Ubicación del panel
- **Código Parada**: Identificador único
- **Días Facturables**: Calculados automáticamente según fechas
- **Facturación (€)**: Importe calculado
- **Estado**: Activo/Desmontado
- **Acciones**: Botones para editar/eliminar

## 🎯 Cálculo de Facturación

La facturación se calcula así:

```
Días Facturables = Días del mes en que el panel estuvo activo

Si hay fechaInstalacion:
  - Se cuentan días desde la instalación

Si hay fechaDesmontaje:
  - Se cuentan días hasta el desmontaje

Facturación = (Días Facturables × Tarifa Base) / Días del Mes
```

### Ejemplo
- Mes: Octubre 2025 (31 días)
- Tarifa base: 60 €
- Panel instalado el 10/10/2025
- Días facturables: 22 días (del 10 al 31)
- Facturación: (22 × 60) / 31 = 42,58 €

## ⚙️ Configuración

Puedes ajustar:

1. **Mes Actual**: Selecciona el mes a calcular
2. **Año Actual**: Selecciona el año
3. **Tarifa Base (€)**: Modifica la tarifa mensual por panel

Los cálculos se actualizarán automáticamente.

## 🔍 Verificar datos en Firebase Console

Si quieres ver los datos directamente en Firebase:

1. Ve a: https://console.firebase.google.com/project/piv-manager/firestore
2. Selecciona la colección **"paneles"**
3. Verás todos los registros migrados

## ❓ Preguntas frecuentes

### ¿Por qué la facturación muestra 0,00 €?
- Verifica que hayas recargado los datos desde Firestore
- Asegúrate de que la tarifa base esté configurada (por defecto: 60 €)
- Comprueba que el mes/año seleccionados sean correctos

### ¿Los datos se guardan automáticamente?
- Los datos se cargan desde Firestore (solo lectura por ahora)
- Los cambios manuales se guardan en localStorage del navegador
- Para persistir cambios en Firestore, se necesita implementar sincronización (próxima versión)

### ¿Puedo editar los paneles?
- Sí, usa los botones de acción:
  - ➕ Añadir Panel Nuevo
  - ➖ Eliminar Panel
  - 📦 Desmontar Panel
- Los cambios se guardan localmente
- Para sincronizar con Firestore, necesitarás implementar la función de guardado

## 🚀 Próximos pasos sugeridos

1. **Sincronización bidireccional**: Guardar cambios locales en Firestore
2. **Edición inline**: Modificar fechas directamente en la tabla
3. **Filtros avanzados**: Buscar por municipio, estado, fechas
4. **Reportes**: Generar informes mensuales automáticos
5. **Notificaciones**: Alertas de paneles próximos a desmontar

## 📞 Soporte

Si tienes problemas:
1. Abre la consola del navegador (F12 → Console)
2. Busca mensajes de error
3. Verifica que estés autenticado
4. Intenta recargar la página

## 🔗 Enlaces útiles

- **Aplicación**: https://piv-manager.web.app
- **Firebase Console**: https://console.firebase.google.com/project/piv-manager
- **Firestore Database**: https://console.firebase.google.com/project/piv-manager/firestore
