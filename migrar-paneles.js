// Script para migrar paneles desde JSON a Firestore
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';

// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBtOWKZh8WelWpsXIbsk_AWb7hBSJVUP3Y",
  authDomain: "piv-manager.firebaseapp.com",
  projectId: "piv-manager",
  storageBucket: "piv-manager.firebasestorage.app",
  messagingSenderId: "984787325363",
  appId: "1:984787325363:web:3b34b5dad3c3fde846fbc6"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Función para cargar los paneles desde el JSON
async function cargarPaneles() {
  try {
    console.log('📥 Cargando paneles desde JSON...');
    const response = await fetch('./paneles_octubre_2025.json');
    const paneles = await response.json();
    console.log(`✅ ${paneles.length} paneles encontrados en el archivo JSON`);
    return paneles;
  } catch (error) {
    console.error('❌ Error al cargar el archivo JSON:', error);
    throw error;
  }
}

// Función para verificar si ya existen paneles
async function verificarPanelesExistentes() {
  try {
    const q = query(collection(db, 'paneles'));
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('❌ Error al verificar paneles existentes:', error);
    return 0;
  }
}

// Función para migrar paneles a Firestore
async function migrarPaneles(paneles) {
  console.log('\n🚀 Iniciando migración a Firestore...');
  
  let exitosos = 0;
  let errores = 0;
  const totalPaneles = paneles.length;
  
  for (let i = 0; i < paneles.length; i++) {
    const panel = paneles[i];
    
    try {
      // Agregar campos adicionales
      const panelData = {
        municipio: panel.municipio,
        codigo: panel.codigo,
        fechaInstalacion: panel.fechaInstalacion,
        fechaDesmontaje: panel.fechaDesmontaje,
        estado: panel.fechaDesmontaje ? 'desmontado' : 'activo',
        operador: 'UTE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'paneles'), panelData);
      exitosos++;
      
      // Mostrar progreso cada 50 registros
      if ((i + 1) % 50 === 0 || i === paneles.length - 1) {
        const porcentaje = ((i + 1) / totalPaneles * 100).toFixed(1);
        console.log(`⏳ Progreso: ${i + 1}/${totalPaneles} (${porcentaje}%) - Exitosos: ${exitosos}, Errores: ${errores}`);
      }
      
      // Pequeña pausa para evitar límites de Firestore
      if ((i + 1) % 100 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      console.error(`❌ Error al agregar panel ${panel.codigo}:`, error.message);
      errores++;
    }
  }
  
  console.log('\n📊 RESUMEN DE MIGRACIÓN:');
  console.log(`✅ Paneles migrados exitosamente: ${exitosos}`);
  console.log(`❌ Errores: ${errores}`);
  console.log(`📈 Total procesados: ${exitosos + errores}`);
  
  return { exitosos, errores };
}

// Función principal
async function main() {
  try {
    console.log('🔥 PIV Manager - Migración de Paneles');
    console.log('=====================================\n');
    
    // Verificar si ya hay paneles
    const panelesExistentes = await verificarPanelesExistentes();
    console.log(`📊 Paneles existentes en Firestore: ${panelesExistentes}`);
    
    if (panelesExistentes > 0) {
      const confirmacion = confirm(
        `⚠️ Ya existen ${panelesExistentes} paneles en la base de datos.\n\n` +
        `¿Deseas continuar y agregar los nuevos paneles?\n\n` +
        `Nota: Esto NO eliminará los paneles existentes.`
      );
      
      if (!confirmacion) {
        console.log('❌ Migración cancelada por el usuario');
        return;
      }
    }
    
    // Cargar paneles del JSON
    const paneles = await cargarPaneles();
    
    // Confirmar migración
    const confirmar = confirm(
      `📋 Se van a migrar ${paneles.length} paneles a Firestore.\n\n` +
      `¿Deseas continuar?`
    );
    
    if (!confirmar) {
      console.log('❌ Migración cancelada por el usuario');
      return;
    }
    
    // Ejecutar migración
    const resultado = await migrarPaneles(paneles);
    
    if (resultado.exitosos > 0) {
      console.log('\n✅ ¡Migración completada exitosamente!');
      console.log(`🎉 ${resultado.exitosos} paneles agregados a Firestore`);
    } else {
      console.log('\n❌ La migración no pudo completarse');
    }
    
  } catch (error) {
    console.error('❌ Error fatal en la migración:', error);
  }
}

// Exportar función para uso en consola
window.migrarPaneles = main;

// Mensaje de instrucciones
console.log('\n📖 INSTRUCCIONES:');
console.log('1. Asegúrate de estar autenticado en la aplicación');
console.log('2. Abre la consola del navegador (F12)');
console.log('3. Ejecuta: migrarPaneles()');
console.log('4. Confirma la migración\n');
