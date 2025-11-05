// Script de autenticación - NO module para compatibilidad con onclick
// Usa las variables globales expuestas desde el módulo principal

console.log('auth.js cargado');

// Función de inicio de sesión
async function iniciarSesionConGoogle() {
    console.log('iniciarSesionConGoogle llamada');
    
    // Verificar que Firebase esté cargado
    if (!window.firebaseAuth || !window.GoogleAuthProvider || !window.signInWithPopup) {
        console.error('Firebase no está inicializado correctamente');
        alert('Error: Firebase no está listo. Recarga la página.');
        return;
    }
    
    const provider = new window.GoogleAuthProvider();
    
    try {
        console.log('Intentando login con Google...');
        const result = await window.signInWithPopup(window.firebaseAuth, provider);
        console.log('✓ Login exitoso:', result.user.email);
        
    } catch (error) {
        console.error('✖ Error en login:', error);
        
        if (error.code === 'auth/popup-closed-by-user') {
            alert('Inicio de sesión cancelado');
        } else if (error.code === 'auth/network-request-failed') {
            alert('No hay conexión. Verifica tu internet');
        } else if (error.code === 'auth/unauthorized-domain') {
            alert('Dominio no autorizado. Contacta al administrador');
        } else {
            alert('Error al iniciar sesión: ' + error.message);
        }
    }
}

// Función de cerrar sesión
async function cerrarSesion() {
    const confirmar = confirm('¿Seguro que quieres cerrar sesión?');
    
    if (!confirmar) return;
    
    try {
        await window.signOut(window.firebaseAuth);
        console.log('✓ Logout exitoso');
    } catch (error) {
        console.error('✖ Error en logout:', error);
        alert('Error al cerrar sesión');
    }
}

// Exponer funciones globalmente
window.iniciarSesionConGoogle = iniciarSesionConGoogle;
window.cerrarSesion = cerrarSesion;

console.log('Funciones de auth expuestas globalmente');
