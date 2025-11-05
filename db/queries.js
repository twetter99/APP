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
 * @param {Object} db - Instancia de Firestore
 * @param {string} operadorId - ID del operador
 * @returns {Promise<Array>} Lista de paneles
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
 * Listar todos los paneles (sin filtro)
 * @param {Object} db - Instancia de Firestore
 * @returns {Promise<Array>} Lista de todos los paneles
 */
export async function listarTodosPaneles(db) {
  try {
    const q = query(
      collection(db, 'paneles'),
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
    console.error('Error al listar paneles:', error);
    throw error;
  }
}

/**
 * Listar incidencias abiertas
 * @param {Object} db - Instancia de Firestore
 * @returns {Promise<Array>} Lista de incidencias abiertas
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
 * @param {Object} db - Instancia de Firestore
 * @param {string} clienteId - ID del cliente
 * @returns {Promise<Array>} Lista de facturas del cliente
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
 * @param {Object} db - Instancia de Firestore
 * @param {Object} panelData - Datos del panel
 * @returns {Promise<string>} ID del panel creado
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

/**
 * Actualizar un panel existente
 * @param {Object} db - Instancia de Firestore
 * @param {string} panelId - ID del panel
 * @param {Object} updates - Datos a actualizar
 * @returns {Promise<void>}
 */
export async function actualizarPanel(db, panelId, updates) {
  try {
    const panelRef = doc(db, 'paneles', panelId);
    await updateDoc(panelRef, {
      ...updates,
      fechaModificacion: serverTimestamp()
    });
  } catch (error) {
    console.error('Error al actualizar panel:', error);
    throw error;
  }
}

/**
 * Eliminar un panel
 * @param {Object} db - Instancia de Firestore
 * @param {string} panelId - ID del panel
 * @returns {Promise<void>}
 */
export async function eliminarPanel(db, panelId) {
  try {
    await deleteDoc(doc(db, 'paneles', panelId));
  } catch (error) {
    console.error('Error al eliminar panel:', error);
    throw error;
  }
}

/**
 * Crear incidencia
 * @param {Object} db - Instancia de Firestore
 * @param {Object} incidenciaData - Datos de la incidencia
 * @returns {Promise<string>} ID de la incidencia creada
 */
export async function crearIncidencia(db, incidenciaData) {
  try {
    const docRef = await addDoc(collection(db, 'incidencias'), {
      ...incidenciaData,
      fecha: serverTimestamp(),
      estado: incidenciaData.estado || 'abierta'
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error al crear incidencia:', error);
    throw error;
  }
}

/**
 * Guardar histórico mensual
 * @param {Object} db - Instancia de Firestore
 * @param {Object} historicoData - Datos del histórico
 * @returns {Promise<string>} ID del histórico
 */
export async function guardarHistorico(db, historicoData) {
  try {
    const docRef = await addDoc(collection(db, 'historicos'), {
      ...historicoData,
      fechaGuardado: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error al guardar histórico:', error);
    throw error;
  }
}

/**
 * Obtener históricos por mes y año
 * @param {Object} db - Instancia de Firestore
 * @param {string} mes - Mes (formato: "01"-"12")
 * @param {string} año - Año (formato: "2025")
 * @returns {Promise<Object|null>} Datos del histórico o null
 */
export async function obtenerHistoricoPorMes(db, mes, año) {
  try {
    const q = query(
      collection(db, 'historicos'),
      where('mes', '==', mes),
      where('año', '==', año),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error al obtener histórico:', error);
    throw error;
  }
}
