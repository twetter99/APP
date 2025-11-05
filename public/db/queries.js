// queries.js - Funciones para consultar Firestore
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';

/**
 * Listar paneles por operador
 */
export async function listarPanelesPorOperador(db, operadorId) {
  try {
    const q = query(
      collection(db, 'paneles'),
      where('operadorId', '==', operadorId),
      orderBy('municipio', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const paneles = [];
    
    querySnapshot.forEach((doc) => {
      paneles.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return paneles;
  } catch (error) {
    console.error('Error al listar paneles por operador:', error);
    throw error;
  }
}

/**
 * Listar todos los paneles
 */
export async function listarTodosPaneles(db) {
  try {
    const querySnapshot = await getDocs(collection(db, 'paneles'));
    const paneles = [];
    
    querySnapshot.forEach((doc) => {
      paneles.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return paneles;
  } catch (error) {
    console.error('Error al listar paneles:', error);
    throw error;
  }
}

/**
 * Listar incidencias abiertas
 */
export async function listarIncidenciasAbiertas(db) {
  try {
    const q = query(
      collection(db, 'incidencias'),
      where('estado', 'in', ['abierta', 'en_proceso']),
      orderBy('fecha', 'desc'),
      limit(100)
    );
    
    const querySnapshot = await getDocs(q);
    const incidencias = [];
    
    querySnapshot.forEach((doc) => {
      incidencias.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return incidencias;
  } catch (error) {
    console.error('Error al listar incidencias:', error);
    throw error;
  }
}

/**
 * Listar facturas por cliente
 */
export async function listarFacturasPorCliente(db, clienteId) {
  try {
    const q = query(
      collection(db, 'facturas'),
      where('clienteId', '==', clienteId),
      orderBy('año', 'desc'),
      orderBy('mes', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const facturas = [];
    
    querySnapshot.forEach((doc) => {
      facturas.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return facturas;
  } catch (error) {
    console.error('Error al listar facturas:', error);
    throw error;
  }
}

/**
 * Agregar un nuevo panel
 */
export async function agregarPanel(db, panelData) {
  try {
    const docRef = await addDoc(collection(db, 'paneles'), {
      ...panelData,
      fechaCreacion: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error al agregar panel:', error);
    throw error;
  }
}
