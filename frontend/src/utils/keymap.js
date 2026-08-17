// Mapea teclas a nombres simples
export const teclaMapeada = {
  ARROWDOWN: "Abajo",
  ARROWUP: "Arriba",
  ARROWLEFT: "Izquierda",
  ARROWRIGHT: "Derecha",
  SPACE: "Espacio",
  ENTER: "Clic",
  " ": "Espacio",
};

export function normalizarTecla(eventKey) {
  const teclaMakey = (eventKey || "").toUpperCase();
  return teclaMapeada[teclaMakey] || teclaMakey;
}
