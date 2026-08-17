import { useEffect, useRef, useState, useCallback } from "react";

export default function useAuditoryScanning({
  elementos = [],
  onSelect,
  activo = false,
  audioActivo = true,
  textoInstruccion = "",
}) {
  const [indiceActual, setIndiceActual] = useState(-1);
  const [escaneando, setEscaneando] = useState(false);
  
  const timerRef = useRef(null);
  const speakingRef = useRef(false);
  const elementosRef = useRef(elementos);
  const onSelectRef = useRef(onSelect);
  const escaneandoRef = useRef(false);

  const indiceActualRef = useRef(-1);
  const indiceAnteriorRef = useRef(-1);
  const ultimoCambioRef = useRef(0);

  // Mantener referencias actualizadas para evitar closures obsoletos
  useEffect(() => {
    elementosRef.current = elementos;
    onSelectRef.current = onSelect;
  }, [elementos, onSelect]);

  useEffect(() => {
    indiceAnteriorRef.current = indiceActualRef.current;
    ultimoCambioRef.current = Date.now();
    indiceActualRef.current = indiceActual;
  }, [indiceActual]);

  useEffect(() => {
    escaneandoRef.current = escaneando;
  }, [escaneando]);

  const detenerEscaneo = useCallback(() => {
    setEscaneando(false);
    escaneandoRef.current = false;
    setIndiceActual(-1);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    if (escaneandoRef.current || speakingRef.current) {
      try {
        window.speechSynthesis?.cancel();
      } catch {}
    }
  }, []);

  const hablarConRetorno = useCallback((texto, callback) => {
    if (!("speechSynthesis" in window) || !audioActivo) {
      callback?.();
      return;
    }
    
    try {
      window.speechSynthesis.cancel();
    } catch {}
    
    speakingRef.current = true;

    const voz = new SpeechSynthesisUtterance(texto);
    voz.lang = "es-ES";
    voz.rate = 0.95;
    voz.pitch = 1;

    const finalizarSpeech = () => {
      speakingRef.current = false;
      if (escaneandoRef.current) {
        callback?.();
      }
    };

    voz.onend = finalizarSpeech;
    voz.onerror = finalizarSpeech;
    
    try {
      window.speechSynthesis.speak(voz);
    } catch {
      finalizarSpeech();
    }
  }, [audioActivo]);

  const iniciarTemporizadorEspera = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    // Reproducir beep después de terminar la voz
    setTimeout(() => {
      if (escaneandoRef.current) {
        window.hacerBeepManual?.();
      }
    }, 200);

    timerRef.current = setTimeout(() => {
      if (!escaneandoRef.current) return;
      
      const len = elementosRef.current.length;
      if (len === 0) return;
      
      const proximoIndice = (indiceActualRef.current + 1) % len;
      setIndiceActual(proximoIndice);
    }, 5000); // 5 segundos de espera
  }, []);

  const hablarConRetornoRef = useRef(hablarConRetorno);
  useEffect(() => {
    hablarConRetornoRef.current = hablarConRetorno;
  }, [hablarConRetorno]);

  // Efecto principal de escaneo
  useEffect(() => {
    if (!activo || elementos.length === 0) {
      if (escaneandoRef.current) {
        detenerEscaneo();
      }
      return;
    }

    setEscaneando(true);
    escaneandoRef.current = true;
    
    // Primero, hablar instrucciones
    hablarConRetornoRef.current(textoInstruccion, () => {
      setIndiceActual(0);
    });

    return () => {
      detenerEscaneo();
    };
  }, [activo, elementos.length, textoInstruccion, detenerEscaneo, audioActivo]);

  // Efecto que reacciona al cambio de índice
  useEffect(() => {
    if (!escaneando || indiceActual < 0 || indiceActual >= elementos.length) return;

    const nombreElemento = elementos[indiceActual];
    const textoALeer = `Misión: ${nombreElemento}`;

    hablarConRetorno(textoALeer, () => {
      iniciarTemporizadorEspera();
    });

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [escaneando, indiceActual, elementos, hablarConRetorno, iniciarTemporizadorEspera]);

  // Función de confirmación manual o por voz
  const confirmarElementoActual = useCallback(() => {
    let idx = indiceActualRef.current;
    const ahora = Date.now();

    // Compensar latencia de procesamiento de voz (Vosk) y tiempo de reacción
    if (ahora - ultimoCambioRef.current < 1800 && indiceAnteriorRef.current >= 0) {
      console.log(`⏱️ Compensación de latencia activa: confirmando elemento anterior (${indiceAnteriorRef.current}) en lugar de actual (${idx})`);
      idx = indiceAnteriorRef.current;
    }

    if (escaneando && idx >= 0 && idx < elementosRef.current.length) {
      const elementoElegido = elementosRef.current[idx];
      detenerEscaneo();
      onSelectRef.current?.(elementoElegido);
      return true;
    }
    return false;
  }, [escaneando, detenerEscaneo]);

  return {
    indiceActual,
    escaneando,
    confirmarElementoActual,
    detenerEscaneo,
  };
}
