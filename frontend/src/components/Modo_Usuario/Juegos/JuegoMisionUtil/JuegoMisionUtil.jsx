import React, { useEffect, useMemo, useState, useRef } from "react";
import useJuegoMisionUtil from "./useJuegoMisionUtil";
import JuegoMisionUtilVista from "./JuegoMisionUtilVista";
import useAuditoryScanning from "../../../../utils/voz/useAuditoryScanning";
import "./JuegoMisionUtil.css";

export default function JuegoMisionUtil({ objetos = [], onBackToMenu, audioActivo = true, microfonoActivo = true, speak }) {
  const [temaSeleccionado, setTemaSeleccionadoReal] = useState(null);
  const [dialogoIntroConfirmado, setDialogoIntroConfirmado] = useState(false);
  const [dialogoSeleccionConfirmado, setDialogoSeleccionConfirmado] = useState(false);
  const [dialogoMisionConfirmado, setDialogoMisionConfirmado] = useState(false);

  const dialogoIntroConfirmadoRef = useRef(dialogoIntroConfirmado);
  const dialogoMisionConfirmadoRef = useRef(dialogoMisionConfirmado);

  useEffect(() => {
    dialogoIntroConfirmadoRef.current = dialogoIntroConfirmado;
  }, [dialogoIntroConfirmado]);

  useEffect(() => {
    dialogoMisionConfirmadoRef.current = dialogoMisionConfirmado;
  }, [dialogoMisionConfirmado]);

  const textoIntro =
    "Bienvenida a Misión Útil. En este juego deberás encontrar el objeto correcto según su función o utilidad. Di confirmar para comenzar o regresar para salir del juego después del pip.";

  const textoElegirMision =
    "Antes de comenzar, debes elegir una misión. Te leeré cada opción disponible. Después, tendrás 5 segundos para decir 'confirmar' si deseas elegirla.";

  const textoMision =
    "Muy bien. Ahora inicia la misión. Escucharás una función. Debes encontrar el objeto que cumple esa utilidad. Cuando estés segura, toca el objeto y confirma tu respuesta.";

  const temas = useMemo(() => {
    return [...new Set((objetos || []).map((o) => o.tema).filter(Boolean))];
  }, [objetos]);

  const objetosTema = useMemo(() => {
    if (!temaSeleccionado) return [];

    return objetos.filter(
      (o) =>
        (o.tema || "").toLowerCase() ===
        (temaSeleccionado || "").toLowerCase()
    );
  }, [objetos, temaSeleccionado]);

  const scanning = useAuditoryScanning({
    elementos: temas,
    onSelect: seleccionarTema,
    activo: dialogoIntroConfirmado && !temaSeleccionado,
    audioActivo,
    textoInstruccion: "Antes de comenzar, debes elegir una misión. Te leeré cada opción disponible. Después del pip, tendrás 5 segundos para decir 'confirmar' si deseas elegirla.",
  });

  const logic = useJuegoMisionUtil(
    objetosTema,
    !!temaSeleccionado && dialogoMisionConfirmado,
    audioActivo,
    microfonoActivo,
    speak
  );

  const gameControlRef = useRef(null);
  gameControlRef.current = {
    confirmarIntro: () => {
      if (!dialogoIntroConfirmado) {
        confirmarIntro();
        return true;
      }
      return false;
    },
    confirmarMision: () => {
      if (scanning.escaneando) {
        if (scanning.confirmarElementoActual()) {
          return true;
        }
      }
      if (temaSeleccionado && !dialogoMisionConfirmado) {
        confirmarMision();
        return true;
      }
      return false;
    },
    confirmarRespuesta: () => {
      if (temaSeleccionado && dialogoMisionConfirmado) {
        logic.confirmarRespuesta?.();
        return true;
      }
      return false;
    },
    cambiarMision: () => {
      if (logic.juegoFinalizado) {
        cambiarMision();
        return true;
      }
      return false;
    },
    terminar: () => {
      if (logic.juegoFinalizado) {
        onBackToMenu();
        return true;
      }
      return false;
    }
  };

  useEffect(() => {
    window.gameControl = {
      confirmarIntro: () => gameControlRef.current?.confirmarIntro(),
      confirmarMision: () => gameControlRef.current?.confirmarMision(),
      confirmarRespuesta: () => gameControlRef.current?.confirmarRespuesta(),
      cambiarMision: () => gameControlRef.current?.cambiarMision(),
      terminar: () => gameControlRef.current?.terminar(),
    };

    return () => {
      window.gameControl = null;
    };
  }, []);

  useEffect(() => {
    if (!dialogoIntroConfirmado) {
      speak(textoIntro, () => {
        if (!dialogoIntroConfirmadoRef.current) {
          window.hacerBeepManual?.();
        }
      });
    }
  }, [dialogoIntroConfirmado, speak]);

  useEffect(() => {
    if (!audioActivo) return;

    if (dialogoIntroConfirmado && temaSeleccionado && !dialogoMisionConfirmado) {
      speak(textoMision, () => {
        if (!dialogoMisionConfirmadoRef.current) {
          window.hacerBeepManual?.();
        }
      });
    }
  }, [audioActivo, dialogoIntroConfirmado, temaSeleccionado, dialogoMisionConfirmado, speak]);

  function confirmarIntro() {
    setDialogoIntroConfirmado(true);
  }

  function confirmarSeleccion() {
    setDialogoSeleccionConfirmado(true);
  }

  function seleccionarTema(tema) {
    scanning.detenerEscaneo();
    setTemaSeleccionadoReal(tema);
    setDialogoMisionConfirmado(false);
    logic.reiniciarJuego?.();
  }

  function confirmarMision() {
    setDialogoMisionConfirmado(true);
  }

  function cambiarMision() {
    scanning.detenerEscaneo();
    window.speechSynthesis?.cancel();
    logic.reiniciarJuego?.();
    setTemaSeleccionadoReal(null);
    setDialogoMisionConfirmado(false);
  }

  return (
    <JuegoMisionUtilVista
      {...logic}
      temas={temas}
      objetos={objetos}
      temaSeleccionado={temaSeleccionado}
      setTemaSeleccionado={(tema) => {
        scanning.detenerEscaneo();
        seleccionarTema(tema);
      }}
      onBackToMenu={() => {
        scanning.detenerEscaneo();
        onBackToMenu();
      }}
      cambiarMision={cambiarMision}
      dialogoIntroConfirmado={dialogoIntroConfirmado}
      confirmarIntro={confirmarIntro}
      dialogoSeleccionConfirmado={dialogoSeleccionConfirmado}
      confirmarSeleccion={confirmarSeleccion}
      dialogoMisionConfirmado={dialogoMisionConfirmado}
      confirmarMision={confirmarMision}
      textoIntro={textoIntro}
      textoElegirMision={textoElegirMision}
      textoMision={textoMision}
      indiceEscaneo={scanning.indiceActual}
    />
  );
}