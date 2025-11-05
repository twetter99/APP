# 🔐 Instrucciones para Habilitar Google Authentication

## Paso 1: Acceder a Authentication
Ya abrí la consola en tu navegador: https://console.firebase.google.com/project/piv-manager/authentication/providers

## Paso 2: Habilitar el proveedor Google

### 2.1. Comenzar
1. En la página que se abrió, verás la pestaña **"Sign-in method"** (Método de acceso)
2. Busca en la lista de proveedores **"Google"**
3. Haz click en **"Google"**

### 2.2. Configurar
Se abrirá un panel lateral. Sigue estos pasos:

1. **Habilitar**: 
   - Activa el toggle en la parte superior derecha (debe quedar en azul)

2. **Nombre público del proyecto**:
   - Aparecerá automáticamente: "PIV Manager"
   - Déjalo así

3. **Correo electrónico de asistencia del proyecto**:
   - Selecciona tu correo: `twetter@gmail.com`
   - Este será visible para los usuarios cuando inicien sesión

4. **Guardar**:
   - Click en el botón **"Guardar"** en la parte inferior

### 2.3. Verificar
Después de guardar, deberías ver:
- ✅ Google aparece en la lista como **"Habilitado"**
- Estado: **Enabled** (verde)

## Paso 3: Verificar que funciona

### 3.1. Abrir tu aplicación
Tu app está en: https://piv-manager.web.app

### 3.2. Probar login
1. Haz click en el botón **"🔐 Iniciar Sesión con Google"**
2. Selecciona tu cuenta de Google
3. Acepta los permisos
4. Deberías ver tu email en el header de la app

## Paso 4: Configurar dominios autorizados (Opcional)

Si necesitas usar la app desde un dominio personalizado:

1. En la misma consola de Authentication
2. Ve a la pestaña **"Settings"** → **"Authorized domains"**
3. Agrega tus dominios permitidos

Por defecto están autorizados:
- `localhost` (desarrollo local)
- `piv-manager.web.app` (producción)
- `piv-manager.firebaseapp.com` (alternativa)

---

## ✅ Checklist de Verificación

- [ ] Google Auth está habilitado
- [ ] Email de soporte configurado
- [ ] Login funciona en https://piv-manager.web.app
- [ ] Usuario puede ver su email en el header
- [ ] Logout funciona correctamente

---

## 🔧 Solución de Problemas

### Error: "Este dominio no está autorizado"
**Solución**: Ve a Authentication → Settings → Authorized domains y añade tu dominio

### Error: "Popup bloqueado"
**Solución**: Permite popups para `piv-manager.web.app` en tu navegador

### Error: "auth/popup-closed-by-user"
**Solución**: El usuario cerró la ventana de login antes de completarlo. Intenta de nuevo.

### No aparece el botón de login
**Solución**: 
1. Abre la consola del navegador (F12)
2. Busca errores de Firebase
3. Verifica que `firebaseConfig.js` esté cargado correctamente

---

## 📞 Soporte

Si tienes problemas:
- Revisa la consola de Firebase: https://console.firebase.google.com/project/piv-manager
- Documentación oficial: https://firebase.google.com/docs/auth/web/google-signin
