/**
 * textUtils.js
 * 
 * Funciones de utilidad para procesar y limpiar texto.
 */

/**
 * Normaliza texto para comparación de comandos
 * Pasa a minúsculas, remueve acentos y recorta espacios.
 * 
 * @param {string} texto 
 * @returns {string} texto normalizado
 */
export function normalizarTexto(texto) {
  return (texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}
