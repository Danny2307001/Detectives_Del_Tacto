/**
 * speechInterceptor.js
 * 
 * Interceptor global para sincronizar `window.speechSynthesis` con el estado del micrófono.
 * Esto garantiza que NO importa qué componente o juego hable (Simón, Detective, etc.),
 * el micrófono siempre se bloqueará físicamente mientras la computadora hable.
 */

export function setupSpeechInterceptor() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window && !window.__speechInterceptorSetup) {
    window.__speechInterceptorSetup = true;
    const originalSpeak = window.speechSynthesis.speak.bind(window.speechSynthesis);
    
    window.speechSynthesis.speak = function(utterance) {
      window.isComputerSpeaking = true;
      
      // Limpiar bloqueo de voz anterior si se superponen
      if (window._voskSpeechTimeout) clearTimeout(window._voskSpeechTimeout);
      
      const releaseLock = () => {
        if (window._voskSpeechTimeout) clearTimeout(window._voskSpeechTimeout);
        window._voskSpeechTimeout = setTimeout(() => {
          // Verificar nativamente si el navegador sigue hablando
          // para ignorar eventos onend desfasados (race conditions al cancelar)
          if (!window.speechSynthesis.speaking) {
            window.isComputerSpeaking = false;
          }
        }, 600); // 600ms de gracia tras terminar de hablar
      };
  
      const originalOnEnd = utterance.onend;
      utterance.onend = function(e) {
        releaseLock();
        if (originalOnEnd) originalOnEnd.call(this, e);
      };
      
      const originalOnError = utterance.onerror;
      utterance.onerror = function(e) {
        releaseLock();
        if (originalOnError) originalOnError.call(this, e);
      };
  
      originalSpeak(utterance);
    };
  }
}
