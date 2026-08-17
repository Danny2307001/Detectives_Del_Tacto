import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import useJuegoSimon from "./useJuegoSimon";
import JuegoSimonVista from "./JuegoSimonVista";
import useAuditoryScanning from "../../../../utils/voz/useAuditoryScanning";
import "./JuegoSimon.css";

export default function JuegoSimon({
  objetos = [],
  onBackToMenu,
  audioActivo = true,
  microfonoActivo = true,
  speak,
}) {
  const [temaSeleccionado, setTemaSeleccionadoReal] = useState(null);
  const [dialogoIntroConfirmado, setDialogoIntroConfirmado] = useState(false);
  const [dialogoMisionConfirmado, setDialogoMisionConfirmado] = useState(false);

  const hablar = useCallback(
    (texto, callback) => {
      const cb = typeof callback === "function" ? callback : undefined;
      speak?.(texto, cb);
    },
    [speak]
  );

  const dialogoIntroConfirmadoRef = useRef(dialogoIntroConfirmado);
  const dialogoMisionConfirmadoRef = useRef(dialogoMisionConfirmado);

  useEffect(() => {
    dialogoIntroConfirmadoRef.current = dialogoIntroConfirmado;
  }, [dialogoIntroConfirmado]);

  useEffect(() => {
    dialogoMisionConfirmadoRef.current = dialogoMisionConfirmado;
  }, [dialogoMisionConfirmado]);

  const textoIntro =
    "Bienvenida al juego Simón Dice. En este juego Simón te dirá el nombre de un objeto. Tu misión será encontrarlo tocando el objeto correcto con Makey Makey. Di confirmar para comenzar o regresar para salir del juego después del pip.";

  const textoElegirMision =
    "Antes de comenzar, debes elegir una misión. Te leeré cada opción disponible. Después, tendrás 5 segundos para decir 'confirmar' si deseas elegirla.";

  const textoMision =
    "Muy bien. Ahora inicia la misión. Simón dirá qué objeto debes tocar. Cuando estés segura, toca el objeto y luego confirma tu respuesta.";

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

  function confirmarIntro() {
    window.speechSynthesis?.cancel();

    setDialogoIntroConfirmado(true);
  }

  function seleccionarTema(tema) {
    scanning.detenerEscaneo();

    window.speechSynthesis?.cancel();

    setTemaSeleccionadoReal(tema);
    setDialogoMisionConfirmado(false);
    logic.reiniciarJuego?.();
  }

  function confirmarMision() {
    window.speechSynthesis?.cancel();
    setDialogoMisionConfirmado(true);
  }

  function cambiarMision() {
    scanning.detenerEscaneo();

    window.speechSynthesis?.cancel();

    logic.reiniciarJuego?.();
    setTemaSeleccionadoReal(null);
    setDialogoMisionConfirmado(false);
  }

  const scanning = useAuditoryScanning({
    elementos: temas,
    onSelect: seleccionarTema,
    activo: dialogoIntroConfirmado && !temaSeleccionado,
    audioActivo,
    textoInstruccion:
      "Antes de comenzar, debes elegir una misión. Te leeré cada opción disponible. Después del pip, tendrás 5 segundos para decir confirmar si deseas elegirla.",
  });

  const logic = useJuegoSimon(
    objetosTema,
    !!temaSeleccionado && dialogoMisionConfirmado,
    audioActivo,
    microfonoActivo,
    hablar
  );

  useEffect(() => {
    if (!dialogoIntroConfirmado) {
      hablar(textoIntro, () => {
        if (!dialogoIntroConfirmadoRef.current) {
          window.hacerBeepManual?.();
        }
      });
    }
  }, [dialogoIntroConfirmado, hablar]);

  useEffect(() => {
    if (!audioActivo) return;

    if (dialogoIntroConfirmado && temaSeleccionado && !dialogoMisionConfirmado) {
      hablar(textoMision, () => {
        if (!dialogoMisionConfirmadoRef.current) {
          window.hacerBeepManual?.();
        }
      });
    }
  }, [audioActivo, dialogoIntroConfirmado, temaSeleccionado, dialogoMisionConfirmado, hablar]);

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
    },
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

  return (
    <JuegoSimonVista
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
        window.speechSynthesis?.cancel();
        onBackToMenu();
      }}
      cambiarMision={cambiarMision}
      finalizarJuego={logic.finalizarJuego}
      dialogoIntroConfirmado={dialogoIntroConfirmado}
      confirmarIntro={confirmarIntro}
      dialogoMisionConfirmado={dialogoMisionConfirmado}
      confirmarMision={confirmarMision}
      textoIntro={textoIntro}
      textoElegirMision={textoElegirMision}
      textoMision={textoMision}
      indiceEscaneo={scanning.indiceActual}
    />
  );
}