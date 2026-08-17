import { useEffect, useRef, useState, useCallback } from "react";
import { normalizarTecla } from "../../../../utils/keymap";

const TECLA_CONFIRMACION = "Espacio";

function normalizarTexto(texto) {
  return (texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function elegirAleatorio(lista = []) {
  if (!lista.length) return null;
  const index = Math.floor(Math.random() * lista.length);
  return lista[index];
}

function mezclarArray(array = []) {
  return [...array].sort(() => Math.random() - 0.5);
}

function crearPistas(objeto) {
  if (!objeto) return [];

  return [
    objeto.textura?.trim() && {
      tipo: "textura",
      frase: objeto.textura,
    },
    objeto.forma?.trim() && {
      tipo: "forma",
      frase: objeto.forma,
    },
    objeto.tamaño?.trim() && {
      tipo: "tamaño",
      frase: objeto.tamaño,
    },
    objeto.material?.trim() && {
      tipo: "material",
      frase: objeto.material,
    },
    objeto.peso?.trim() && {
      tipo: "peso",
      frase: objeto.peso,
    },
    objeto.sonido?.trim() && {
      tipo: "sonido",
      frase: objeto.sonido,
    },
  ].filter(Boolean);
}

export default function useJuegoDetective(
  objetos = [],
  activo = false,
  audioActivo = true,
  microfonoActivo = true,
  speak
) {
  const [objetivoActual, setObjetivoActual] = useState(null);
  const [objetoSeleccionado, setObjetoSeleccionado] = useState(null);
  const [pistasActuales, setPistasActuales] = useState([]);
  const [esperandoConfirmacion, setEsperandoConfirmacion] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [mensajeEstado, setMensajeEstado] = useState("Preparando juego...");
  const [hablando, setHablando] = useState(false);
  const [juegoInicializado, setJuegoInicializado] = useState(false);
  const [aciertos, setAciertos] = useState(0);
  const totalObjetos = objetos.length;
  const [mensajeTemporal, setMensajeTemporal] = useState(null);
  const [juegoFinalizado, setJuegoFinalizado] = useState(false);
  const [respuestaRevelada, setRespuestaRevelada] = useState(false);

  const objetosUsadosRef = useRef([]);
  const finalizadoRef = useRef(false);
  const aciertosRef = useRef(0);

  const stateRef = useRef({
    hablando: false,
    objetivoActual: null,
    objetoSeleccionado: null,
    pistasActuales: [],
    resultado: null,
  });

  function mostrarMensajeTemporal(texto, tipo = "info") {
    setMensajeTemporal({ texto, tipo });

    setTimeout(() => {
      setMensajeTemporal(null);
    }, 4000);
  }

  useEffect(() => {
    stateRef.current = {
      hablando,
      objetivoActual,
      objetoSeleccionado,
      pistasActuales,
      resultado,
    };
  }, [hablando, objetivoActual, objetoSeleccionado, pistasActuales, resultado]);

  function construirFrasePistas(pistas) {
    if (!pistas || pistas.length === 0) return "sin pistas";
    if (pistas.length === 1) return pistas[0].frase;

    return `${pistas[0].frase} y ${pistas[1].frase}`;
  }

  const finalizarJuego = useCallback(() => {
    setJuegoFinalizado(true);
    window.speechSynthesis?.cancel();
  }, []);

  const iniciarRonda = useCallback(() => {
    if (!objetos || objetos.length === 0) {
      setObjetivoActual(null);
      setPistasActuales([]);
      setMensajeEstado("No hay objetos registrados para jugar.");
      speak("No hay objetos registrados para jugar.");
      return;
    }

    const disponibles = objetos.filter(
      (o) => !objetosUsadosRef.current.includes(o._id)
    );

    if (disponibles.length === 0) {
      if (finalizadoRef.current) return;

      finalizadoRef.current = true;

      setObjetoSeleccionado(null);
      setEsperandoConfirmacion(false);
      setResultado(null);

      mostrarMensajeTemporal(
        `Juego finalizado. Aciertos: ${aciertosRef.current} de ${totalObjetos}.`,
        "info"
      );

      speak(
        `Misión completada. Tu resultado final es ${aciertosRef.current} de ${totalObjetos} objetos correctos. ¿Deseas cambiar de misión? Di misión o presiona cambiar misión. ¿O deseas finalizar? Di terminar o presiona terminar.`,
        () => {
          setJuegoFinalizado(true);
          window.hacerBeepManual?.();
        }
      );

      return;
    }

    let objetivo = null;
    let pistasDisponibles = [];
    let intentos = 0;

    while ((!objetivo || pistasDisponibles.length === 0) && intentos < disponibles.length) {
      objetivo = elegirAleatorio(disponibles);
      pistasDisponibles = crearPistas(objetivo);
      intentos++;
    }

    if (!objetivo || pistasDisponibles.length === 0) {
      setMensajeEstado("Los objetos deben tener atributos para jugar.");
      speak("Los objetos deben tener atributos completos.");
      return;
    }

    const pistasElegidas = mezclarArray(pistasDisponibles).slice(0, 2);
    const frase = construirFrasePistas(pistasElegidas);

    setObjetivoActual(objetivo);
    setObjetoSeleccionado(null);
    setPistasActuales(pistasElegidas);
    setEsperandoConfirmacion(false);
    setResultado(null);
    setRespuestaRevelada(false);
    setMensajeEstado(`Pistas: ${frase}`);

    speak(
      `Caso misterioso. Estas son tus pistas: ${frase}. Explora los objetos con tus manos. Cuando creas encontrar el correcto, presiona confirmar o di: Confirmar.`,
      () => {
        window.hacerBeepManual?.();
      }
    );
  }, [objetos, speak, finalizarJuego]);

  const siguienteRonda = useCallback(() => {
    if (objetivoActual?._id) {
      objetosUsadosRef.current = [
        ...new Set([...objetosUsadosRef.current, objetivoActual._id]),
      ];
    }

    iniciarRonda();
  }, [objetivoActual, iniciarRonda]);

  const confirmarRespuesta = useCallback(() => {
    const objSel = stateRef.current.objetoSeleccionado;
    const objetivo = stateRef.current.objetivoActual;

    if (!objetivo) return;

    if (!objSel) {
      mostrarMensajeTemporal("Primero toca un objeto", "alerta");
      speak("Primero toca un objeto.", () => {
        window.hacerBeepManual?.();
      });
      return;
    }

    if (objSel._id === objetivo._id) {
      const nuevosAciertos = aciertosRef.current + 1;
      aciertosRef.current = nuevosAciertos;
      setAciertos(nuevosAciertos);
      mostrarMensajeTemporal("Caso resuelto. Muy bien detective", "correcto");

      setResultado("correcto");
      setEsperandoConfirmacion(false);
      setMensajeEstado("Respuesta correcta");

      objetosUsadosRef.current = [
        ...new Set([...objetosUsadosRef.current, objetivo._id]),
      ];

      speak("Caso resuelto. Muy bien detective.", () => {
        setTimeout(() => iniciarRonda(), 900);
      });

      return;
    }

    mostrarMensajeTemporal("Incorrecto. Sigue investigando", "incorrecto");

    setResultado("incorrecto");
    setEsperandoConfirmacion(false);
    setMensajeEstado("Respuesta incorrecta");

    objetosUsadosRef.current = [
      ...new Set([...objetosUsadosRef.current, objetivo._id]),
    ];
    speak("Incorrecto. Pasemos al siguiente objeto.", () => {
      setTimeout(() => iniciarRonda(), 900);
    });
  }, [iniciarRonda, speak]);

  const revelarRespuesta = useCallback(() => {
    const objetivo = stateRef.current.objetivoActual;

    if (!objetivo) return;

    setRespuestaRevelada(true);
    setEsperandoConfirmacion(false);
    setResultado(null);
    setMensajeEstado(`La respuesta era: ${objetivo.nombre}`);
    mostrarMensajeTemporal(`La respuesta era: ${objetivo.nombre}`, "info");

    speak(`La respuesta era: ${objetivo.nombre}.`, () => { });
  }, [speak]);

  function reiniciarJuego() {
    objetosUsadosRef.current = [];
    setJuegoFinalizado(false);
    setJuegoInicializado(false);
    setResultado(null);
    setObjetoSeleccionado(null);
    setEsperandoConfirmacion(false);
    setMensajeTemporal(null);
    setMensajeEstado("Preparando juego...");
    setRespuestaRevelada(false);
    setAciertos(0);
    finalizadoRef.current = false;
    aciertosRef.current = 0;
  }

  useEffect(() => {
    if (!activo) return;
    if (juegoInicializado) return;

    setJuegoInicializado(true);
    iniciarRonda();
  }, [activo, juegoInicializado, iniciarRonda]);

  const audioActivoAnteriorRef = useRef(audioActivo);

  useEffect(() => {
    const prevAudio = audioActivoAnteriorRef.current;
    audioActivoAnteriorRef.current = audioActivo;

    if (!prevAudio && audioActivo) {
      if (activo) {
        if (juegoFinalizado) {
          speak(
            `Misión completada. Tu resultado final es ${aciertos} de ${totalObjetos} objetos correctos. ¿Deseas cambiar de misión? Di misión o presiona cambiar misión. ¿O deseas finalizar? Di terminar o presiona terminar.`,
            () => {
              window.hacerBeepManual?.();
            }
          );
        } else if (objetivoActual && resultado === null) {
          const frase = construirFrasePistas(pistasActuales);
          speak(
            `Caso misterioso. Estas son tus pistas: ${frase}. Explora los objetos con tus manos. Cuando creas encontrar el correcto, presiona confirmar o di: Confirmar.`,
            () => {
              window.hacerBeepManual?.();
            }
          );
        }
      }
    }
  }, [audioActivo, activo, juegoFinalizado, objetivoActual, resultado, speak, aciertos, totalObjetos, pistasActuales]);

  useEffect(() => {
    function onKeyDown(e) {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }

      if (e.repeat) return;
      if (stateRef.current.resultado !== null) return;
      if (!stateRef.current.objetivoActual) return;

      const teclaDB = normalizarTecla(e.key);

      // 1. Buscar si la tecla corresponde a algún objeto de la misión actual
      const obj = (objetos || []).find((o) => (o.tecla || "") === teclaDB);

      if (obj) {
        setObjetoSeleccionado(obj);
        setEsperandoConfirmacion(true);
        setMensajeEstado("Objeto seleccionado. Confirma tu respuesta.");
        return;
      }

      // 2. Si no es un objeto, verificar si es tecla de confirmación
      if (teclaDB === TECLA_CONFIRMACION || e.key === "Enter") {
        confirmarRespuesta();
        return;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [objetos, confirmarRespuesta]);



  return {
    objetivoActual,
    objetoSeleccionado,
    pistasActuales,
    esperandoConfirmacion,
    resultado,
    mensajeEstado,
    aciertos,
    totalObjetos,
    mensajeTemporal,
    juegoFinalizado,
    respuestaRevelada,
    confirmarRespuesta,
    revelarRespuesta,
    finalizarJuego,
    siguienteRonda,
    reiniciarJuego,
  };
}