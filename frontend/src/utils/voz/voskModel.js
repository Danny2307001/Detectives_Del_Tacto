/**
 * voskModel.js
 * 
 * Gestor del modelo IA de Vosk.
 * Encargado de la descarga, inicialización y caché del modelo.
 */

import { createModel } from 'vosk-browser';

const MODEL_URL = '/vosk-model-es.tar.gz';

let modelPromise = null;
let modelInstance = null;

/**
 * Carga el modelo Vosk (singleton - solo se carga una vez)
 */
export async function cargarModelo(onEstado) {
  if (modelInstance) return modelInstance;

  if (modelPromise) return modelPromise;

  modelPromise = (async () => {
    try {
      onEstado?.('cargando');
      console.log('🔄 Cargando modelo Vosk español...');

      const model = await createModel(MODEL_URL);
      modelInstance = model;

      console.log('✅ Modelo Vosk cargado correctamente');
      onEstado?.('listo');
      return model;
    } catch (error) {
      console.error('❌ Error al cargar modelo Vosk:', error);
      modelPromise = null;
      onEstado?.('error');
      throw error;
    }
  })();

  return modelPromise;
}
