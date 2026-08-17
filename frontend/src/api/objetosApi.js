//LOCA

/*const BASE = "http://localhost:5000";

export async function getObjetos() {
  const response = await fetch(`${BASE}/objetos`);
  const data = await response.json();
  return data;
}

export async function crearObjeto(payload) {
  const response = await fetch(`${BASE}/guardar_objeto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("No se pudo guardar");
  }

  const data = await response.json().catch(() => ({}));
  return data;
}
export async function eliminarObjeto(id) {
  const response = await fetch(`http://localhost:5000/objetos/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("No se pudo eliminar el objeto");
  }

  return response.json();
}

export async function eliminarTodos() {
  const response = await fetch("http://localhost:5000/objetos", {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("No se pudo eliminar todo");
  }

  return response.json();
}

export async function eliminarMision(tema) {
  const response = await fetch(`${BASE}/objetos/tema/${encodeURIComponent(tema)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("No se pudo eliminar la misión");
  }

  return response.json();
}

export async function actualizarObjeto(id, payload) {
  const response = await fetch(`http://localhost:5000/objetos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("No se pudo actualizar");
  return response.json();
}*/

// PARA QUE ACCEDAN OTROS EN LA MISMA RED
const BASE = `http://${window.location.hostname}:5000`;

export async function getObjetos() {
  const response = await fetch(`${BASE}/objetos`);
  const data = await response.json();
  return data;
}

export async function crearObjeto(payload) {
  const response = await fetch(`${BASE}/guardar_objeto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("No se pudo guardar");
  }

  const data = await response.json().catch(() => ({}));
  return data;
}

export async function eliminarObjeto(id) {
  const response = await fetch(`${BASE}/objetos/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("No se pudo eliminar el objeto");
  }

  return response.json();
}

export async function eliminarTodos() {
  const response = await fetch(`${BASE}/objetos`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("No se pudo eliminar todo");
  }

  return response.json();
}

export async function eliminarMision(tema) {
  const response = await fetch(`${BASE}/objetos/tema/${encodeURIComponent(tema)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("No se pudo eliminar la misión");
  }

  return response.json();
}

export async function actualizarObjeto(id, payload) {
  const response = await fetch(`${BASE}/objetos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("No se pudo actualizar");
  return response.json();
}