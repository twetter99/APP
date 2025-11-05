# 🚀 PIV Manager - Sistema de Gestión de Paneles TFT CRTM

Sistema completo de gestión de paneles informativos TFT para CRTM con Firebase Firestore, autenticación Google y gestión de cambios mensuales.

## 🎯 **Características Principales**

- ✅ Gestión de paneles con línea base (Octubre 2025)
- ✅ Sistema de cambios mensuales (ALTA, BAJA, DESMONTAJE, CAMBIO_TARIFA)
- ✅ Cálculo automático de facturación prorrateada
- ✅ Historial completo de cambios por mes
- ✅ Sincronización con Firebase Firestore
- ✅ Autenticación con Google
- ✅ Exportación a Excel
- ✅ Backup y restauración

## 📦 **Tecnologías**

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: Firebase Firestore (Base de datos NoSQL)
- **Autenticación**: Firebase Auth con Google
- **Hosting**: Firebase Hosting
- **Gestión**: Firebase CLI
- **Exportación**: SheetJS (XLSX)

## 🚀 **Acceso Rápido**

- **Aplicación**: https://piv-manager.web.app
- **Firebase Console**: https://console.firebase.google.com/project/piv-manager
- **Firestore Database**: https://console.firebase.google.com/project/piv-manager/firestore

## 📚 **Documentación**

### Guías de Usuario
1. **[RESUMEN_SISTEMA.md](RESUMEN_SISTEMA.md)** - Resumen ejecutivo (¡empieza aquí!)
2. **[GESTION_CAMBIOS_MENSUALES.md](GESTION_CAMBIOS_MENSUALES.md)** - Guía completa de cambios mensuales
3. **[PLANTILLA_EXCEL_CAMBIOS.md](PLANTILLA_EXCEL_CAMBIOS.md)** - Formato del Excel para cambios
4. **[COMO_CARGAR_DATOS.md](COMO_CARGAR_DATOS.md)** - Cómo cargar datos desde Firestore
5. **[INSTRUCCIONES_MIGRACION.md](INSTRUCCIONES_MIGRACION.md)** - Migración inicial de paneles

### Guías Técnicas
- **[README.md](README.md)** - Esta documentación técnica
- **[INSTRUCCIONES_AUTH.md](INSTRUCCIONES_AUTH.md)** - Configuración de autenticación
- `firestore.rules` - Reglas de seguridad
- `db/queries.js` - Funciones de base de datos

## 🎯 **Inicio Rápido**

### Para Usuarios
1. Ve a https://piv-manager.web.app
2. Inicia sesión con Google
3. Los datos se cargan automáticamente desde Firestore
4. Para procesar cambios mensuales:
   - Prepara Excel con hojas ALTAS, BAJAS, DESMONTAJES, CAMBIOS_TARIFA
   - Click "📋 Procesar Cambios Mensuales"
   - Selecciona mes y archivo
   - ¡Listo!

📖 **Ver**: [RESUMEN_SISTEMA.md](RESUMEN_SISTEMA.md) para guía completa de uso

### Para Desarrolladores

```powershell
# Clonar repositorio
git clone <tu-repositorio>
cd APP

# Instalar dependencias
npm install

# Configurar Firebase CLI
npm install -g firebase-tools
firebase login

# Desplegar a producción
npm run deploy

# O solo hosting
npm run deploy:hosting
```

## � **Sistema de Cambios Mensuales**

### Conceptos Clave

**Línea Base**: Octubre 2025
- Contiene todos los paneles existentes a 30/10/2025
- Base de referencia para facturación

**Cambios Mensuales**: Desde Noviembre 2025
- **ALTA** 📈: Nuevo panel instalado
- **BAJA** 📉: Panel eliminado completamente
- **DESMONTAJE** 📦: Panel inactivo (sigue en sistema)
- **CAMBIO_TARIFA** 💰: Ajuste de precio

### Flujo de Trabajo Mensual

```
1. Preparar Excel con cambios
   ├─ Hoja: ALTAS
   ├─ Hoja: BAJAS
   ├─ Hoja: DESMONTAJES
   └─ Hoja: CAMBIOS_TARIFA

2. En la aplicación
   ├─ Seleccionar mes (ej: Noviembre 2025)
   └─ Click "Procesar Cambios Mensuales"

3. Verificar
   ├─ Ver resumen de cambios
   ├─ Click "Ver Cambios Mensuales"
   └─ Exportar Excel para revisión
```

📖 **Ver**: [GESTION_CAMBIOS_MENSUALES.md](GESTION_CAMBIOS_MENSUALES.md) para guía completa

## 📝 **Formato del Excel**

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

📖 **Ver**: [PLANTILLA_EXCEL_CAMBIOS.md](PLANTILLA_EXCEL_CAMBIOS.md) para detalles completos

## �🔧 **Configuración Inicial**

### 1. Prerrequisitos

```powershell
# Verificar Node.js y npm
node --version  # v22.18.0 o superior
npm --version   # 10.9.3 o superior

# Instalar Firebase CLI globalmente
npm install -g firebase-tools

# Verificar instalación
firebase --version
```

### 2. Autenticación en Firebase

```powershell
# Login en Firebase
firebase login

# Verificar proyectos disponibles
firebase projects:list
```

### 3. Configurar credenciales de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto **PIV Manager**
3. Ve a **Configuración del proyecto** (icono engranaje ⚙️)
4. En **"Tus apps"** → **"SDK setup and configuration"**
5. Copia las credenciales y edita `firebaseConfig.js`:

```javascript
export const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "piv-manager.firebaseapp.com",
  projectId: "piv-manager",
  storageBucket: "piv-manager.firebasestorage.app",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};
```

⚠️ **IMPORTANTE**: `firebaseConfig.js` está en `.gitignore` y NO debe subirse a Git.

## 🔐 **Seguridad - Firestore Rules**

Las reglas de seguridad están en `firestore.rules`:

- **Paneles**: Lectura pública, escritura autenticada con validación
- **Incidencias**: Lectura pública, escritura autenticada
- **Facturas**: Solo usuarios autenticados
- **Históricos**: Solo usuarios autenticados
- **Operadores**: Solo usuarios autenticados

## 🚀 **Despliegue a Producción**

### Opción 1: Despliegue completo

```powershell
# Desplegar todo (Firestore + Hosting)
npm run deploy

# O usando Firebase CLI directamente
firebase deploy
```

### Opción 2: Despliegue selectivo

```powershell
# Solo Hosting
npm run deploy:hosting

# Solo Firestore (reglas e índices)
npm run deploy:firestore
```

### Opción 3: Preview antes de producción

```powershell
# Crear canal de preview (expira en 7 días)
npm run serve

# Esto genera una URL temporal como:
# https://conectaciudad-1741118722591--preview-xxxxx.web.app
```

## 🧪 **Desarrollo Local**

```powershell
# Servir localmente (sin emuladores)
npm run serve:local

# Acceder en: http://localhost:5000
```

## 📊 **Estructura del Proyecto**

```
APP/
├── public/                  # Carpeta de despliegue
│   └── index.html          # HTML con Firebase SDK integrado
├── db/                     # Queries de Firestore
│   └── queries.js          # Funciones CRUD
├── firebaseConfig.js       # Configuración Firebase (NO en Git)
├── firestore.rules         # Reglas de seguridad
├── firestore.indexes.json  # Índices compuestos
├── firebase.json           # Configuración Firebase
├── .firebaserc            # Proyecto activo
├── package.json           # Scripts npm
└── README.md              # Esta documentación
```

## 📝 **Funciones Disponibles (queries.js)**

### Paneles
- `listarTodosPaneles(db)` - Lista todos los paneles
- `listarPanelesPorOperador(db, operadorId)` - Filtra por operador
- `agregarPanel(db, panelData)` - Crear nuevo panel
- `actualizarPanel(db, panelId, updates)` - Actualizar panel
- `eliminarPanel(db, panelId)` - Eliminar panel

### Incidencias
- `listarIncidenciasAbiertas(db)` - Incidencias activas
- `crearIncidencia(db, incidenciaData)` - Nueva incidencia

### Facturas
- `listarFacturasPorCliente(db, clienteId)` - Facturas por cliente

### Históricos
- `guardarHistorico(db, historicoData)` - Guardar snapshot mensual
- `obtenerHistoricoPorMes(db, mes, año)` - Recuperar histórico

## 🔑 **Autenticación**

### Habilitar Google Auth en Firebase Console

1. Ve a **Authentication** → **Sign-in method**
2. Habilita **Google** como proveedor
3. Configura el correo de soporte del proyecto
4. Guarda cambios

### Uso en la aplicación

```javascript
// Login
await loginWithGoogle();

// Logout
await logoutFromGoogle();

// Estado del usuario
firebaseAuth.currentUser
```

## 📈 **Monitoreo y Logs**

```powershell
# Ver logs de Firebase
npm run logs

# Ver uso de Firestore
firebase firestore:indexes
```

## 🛡️ **Buenas Prácticas**

1. ✅ **Nunca** commits `firebaseConfig.js` a Git
2. ✅ Valida datos antes de enviar a Firestore
3. ✅ Usa `serverTimestamp()` para fechas
4. ✅ Crea índices compuestos para queries complejas
5. ✅ Revisa las reglas de seguridad periódicamente
6. ✅ Usa preview antes de deploy a producción

## 🔗 **URLs de Producción**

- **Hosting**: `https://piv-manager.web.app`
- **Console**: `https://console.firebase.google.com/project/piv-manager`
- **Firestore**: Ver en Console → Firestore Database

## 📞 **Soporte y Documentación**

### Guías por Tema

| Tema | Documento | Descripción |
|------|-----------|-------------|
| 🚀 Inicio Rápido | [RESUMEN_SISTEMA.md](RESUMEN_SISTEMA.md) | Resumen ejecutivo para empezar |
| 📋 Cambios Mensuales | [GESTION_CAMBIOS_MENSUALES.md](GESTION_CAMBIOS_MENSUALES.md) | Guía completa de ALTA/BAJA/DESMONTAJE |
| 📄 Plantilla Excel | [PLANTILLA_EXCEL_CAMBIOS.md](PLANTILLA_EXCEL_CAMBIOS.md) | Formato del Excel de cambios |
| 📥 Cargar Datos | [COMO_CARGAR_DATOS.md](COMO_CARGAR_DATOS.md) | Cómo cargar desde Firestore |
| 🔄 Migración | [INSTRUCCIONES_MIGRACION.md](INSTRUCCIONES_MIGRACION.md) | Migración inicial de paneles |
| 🔐 Autenticación | [INSTRUCCIONES_AUTH.md](INSTRUCCIONES_AUTH.md) | Configurar Google Auth |

### Enlaces Útiles

- **Firebase Docs**: https://firebase.google.com/docs
- **Firestore Rules**: https://firebase.google.com/docs/firestore/security/get-started
- **SheetJS Docs**: https://docs.sheetjs.com

### Problemas Comunes

| Problema | Solución |
|----------|----------|
| "Panel no encontrado" | Verifica el código en la tabla principal |
| "Solo desde Noviembre 2025" | Cambia el mes a Nov 2025 o posterior |
| "Panel ya existe" | El código está duplicado en ALTAS |
| Cambios no se aplican | Verifica nombres de hojas en Excel |
| Facturación muestra 0,00 € | Recarga datos desde Firestore |

## 🎉 **Changelog**

### v2.0 - Sistema de Cambios Mensuales (4 Nov 2025)
- ✨ Nuevo: Sistema de cambios mensuales (ALTA/BAJA/DESMONTAJE/CAMBIO_TARIFA)
- ✨ Nuevo: Historial completo de cambios por mes
- ✨ Nuevo: Botón "Ver Cambios Mensuales"
- ✨ Nuevo: Validación de fecha mínima (Nov 2025)
- ✨ Nuevo: Registro de motivos en BAJAS
- ✨ Mejora: Cálculo de facturación prorrateada
- 📚 Nuevo: Documentación completa del sistema

### v1.0 - Línea Base (3 Nov 2025)
- ✨ Migración de paneles desde JSON a Firestore
- ✨ Carga automática desde Firestore
- ✨ Botón "Recargar Datos desde Firestore"
- ✨ Autenticación con Google
- ✨ Exportación a Excel
- ✨ Historial mensual
- 🔒 Reglas de seguridad Firestore

## 📞 **Soporte**

Para problemas o preguntas:
- Firebase Docs: https://firebase.google.com/docs
- Firestore Rules: https://firebase.google.com/docs/firestore/security/get-started

---

**Última actualización**: 4 de noviembre de 2025  
**Versión**: 2.0 - Sistema de Cambios Mensuales  
**Proyecto Firebase**: PIV Manager (`piv-manager`)  
**Línea Base**: Octubre 2025  
**Cambios Mensuales**: Desde Noviembre 2025

---

## 👥 **Equipo**

- **Proyecto**: PIV Manager
- **Cliente**: UTE - CRTM
- **Email Soporte**: twetter@gmail.com
- **Hosting**: Firebase (https://piv-manager.web.app)

## 📄 **Licencia**

Uso interno para UTE - CRTM. Todos los derechos reservados.
