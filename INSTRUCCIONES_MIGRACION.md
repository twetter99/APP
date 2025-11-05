# 📤 Migración de Paneles a Firestore

## Instrucciones para migrar los datos

### Paso 1: Acceder a la aplicación
1. Abre tu navegador y ve a: **https://piv-manager.web.app**
2. Haz clic en **"Iniciar Sesión con Google"**
3. Selecciona tu cuenta de Google (twetter@gmail.com)

### Paso 2: Iniciar la migración
1. Una vez autenticado, haz clic en el botón **"📤 Migrar Paneles a Firestore"**
2. Se abrirá la página de migración

### Paso 3: Ejecutar la migración
1. La página cargará automáticamente el archivo JSON con los paneles
2. Verás dos estadísticas:
   - **Total en JSON**: Cantidad de paneles en el archivo (debería mostrar el número total)
   - **En Firestore**: Cantidad de paneles ya existentes en la base de datos
3. Haz clic en **"🔄 Iniciar Migración"**
4. Confirma la operación en el diálogo que aparece

### Paso 4: Monitorear el progreso
Durante la migración verás:
- **Barra de progreso** con el porcentaje completado
- **Log en tiempo real** mostrando el progreso de la migración
- **Actualizaciones cada 50 registros** migrados

### Paso 5: Verificar el resultado
Al finalizar verás:
- ✅ Mensaje de éxito con el número de paneles migrados
- 📊 Estadísticas actualizadas
- El contador "En Firestore" mostrará el nuevo total

## ⚠️ Consideraciones importantes

1. **Tiempo de ejecución**: La migración puede tardar varios minutos dependiendo de la cantidad de paneles
2. **No cerrar la ventana**: Mantén la página abierta durante toda la migración
3. **Duplicados**: Si ejecutas la migración varias veces, se crearán registros duplicados
4. **Conexión a internet**: Asegúrate de tener una conexión estable

## 📊 Datos que se migran

Por cada panel se guardan los siguientes campos:
- `municipio`: Nombre del municipio
- `codigo`: Código del panel
- `fechaInstalacion`: Fecha de instalación (si existe)
- `fechaDesmontaje`: Fecha de desmontaje (si existe)
- `estado`: "activo" o "desmontado" (calculado automáticamente)
- `operador`: "UTE" (por defecto)
- `createdAt`: Fecha de creación del registro
- `updatedAt`: Fecha de última actualización

## 🔍 Verificar los datos en Firebase Console

1. Ve a: https://console.firebase.google.com/project/piv-manager/firestore
2. En el menú lateral, selecciona **Firestore Database**
3. Haz clic en la colección **"paneles"**
4. Verás todos los paneles migrados

## 🐛 Solución de problemas

### Error: "Debes iniciar sesión primero"
- Asegúrate de haber iniciado sesión con Google antes de acceder a la página de migración
- Vuelve a la página principal y haz login

### Error al cargar el archivo JSON
- Verifica que el archivo `paneles_octubre_2025.json` esté en la carpeta `public`
- Verifica que el archivo tenga el formato JSON correcto

### La migración se detiene
- Verifica tu conexión a internet
- Abre la consola del navegador (F12) para ver los errores
- Refresca la página y vuelve a intentar

## 📝 Archivo de origen

El archivo fuente es: `paneles_octubre_2025.json`

Este archivo contiene todos los paneles con su información básica en formato JSON.

## 🎯 URL de la aplicación

- **Página principal**: https://piv-manager.web.app
- **Página de migración**: https://piv-manager.web.app/migrar.html
- **Firebase Console**: https://console.firebase.google.com/project/piv-manager

## 📞 Soporte

Si encuentras problemas durante la migración, revisa:
1. La consola del navegador (F12 → Console)
2. Los logs en tiempo real en la página de migración
3. El estado de Firebase en: https://status.firebase.google.com
