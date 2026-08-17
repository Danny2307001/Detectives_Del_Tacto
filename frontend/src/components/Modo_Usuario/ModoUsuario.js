import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { normalizarTecla } from "../../utils/keymap";
import { crearReconocimiento } from "../../utils/voz";
import useAuditoryScanning from "../../utils/voz/useAuditoryScanning";

export default function useModoUsuario(
  objetos = [],
  audioActivo = true,
  microfonoActivo = true
) {
  const [pantalla, setPantalla] = useState("bienvenida");
  const [objetoActual, setObjetoActual] = useState(null);
  const objetoActualRef = useRef(null);
  useEffect(() => {
    objetoActualRef.current = objetoActual;
  }, [objetoActual]);
  const [temaExploracion, setTemaExploracion] = useState(null);
  const [dialogoExploracionConfirmado, setDialogoExploracionConfirmado] =
    useState(false);
  const [objetosTocados, setObjetosTocados] = useState([]);
  const objetosTocadosRef = useRef([]);
  useEffect(() => {
    objetosTocadosRef.current = objetosTocados;
  }, [objetosTocados]);

  const [estadoVoz, setEstadoVoz] = useState("cargando"); // cargando | listo | escuchando | pausado | error

  const microfonoActivoRef = useRef(microfonoActivo);
  useEffect(() => {
    microfonoActivoRef.current = microfonoActivo;
  }, [microfonoActivo]);

  const recognitionRef = useRef(null);
  const pantallaRef = useRef("bienvenida");
  const temaExploracionRef = useRef(null);
  const dialogoExploracionRef = useRef(false);
  const speakingRef = useRef(false);
  const procesandoRef = useRef(false);
  const ultimaPausaRef = useRef(0);
  const speakingTimerRef = useRef(null);
  const micRestartTimerRef = useRef(null);
  const ultimoBeepRef = useRef(0);

  const temasExploracion = useMemo(() => {
    return [...new Set((objetos || []).map((o) => o.tema).filter(Boolean))];
  }, [objetos]);

  const scanningExplorar = useAuditoryScanning({
    elementos: temasExploracion,
    onSelect: seleccionarTemaExploracion,
    activo: pantalla === "explorar" && dialogoExploracionConfirmado && !temaExploracion,
    audioActivo,
    textoInstruccion: "Misiones de exploración. Te leeré cada misión disponible. Después del pip, tendrás 5 segundos para decir 'confirmar' si deseas elegirla.",
  });

  const objetosExploracion = useMemo(() => {
    if (!temaExploracion) return [];

    return (objetos || []).filter(
      (o) =>
        (o.tema || "").toLowerCase() ===
        (temaExploracion || "").toLowerCase()
    );
  }, [objetos, temaExploracion]);

  useEffect(() => {
    pantallaRef.current = pantalla;
  }, [pantalla]);

  useEffect(() => {
    temaExploracionRef.current = temaExploracion;
  }, [temaExploracion]);

  const scanningExplorarRef = useRef(scanningExplorar);
  useEffect(() => {
    scanningExplorarRef.current = scanningExplorar;
  });

  useEffect(() => {
    dialogoExploracionRef.current = dialogoExploracionConfirmado;
  }, [dialogoExploracionConfirmado]);

  function stopListening() {
    try {
      ultimaPausaRef.current = Date.now();
      recognitionRef.current?.stop();
    } catch { }
  }

  // Helper para hacer beep al iniciar escucha
  function hacerBeep(force = false) {
    if (!audioActivo) return;
    if (window.isComputerSpeaking && !force) return;

    const p = pantallaRef.current;
    const expectsVoice = (
      p === "bienvenida" ||
      p === "menuJuegos" ||
      (p === "explorar" && !dialogoExploracionRef.current)
    );
    if (!expectsVoice && !force) return;

    // Antispam: No permitir 2 beeps en menos de 1.5 segundos
    const ahora = Date.now();
    if (ahora - ultimoBeepRef.current < 1500) return;
    ultimoBeepRef.current = ahora;

    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // Ignorar fallos de audio context
    }
  }

  function startListening() {
    if (!microfonoActivoRef.current) return;

    hacerBeep();

    // Esperar a que el beep termine (dura 100ms) antes de encender el micro,
    // de lo contrario Vosk puede escuchar el beep y transcribirlo como "uno".
    setTimeout(() => {
      try {
        recognitionRef.current?.start();
      } catch { }
    }, 150);
  }

  function stopAllAudio() {
    try {
      window.speechSynthesis.cancel();
    } catch { }

    try {
      recognitionRef.current?.stop();
    } catch { }

    speakingRef.current = false;
  }

  const speak = useCallback(
    (text, onEnd) => {
      if (!("speechSynthesis" in window)) {
        onEnd?.();
        return;
      }

      if (!audioActivo) {
        onEnd?.();
        return;
      }

      stopListening();
      speakingRef.current = true;

      // Limpiar cualquier intento de reinicio de micrófono previo si se solapan voces
      if (micRestartTimerRef.current) {
        clearTimeout(micRestartTimerRef.current);
        micRestartTimerRef.current = null;
      }

      // Safety timeout: si onend nunca se dispara, liberar después de 15s
      if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
      speakingTimerRef.current = setTimeout(() => {
        console.log("⚠️ Safety timeout: speakingRef forzado a false");
        speakingRef.current = false;
        startListening();
      }, 15000);

      window.speechSynthesis.cancel();

      const u = new SpeechSynthesisUtterance(text);
      u.lang = "es-ES";
      u.rate = 0.95;
      u.pitch = 1;
      u.volume = 1;

      const manejarFinDeAudio = () => {
        if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);

        // Llamar a onEnd casi de inmediato (100ms de gracia tras acabar el habla)
        // para que cualquier tono/beep suene inmediatamente al finalizar el habla.
        setTimeout(() => {
          onEnd?.();
        }, 100);

        // Reiniciar el micrófono después de 1200ms para dar tiempo a que
        // suene el beep y se asiente el audio antes de empezar a escuchar.
        micRestartTimerRef.current = setTimeout(() => {
          startListening();
          speakingRef.current = false;
        }, 1200);
      };

      u.onend = manejarFinDeAudio;
      u.onerror = manejarFinDeAudio;

      window.speechSynthesis.speak(u);
    },
    [audioActivo]
  );

  function normalizarTexto(texto) {
    return (texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function seleccionarTemaExploracion(tema) {
    setTemaExploracion(tema);
    setObjetoActual(null);
    setObjetosTocados([]);
  }

  function volverAMisionesExploracion() {
    setTemaExploracion(null);
    setObjetoActual(null);
    setObjetosTocados([]);
    speak("Selecciona una misión para explorar.");
  }

  function confirmarDialogoExploracion() {
    setDialogoExploracionConfirmado(true);
    speak("Primero elige una misión para explorar sus objetos.");
  }

  // ===== RECONOCIMIENTO DE VOZ CON VOSK (OFFLINE) =====
  useEffect(() => {
    window.hacerBeepManual = () => hacerBeep(true);

    if (!microfonoActivo) {
      stopListening();
      console.log("🔴 Micrófono apagado");
    } else {
      startListening();
      console.log("🟢 Micrófono encendido");
    }
  }, [microfonoActivo]);

  useEffect(() => {
    let destroyed = false;

    async function inicializarVosk() {
      try {
        const rec = await crearReconocimiento({
          onResult: (said) => {
            if (speakingRef.current || procesandoRef.current) return;

            const ahora = Date.now();
            if (ahora - ultimaPausaRef.current < 900) return;

            const pantallaActual = pantallaRef.current;

            console.log("📝 Vosk escuchó:", said);
            console.log("📍 Pantalla actual:", pantallaActual);

            if (!said || said.length < 2) return;

            // Dividir en palabras exactas
            const palabras = said.split(" ");
            const dicePalabra = (palabra) => palabras.includes(palabra);

            // 🛑 PREVENCIÓN DE ECO / AUTO-EJECUCIÓN:
            // Ignorar frases de más de 4 palabras para evitar que el micrófono
            // capte la propia voz de la computadora (ej: "Hola detective puedes elegir explorar...")
            if (palabras.length > 4) {
              console.log("❌ Frase muy larga, ignorando posible eco del sistema.");
              return;
            }

            procesandoRef.current = true;
            setTimeout(() => {
              procesandoRef.current = false;
            }, 400);

            console.log("🎯 Frase procesada:", said);

            // A. PANTALLA BIENVENIDA
            if (pantallaActual === "bienvenida") {
              console.log("🏠 Pantalla BIENVENIDA - esperando: explorar o jugar");
              if (dicePalabra("explorar") || dicePalabra("exploracion")) {
                console.log("✅ Detectado: EXPLORAR");
                setPantalla("explorar");
                setDialogoExploracionConfirmado(false);
                setTemaExploracion(null);
                setObjetoActual(null);
                speak("Perfecto. Entrando a exploración libre.");
                return;
              }

              if (dicePalabra("jugar") || dicePalabra("juego") || dicePalabra("juegos")) {
                console.log("✅ Detectado: JUGAR");
                setPantalla("menuJuegos");
                speak("Perfecto. Menú de juegos.");
                return;
              }

              if (dicePalabra("repetir")) {
                console.log("🔄 Detectado: REPETIR");
                speak(
                  "Di explorar para reconocer objetos, o di jugar para entrar al menú de juegos."
                );
                return;
              }

              console.log("❌ Comando NO reconocido en bienvenida:", said);
              speak("No entendí. Di explorar o jugar.");
              return;
            }

            // B. PANTALLA MENÚ JUEGOS
            if (pantallaActual === "menuJuegos") {
              console.log("🎮 Pantalla MENÚ JUEGOS");

              if (dicePalabra("regresar") || dicePalabra("volver") || dicePalabra("atras") || dicePalabra("salir") || dicePalabra("finalizar")) {
                console.log("🔙 Saliendo de menú de juegos al inicio");
                setPantalla("bienvenida");
                speak("Regresando al inicio.");
                return;
              }

              if (dicePalabra("uno") || dicePalabra("1") || dicePalabra("simon")) {
                console.log("✅ Detectado: SIMÓN");
                setPantalla("juegoSimon");
                return;
              }

              if (dicePalabra("dos") || dicePalabra("2") || dicePalabra("detective")) {
                console.log("✅ Detectado: DETECTIVE");
                setPantalla("juegoDetective");
                return;
              }

              if (dicePalabra("tres") || dicePalabra("3") || dicePalabra("mision") || dicePalabra("util")) {
                console.log("✅ Detectado: MISIÓN");
                setPantalla("juegoMisionUtil");
                return;
              }

              if (dicePalabra("repetir")) {
                speak("Di Simón, Detective o Misión");
                return;
              }

              console.log("❌ Comando NO reconocido en menú:", said);
              speak("No entendí. Di Simón, Detective o Misión.");
              return;
            }

            // C. PANTALLA JUEGOS ACTIVOS
            if (
              pantallaActual === "juegoSimon" ||
              pantallaActual === "juegoDetective" ||
              pantallaActual === "juegoMisionUtil"
            ) {
              console.log("🎮 Pantalla JUEGO ACTIVO:", pantallaActual);

              if (window.gameControl) {
                if (dicePalabra("mision") || dicePalabra("cambiar")) {
                  if (window.gameControl.cambiarMision()) {
                    console.log("🔊 Cambiar misión ejecutado por voz");
                    return;
                  }
                }
                if (dicePalabra("terminar") || dicePalabra("finalizar")) {
                  if (window.gameControl.terminar()) {
                    console.log("🔊 Terminar juego ejecutado por voz");
                    return;
                  }
                }
              }

              if (dicePalabra("regresar") || dicePalabra("volver") || dicePalabra("atras")) {
                console.log("🔙 Saliendo del juego al menú de juegos");
                setPantalla("menuJuegos");
                speak("Regresando al menú de juegos.");
                return;
              }

              if (
                dicePalabra("confirmar") ||
                dicePalabra("continuar") ||
                dicePalabra("si") ||
                dicePalabra("confirmado") ||
                dicePalabra("confirma") ||
                dicePalabra("firmar") ||
                dicePalabra("mar")
              ) {
                if (window.gameControl) {
                  console.log("🎮 Ejecutando comando por voz 'confirmar' (o variante) en el juego actual");

                  // Intentar confirmar intro primero
                  if (window.gameControl.confirmarIntro()) {
                    return;
                  }

                  // Si no, intentar confirmar misión
                  if (window.gameControl.confirmarMision()) {
                    return;
                  }

                  // Si no, intentar confirmar respuesta del juego
                  if (window.gameControl.confirmarRespuesta()) {
                    return;
                  }
                }
              }
              return;
            }

            // D. PANTALLA EXPLORAR
            if (pantallaActual === "explorar") {
              console.log("🔍 Pantalla EXPLORAR");

              if (dicePalabra("finalizar") || dicePalabra("salir") || dicePalabra("terminar")) {
                console.log("🔙 Saliendo de exploración al inicio");
                setPantalla("bienvenida");
                speak("Regresando al inicio.");
                return;
              }

              if (dicePalabra("regresar") || dicePalabra("volver") || dicePalabra("atras")) {
                if (temaExploracionRef.current) {
                  console.log("🔙 Regresando de misión activa a selección de misiones");
                  volverAMisionesExploracion();
                } else {
                  console.log("🔙 Saliendo de selección de misiones al inicio");
                  setPantalla("bienvenida");
                  speak("Regresando al inicio.");
                }
                return;
              }

              if (!dialogoExploracionRef.current) {
                if (
                  dicePalabra("confirmar") ||
                  dicePalabra("continuar") ||
                  dicePalabra("si") ||
                  dicePalabra("confirmado") ||
                  dicePalabra("confirma") ||
                  dicePalabra("firmar") ||
                  dicePalabra("mar")
                ) {
                  confirmarDialogoExploracion();
                }
                return;
              }

              if (!temaExploracionRef.current) {
                if (
                  dicePalabra("confirmar") ||
                  dicePalabra("continuar") ||
                  dicePalabra("si") ||
                  dicePalabra("confirmado") ||
                  dicePalabra("confirma") ||
                  dicePalabra("firmar") ||
                  dicePalabra("mar")
                ) {
                  if (scanningExplorarRef.current.escaneando && scanningExplorarRef.current.confirmarElementoActual()) {
                    return;
                  }
                }
              }

              if (dicePalabra("repetir")) {
                if (objetoActual) {
                  const desc =
                    objetoActual.descripcion ||
                    objetoActual.descripcionAutomatica ||
                    "";
                  speak(desc ? `${objetoActual.nombre}. ${desc}` : objetoActual.nombre);
                } else {
                  speak("Toca un objeto para escuchar su información.");
                }
              }
            }
          },
          onError: (error) => {
            console.error("❌ Error Vosk:", error);
          },
          onEstado: (estado) => {
            console.log("📊 Estado Vosk:", estado);
            if (!destroyed) setEstadoVoz(estado);
          },
        });

        if (destroyed) {
          rec.destroy();
          return;
        }

        recognitionRef.current = rec;
        if (microfonoActivoRef.current) rec.start();
      } catch (error) {
        console.error("❌ Error al inicializar Vosk:", error);
        if (!destroyed) setEstadoVoz("error");
      }
    }

    inicializarVosk();

    return () => {
      destroyed = true;
      try {
        window.speechSynthesis.cancel();
      } catch { }
      try {
        recognitionRef.current?.destroy();
      } catch { }
    };
  }, [speak]);

  useEffect(() => {
    function handleGlobalKeyDown(e) {
      if (e.key === "Enter") {
        const pantallaActual = pantallaRef.current;

        // 1. Diálogo de exploración libre
        if (pantallaActual === "explorar") {
          if (!dialogoExploracionRef.current) {
            e.preventDefault();
            console.log("⌨️ Enter presionado en diálogo de exploración");
            confirmarDialogoExploracion();
            return;
          }
          if (!temaExploracionRef.current && scanningExplorar.escaneando) {
            e.preventDefault();
            console.log("⌨️ Enter presionado en escaneo de misiones de exploración");
            if (scanningExplorar.confirmarElementoActual()) {
              return;
            }
          }
        }

        // 2. Diálogos de los juegos (intro o misión)
        if (
          pantallaActual === "juegoSimon" ||
          pantallaActual === "juegoDetective" ||
          pantallaActual === "juegoMisionUtil"
        ) {
          if (window.gameControl) {
            e.preventDefault();
            console.log("⌨️ Enter presionado en pantalla de juego:", pantallaActual);

            // Intentar confirmar intro primero
            if (window.gameControl.confirmarIntro()) {
              return;
            }

            // Si no, intentar confirmar misión
            if (window.gameControl.confirmarMision()) {
              return;
            }
          }
        }
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  // 1. Restablecer el estado de exploración solo al cambiar de pantalla
  useEffect(() => {
    if (pantalla === "explorar") {
      setDialogoExploracionConfirmado(false);
      setTemaExploracion(null);
      setObjetoActual(null);
    }
  }, [pantalla]);

  // 2. Reproducir la locución de bienvenida/instrucciones según el contexto
  const ultimoContextoHabladoRef = useRef("");

  useEffect(() => {
    if (!audioActivo) {
      ultimoContextoHabladoRef.current = ""; // Resetear para que vuelva a hablar al activar el audio
      return;
    }

    let contextoActual = "";
    let textoALeer = "";

    if (pantalla === "bienvenida") {
      contextoActual = "bienvenida";
      textoALeer = "Hola detective. Puedes elegir explorar para descubrir objetos, o jugar para resolver misiones táctiles. Di explorar o jugar después del pip";
    } else if (pantalla === "menuJuegos") {
      contextoActual = "menuJuegos";
      textoALeer = "Menú de juegos. Di Simón, Detective o Misión despúes del pip para descubrir distintas misiones.";
    } else if (pantalla === "explorar") {
      if (!dialogoExploracionConfirmado) {
        contextoActual = "explorar-intro";
        textoALeer = "Explorar. En este modo podrás tocar objetos reales con Makey Makey y escuchar sus características. Primero deberás elegir una misión para explorar sus objetos. Di confirmar o regresar después del pip.";
      } else if (temaExploracion) {
        contextoActual = `explorar-mision-${temaExploracion}`;
        textoALeer = `Estás en la misión ${temaExploracion}, puedes empezar a tocar objetos o si quieres cambiar de misión di regresar o finalizar para terminar`;
      }
    }

    if (contextoActual && ultimoContextoHabladoRef.current !== contextoActual) {
      ultimoContextoHabladoRef.current = contextoActual;
      speak(textoALeer);
    }

    return () => {
      ultimoContextoHabladoRef.current = "";
    };
  }, [
    pantalla,
    dialogoExploracionConfirmado,
    temaExploracion,
    audioActivo,
    speak,
  ]);

  useEffect(() => {
    if (pantalla !== "explorar") return;
    if (!dialogoExploracionConfirmado) return;
    if (!temaExploracion) return;

    function onKeyDown(e) {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }

      if (e.repeat) return;

      const teclaDB = normalizarTecla(e.key);

      const obj = (objetosExploracion || []).find(
        (o) => (o.tecla || "") === teclaDB
      );

      if (obj) {
        const objKey = obj._id || `${obj.tecla}-${obj.nombre}`;
        const activeKey = objetoActualRef.current
          ? objetoActualRef.current._id || `${objetoActualRef.current.tecla}-${objetoActualRef.current.nombre}`
          : null;

        if (activeKey === objKey && speakingRef.current) {
          console.log("🤫 Ya se está hablando de este objeto, ignorando repetición.");
          return;
        }

        setObjetoActual(obj);

        const prevTocados = objetosTocadosRef.current || [];
        const yaTocado = prevTocados.includes(objKey);
        const nuevosTocados = yaTocado ? prevTocados : [...prevTocados, objKey];

        if (!yaTocado) {
          setObjetosTocados(nuevosTocados);
        }

        const desc = obj.descripcion || obj.descripcionAutomatica || "";
        const funcion = obj.funcion ? ` Su función es: ${obj.funcion}.` : "";
        const textoExplicacion = desc ? `${obj.nombre}. ${desc}.${funcion}` : `${obj.nombre}.${funcion}`;

        const totalMision = (objetosExploracion || []).length;
        const todosTocados = nuevosTocados.length === totalMision;

        if (todosTocados && !yaTocado) {
          speak(
            `${textoExplicacion}. ¡Excelente detective! Has explorado todos los objetos de esta misión. ¿Deseas continuar en esta misión? O di regresar para cambiar de misión, o finalizar para salir de explorar después del pip.`,
            () => {
              const currentKey = objetoActualRef.current
                ? objetoActualRef.current._id || `${objetoActualRef.current.tecla}-${objetoActualRef.current.nombre}`
                : null;
              if (currentKey === objKey) {
                setObjetoActual(null);
              }
              window.hacerBeepManual?.();
            }
          );
        } else {
          speak(textoExplicacion, () => {
            const currentKey = objetoActualRef.current
              ? objetoActualRef.current._id || `${objetoActualRef.current.tecla}-${objetoActualRef.current.nombre}`
              : null;
            if (currentKey === objKey) {
              setObjetoActual(null);
            }
          });
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    pantalla,
    objetosExploracion,
    speak,
    dialogoExploracionConfirmado,
    temaExploracion,
  ]);

  return {
    pantalla,
    setPantalla,
    objetoActual,
    stopAllAudio,
    temaExploracion,
    setTemaExploracion,
    seleccionarTemaExploracion,
    volverAMisionesExploracion,
    dialogoExploracionConfirmado,
    confirmarDialogoExploracion,
    temasExploracion,
    objetosExploracion,
    estadoVoz,
    speak,
    indiceExplorarEscaneo: scanningExplorar.indiceActual,
    detenerEscaneoExplorar: scanningExplorar.detenerEscaneo,
    objetosTocados,
  };
}