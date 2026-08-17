import { useMemo, useState } from "react";
import { crearObjeto, eliminarTodos, actualizarObjeto, eliminarMision as apiEliminarMision, eliminarObjeto as apiEliminarObjeto } from "../../api/objetosApi";

const teclasMakeyMakey = ["Arriba", "Abajo", "Izquierda", "Derecha", "Espacio", "Clic"];

function cleanText(s) {
  return (s || "").trim().replace(/\s+/g, " ");
}

function generarDescripcionAutomatica(forma, tamaño, textura, material, sonido, peso) {
  const partes = [];

  if (forma) {
    const extraerPrincipal = (s) => s.split("(")[0].trim();
    partes.push(`El objeto tiene forma ${extraerPrincipal(forma).toLowerCase()}.`);
  }

  if (tamaño) {
    const extraerPrincipal = (s) => s.split("(")[0].trim();
    partes.push(`Es ${extraerPrincipal(tamaño).toLowerCase()}.`);
  }

  if (textura) {
    const extraerPrincipal = (s) => s.split("(")[0].trim();
    partes.push(`Al tocarlo se siente ${extraerPrincipal(textura).toLowerCase()}.`);
  }

  if (material) {
    const extraerPrincipal = (s) => s.split("(")[0].trim();
    partes.push(`Es ${extraerPrincipal(material).toLowerCase()}.`);
  }

  if (sonido) {
    partes.push(`${sonido}.`);
  }

  if (peso) {
    partes.push(`Es ${peso.toLowerCase()}.`);
  }

  return partes.join(" ");
}

export default function useModoEducador(objetos, onCreated, audioActivo = true, microfonoActivo = true) {
  const [nombre, setNombre] = useState("");
  const [tecla, setTecla] = useState("");
  const [modalNotificacion, setModalNotificacion] = useState(null);
  const [descripcionMejorada, setDescripcionMejorada] = useState("");
  const [textura, setTextura] = useState("");
  const [forma, setForma] = useState("");
  const [tamaño, setTamaño] = useState("");
  const [material, setMaterial] = useState("");
  const [sonido, setSonido] = useState("");
  const [peso, setPeso] = useState("");
  const [funcion, setFuncion] = useState("");
  const [imagen, setImagen] = useState("");
  const [imagenPreview, setImagenPreview] = useState("");
  const [editId, setEditId] = useState(null);
  const [temaActual, setTemaActual] = useState("");
  const [nuevoTema, setNuevoTema] = useState("");
  const [temasCreados, setTemasCreados] = useState([]);

  // Generar descripción automática cuando cambian los campos
  const descripcionAutomatica = generarDescripcionAutomatica(
    forma,
    tamaño,
    textura,
    material,
    sonido,
    peso
  );

  const temas = useMemo(() => {
    const temasDeObjetos = (objetos || [])
      .map((o) => o.tema)
      .filter(Boolean);
    const todosLosTemas = [...new Set([...temasDeObjetos, ...temasCreados])];
    return todosLosTemas;
  }, [objetos, temasCreados]);

  const objetosFiltrados = useMemo(() => {
  return (objetos || []).filter(
    (o) =>
      (o.tema || "").toLowerCase() ===
      (temaActual || "").toLowerCase()
  );
  }, [objetos, temaActual]);

  const teclaToObjeto = useMemo(() => {
    const map = new Map();
    (objetosFiltrados || []).forEach((o) => {
      if (o?.tecla) map.set(o.tecla, o);
    });
    return map;
  }, [objetosFiltrados]);

  const nombresSet = useMemo(() => {
    const set = new Set();
    (objetosFiltrados || []).forEach((o) => {
      if (o?.nombre) set.add(cleanText(o.nombre).toLowerCase());
    });
    return set;
  }, [objetosFiltrados]);

  const teclasDisponibles = useMemo(() => {
    const usadas = new Set((objetosFiltrados || []).map((o) => o?.tecla).filter(Boolean));
    return teclasMakeyMakey.filter((t) => !usadas.has(t));
  }, [objetosFiltrados]);

  async function guardarObjeto() {
    // Verificar que hay un tema seleccionado
    if (!temaActual || !temaActual.trim()) {
      setModalNotificacion({ titulo: "Atención", mensaje: "Por favor selecciona un tema antes de guardar un objeto." });
      return;
    }

    const n = cleanText(nombre);
    const dm = cleanText(descripcionMejorada);
    const t = cleanText(tecla);
    const tex = cleanText(textura);
    const f = cleanText(forma);
    const tam = cleanText(tamaño);
    const m = cleanText(material);
    const s = cleanText(sonido);
    const p = cleanText(peso);

    if (!n || !t || !tex || !f || !tam || !m || !s || !p) {
      setModalNotificacion({ titulo: "Campos incompletos", mensaje: "Completa todos los campos: nombre, tecla, textura, forma, tamaño, material, sonido y peso." });
      return;
    }

    if (n.length < 2) {
      setModalNotificacion({ titulo: "Nombre inválido", mensaje: "El nombre es muy corto." });
      return;
    }

    if (n.length > 30) {
      setModalNotificacion({ titulo: "Nombre inválido", mensaje: "El nombre es muy largo (máx. 30 caracteres)." });
      return;
    }

    // La descripción mejorada es opcional
    if (dm.length > 1000) {
      setModalNotificacion({ titulo: "Descripción inválida", mensaje: "La descripción mejorada es muy larga (máx. 1000 caracteres)." });
      return;
    }

    const ya = teclaToObjeto.get(t);
    if (ya) {
      setModalNotificacion({ titulo: "Tecla ocupada", mensaje: `La tecla "${t}" ya está asignada a: "${ya.nombre}" en la misión "${temaActual}". Elige otra tecla.` });
      return;
    }

    if (nombresSet.has(n.toLowerCase())) {
      setModalNotificacion({ titulo: "Objeto existente", mensaje: `Ya existe un objeto con nombre "${n}". Cambia el nombre o edítalo.` });
      return;
    }

    if (teclasDisponibles.length === 0) {
      setModalNotificacion({ titulo: "Sin teclas disponibles", mensaje: "Ya no hay teclas Makey Makey disponibles. Elimina o reasigna un objeto." });
      return;
    }

    try {
      await crearObjeto({ 
        tema: temaActual,
        nombre: n, 
        tecla: t, 
        descripcion: dm,
        descripcionAutomatica,
        textura: tex, 
        forma: f, 
        tamaño: tam, 
        material: m, 
        peso: p,
        funcion: cleanText(funcion),
        sonido: s,
        imagen
      });
      await onCreated();

      setNombre("");
      setTecla("");
      setDescripcionMejorada("");
      setTextura("");
      setForma("");
      setTamaño("");
      setMaterial("");
      setSonido("");
      setPeso("");
      setFuncion("");
      setImagen("");
      setImagenPreview("");
      setModalNotificacion({ titulo: "Objeto guardado", mensaje: "El objeto ha sido guardado correctamente." });
    } catch (e) {
      setModalNotificacion({ titulo: "Error", mensaje: "No se pudo guardar el objeto. Por favor, revisa el backend." });
      console.error(e);
    }
  }

  async function eliminarTodo() {
    try {
      if (temaActual) {
        await apiEliminarMision(temaActual);
        await onCreated();
        setModalNotificacion({ 
          titulo: "Objetos eliminados", 
          mensaje: `Todos los objetos de la misión "${temaActual}" fueron eliminados.` 
        });
      } else {
        await eliminarTodos();
        await onCreated();
        setModalNotificacion({ titulo: "Objetos eliminados", mensaje: "Todos los objetos fueron eliminados." });
      }
    } catch (error) {
      setModalNotificacion({ titulo: "Error", mensaje: "Error al eliminar los objetos." });
      console.error(error);
    }
  }

  function iniciarEdicion(obj) {
    setEditId(obj._id);
    setNombre(obj.nombre || "");
    setDescripcionMejorada(obj.descripcion || "");
    setTecla(obj.tecla || "");
    setTextura(obj.textura || "");
    setForma(obj.forma || "");
    setTamaño(obj.tamaño || "");
    setMaterial(obj.material || "");
    setSonido(obj.sonido || "");
    setPeso(obj.peso || "");
    setFuncion(obj.funcion || "");
    setImagen(obj.imagen || "");
    setImagenPreview(obj.imagen || "");
  }

  async function guardarEdicion() {
    const n = cleanText(nombre);
    const dm = cleanText(descripcionMejorada);
    const tex = cleanText(textura);
    const f = cleanText(forma);
    const tam = cleanText(tamaño);
    const m = cleanText(material);
    const s = cleanText(sonido);
    const p = cleanText(peso);

    if (!n || !tex || !f || !tam || !m || !s || !p) {
      setModalNotificacion({ titulo: "Campos incompletos", mensaje: "Completa todos los campos: nombre, textura, forma, tamaño, material, sonido y peso." });
      return;
    }

    try {
      await actualizarObjeto(editId, { 
        tema: temaActual,
        nombre: n, 
        descripcion: dm,
        descripcionAutomatica,
        textura: tex, 
        forma: f, 
        tamaño: tam, 
        material: m, 
        sonido: s, 
        funcion: cleanText(funcion),
        peso: p,
        imagen
      });
      await onCreated();
      cancelarEdicion();
      setModalNotificacion({ titulo: "Objeto actualizado", mensaje: "El objeto ha sido actualizado correctamente." });
    } catch (e) {
      setModalNotificacion({ titulo: "Error", mensaje: "No se pudo actualizar el objeto." });
      console.error(e);
    }
  }

  function cancelarEdicion() {
    setEditId(null);
    setNombre("");
    setDescripcionMejorada("");
    setTecla("");
    setTextura("");
    setForma("");
    setTamaño("");
    setMaterial("");
    setFuncion("");
    setSonido("");
    setPeso("");
    setImagen("");
    setImagenPreview("");
  }

  function manejarCambioImagen(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;

    // Validar que sea una imagen
    if (!archivo.type.startsWith('image/')) {
      alert('Por favor, selecciona una imagen válida.');
      return;
    }

    // Validar tamaño (máx 5MB)
    if (archivo.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setImagen(base64);
      setImagenPreview(base64);
    };
    reader.readAsDataURL(archivo);
  }

function crearTema() {
  const limpio = cleanText(nuevoTema);

  if (!limpio) return;

  if (temas.map(t => t.toLowerCase()).includes(limpio.toLowerCase())) {
    alert("Esa misión ya existe.");
    return;
  }

  const actualizados = [...temasCreados, limpio];

  setTemasCreados(actualizados);

  setTemaActual(limpio);
  setNuevoTema("");
}

async function eliminarMision(tema) {
  try {
    await apiEliminarMision(tema);
    const actualizados = temasCreados.filter(
      (t) => t.toLowerCase() !== tema.toLowerCase()
    );
    setTemasCreados(actualizados);
    if (temaActual && temaActual.toLowerCase() === tema.toLowerCase()) {
      setTemaActual("");
    }
    await onCreated();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function eliminarObjeto(id) {
  try {
    await apiEliminarObjeto(id);
    await onCreated();
    setModalNotificacion({ titulo: "Objeto eliminado", mensaje: "El objeto fue eliminado correctamente de esta misión." });
  } catch (error) {
    setModalNotificacion({ titulo: "Error", mensaje: "No se pudo eliminar el objeto." });
    console.error(error);
  }
}

  return {
    nombre,
    setNombre,
    tecla,
    setTecla,
    descripcionMejorada,
    setDescripcionMejorada,
    descripcionAutomatica,
    textura,
    setTextura,
    forma,
    setForma,
    tamaño,
    setTamaño,
    material,
    setMaterial,
    sonido,
    setSonido,
    funcion,
    setFuncion,
    peso,
    setPeso,
    imagen,
    setImagen,
    imagenPreview,
    setImagenPreview,
    manejarCambioImagen,
    editId,
    guardarObjeto,
    eliminarTodo,
    iniciarEdicion,
    guardarEdicion,
    cancelarEdicion,
    teclasDisponibles,
    teclasMakeyMakey,
    teclaToObjeto,
    temaActual,
    setTemaActual,
    nuevoTema,
    setNuevoTema,
    crearTema,
    eliminarMision,
    eliminarObjeto,
    modalNotificacion,
    setModalNotificacion,
    temas,
    objetosFiltrados,
  };
}