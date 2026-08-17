/**
 * index.js (Reconocimiento de Voz)
 * 
 * Controlador principal que orquesta el reconocimiento de voz offline.
 * Conecta el modelo de Vosk con la entrada del micrófono del navegador.
 */

import { setupSpeechInterceptor } from './speechInterceptor';
import { cargarModelo } from './voskModel';
import { normalizarTexto } from './textUtils';

// Configurar el interceptor global una sola vez
setupSpeechInterceptor();

/**
 * Crea una instancia de reconocimiento de voz offline
 * 
 * @param {Object} opciones
 * @param {Function} opciones.onResult - Callback cuando se reconoce texto (recibe texto normalizado)
 * @param {Function} opciones.onPartial - Callback para resultados parciales (opcional)
 * @param {Function} opciones.onError - Callback para errores
 * @param {Function} opciones.onEstado - Callback para cambios de estado
 * @returns {Object} { start, stop, destroy, isListening }
 */
export async function crearReconocimiento({ onResult, onPartial, onError, onEstado }) {
  let audioContext = null;
  let mediaStream = null;
  let sourceNode = null;
  let recognizer = null;
  let listening = false;
  let destroyed = false;

  // Cargar modelo
  let model;
  try {
    model = await cargarModelo(onEstado);
  } catch (error) {
    onError?.('No se pudo cargar el modelo de voz: ' + error.message);
    return {
      start: () => {},
      stop: () => {},
      destroy: () => {},
      get isListening() { return false; },
    };
  }

  // Crear reconocedor Kaldi
  function resetRecognizer(sampleRate = 16000) {
    try {
      if (recognizer) {
        recognizer.remove();
        recognizer = null;
      }
    } catch (e) {}

    try {
      recognizer = new model.KaldiRecognizer(sampleRate);

      recognizer.on('result', (message) => {
        const texto = message?.result?.text || '';
        if (texto && texto.trim().length > 1) {
          const normalizado = normalizarTexto(texto);
          console.log('🎤 Vosk resultado:', texto, '→', normalizado);
          onResult?.(normalizado, texto);
        }
      });

      recognizer.on('partialresult', (message) => {
        const parcial = message?.result?.partial || '';
        if (parcial && parcial.trim().length > 1) {
          onPartial?.(normalizarTexto(parcial), parcial);
        }
      });
    } catch (error) {
      console.error('Error al crear reconocedor:', error);
      onError?.('Error al crear reconocedor: ' + error.message);
    }
  }

  resetRecognizer(16000);

  async function start() {
    if (destroyed) return;

    if (listening) return;

    try {
      // Solo inicializar si no existe aún
      if (!mediaStream) {
        if (!navigator.mediaDevices) {
          throw new Error("El navegador bloquea el micrófono por seguridad. Debes acceder usando 'localhost' o configurar HTTPS (o habilitar permisos en chrome://flags para tu IP)");
        }
        // Obtener acceso al micrófono
        mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            channelCount: 1,
            sampleRate: 16000,
          },
        });

        audioContext = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: 16000,
        });

        // Crear procesador de audio con AudioWorkletNode (Moderna)
        const workletCode = `
          class VoskProcessor extends AudioWorkletProcessor {
            constructor() {
              super();
              this.bufferSize = 4096;
              this.buffer = new Float32Array(this.bufferSize);
              this.framesRecorded = 0;
            }
            process(inputs, outputs, parameters) {
              const input = inputs[0];
              if (input && input.length > 0 && input[0]) {
                const channelData = input[0];
                for (let i = 0; i < channelData.length; i++) {
                  this.buffer[this.framesRecorded++] = channelData[i];
                  if (this.framesRecorded === this.bufferSize) {
                    this.port.postMessage(this.buffer.slice());
                    this.framesRecorded = 0;
                  }
                }
              }
              return true;
            }
          }
          registerProcessor('vosk-processor', VoskProcessor);
        `;

        const blob = new Blob([workletCode], { type: 'application/javascript' });
        const workletUrl = URL.createObjectURL(blob);
        
        await audioContext.audioWorklet.addModule(workletUrl);
        const processorNode = new AudioWorkletNode(audioContext, 'vosk-processor');

        processorNode.port.onmessage = (event) => {
          // Si el micrófono está pausado, destruido, o la computadora está hablando, ignorar
          if (!listening || destroyed || window.isComputerSpeaking) return;

          try {
            const float32Array = event.data;
            // Vosk acepta AudioBuffer
            const sampleRate = audioContext ? audioContext.sampleRate : 16000;
            const audioBuffer = audioContext.createBuffer(1, float32Array.length, sampleRate);
            audioBuffer.getChannelData(0).set(float32Array);
            recognizer.acceptWaveform(audioBuffer);
          } catch (e) {
            // Ignorar errores de procesamiento individuales
          }
        };

        sourceNode = audioContext.createMediaStreamSource(mediaStream);
        sourceNode.connect(processorNode);
        processorNode.connect(audioContext.destination);
      }

      // Reiniciar el buffer del reconocedor para olvidar cualquier audio anterior
      resetRecognizer(audioContext ? audioContext.sampleRate : 16000);

      listening = true;
      onEstado?.('escuchando');
      console.log('🎤 Vosk: escuchando...');
    } catch (error) {
      console.error('❌ Error al iniciar micrófono:', error);
      onError?.('No se pudo acceder al micrófono: ' + error.message);
      onEstado?.('error');
    }
  }

  function stop() {
    if (!listening) return;
    
    listening = false;
    onEstado?.('pausado');
    console.log('⏸️ Vosk: pausado (micrófono sigue activo pero silenciado para Vosk)');
  }

  function destroy() {
    destroyed = true;
    listening = false;
    onEstado?.('pausado');

    try {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        mediaStream = null;
      }
    } catch {}

    try {
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
        audioContext = null;
      }
    } catch {}

    sourceNode = null;

    try {
      recognizer?.remove();
    } catch {}

    recognizer = null;
    console.log('🗑️ Vosk: destruido y micrófono liberado');
  }

  onEstado?.('listo');

  return {
    start,
    stop,
    destroy,
    get isListening() {
      return listening;
    },
  };
}
