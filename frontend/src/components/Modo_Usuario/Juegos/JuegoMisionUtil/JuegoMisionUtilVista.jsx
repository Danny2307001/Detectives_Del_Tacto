import React from "react";
import "./JuegoMisionUtil.css";
import {
  FaDoorOpen,
  FaSyncAlt,
  FaCheck,
  FaTimes,
  FaVolumeUp,
  FaClock,
  FaLightbulb,
  FaEye,
  FaPuzzlePiece,
} from "react-icons/fa";

export default function JuegoMisionUtilVista({
  temas = [],
  objetos = [],
  temaSeleccionado,
  setTemaSeleccionado,

  objetivoActual,
  esperandoConfirmacion,
  resultado,

  aciertos = 0,
  totalObjetos = 0,
  mensajeTemporal,
  juegoFinalizado,
  respuestaRevelada,

  confirmarRespuesta,
  revelarRespuesta,
  finalizarJuego,
  siguienteRonda,

  onBackToMenu,
  cambiarMision,

  dialogoIntroConfirmado,
  confirmarIntro,
  textoIntro,

  dialogoSeleccionConfirmado,
  confirmarSeleccion,
  textoElegirMision,

  dialogoMisionConfirmado,
  confirmarMision,
  textoMision,
  indiceEscaneo,
}) {
  if (!dialogoIntroConfirmado) {
    return (
      <div className="mision-page">
        <div className="mision-dialog-overlay">
          <div className="mision-dialog">
            <h2>Misión Útil</h2>
            <p>{textoIntro}</p>
            <div className="mision-dialog-actions">
              <button className="mision-dialog-btn" onClick={confirmarIntro}>
                Confirmar
              </button>
              <button className="mision-dialog-btn mision-dialog-back-btn" onClick={onBackToMenu}>
                Regresar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!temaSeleccionado) {
    return (
      <div className="mision-page">
        <div className="mision-container">
          <div className="mision-header">
            <p className="mision-title">Detectives del Tacto</p>
            <h1 className="mision-brand">Misión Útil</h1>
          </div>

          <section className="mision-card">
            <button
              className="mision-back-btn"
              onClick={onBackToMenu}
            >
              ← Regresar
            </button>
            <h3 className="mision-card-title">Selecciona una misión</h3>
            <p className="mision-subtitle">
              {textoElegirMision}
            </p>
            <div className="mision-carousel">
              {temas.map((tema, index) => {
                const cantidad = objetos.filter(
                  (o) => (o.tema || "").toLowerCase() === tema.toLowerCase()
                ).length;

                return (
                  <button
                    key={tema}
                    className={`mision-tema-card ${indiceEscaneo === index ? "activo-escaneo" : ""}`}
                    onClick={() => setTemaSeleccionado(tema)}
                  >
                    <span className="mision-tema-icon">
                      <FaPuzzlePiece size={48} />
                    </span>

                    <span className="mision-tema-name">{tema}</span>

                    <span className="mision-tema-count">
                      {cantidad} objetos
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="mision-floating-actions">
            <button className="mision-action-btn mision-exit-btn" onClick={onBackToMenu}>
              <FaDoorOpen size={20} />
              Finalizar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dialogoMisionConfirmado) {
    return (
      <div className="mision-page">
        <div className="mision-dialog-overlay">
          <div className="mision-dialog">
            <h2>Misión: {temaSeleccionado}</h2>
            <p>{textoMision}</p>

            <div className="mision-dialog-actions">
              <button className="mision-dialog-btn" onClick={confirmarMision}>
                Confirmar
              </button>
              <button className="mision-dialog-btn mision-dialog-back-btn" onClick={cambiarMision}>
                Regresar
              </button>
            </div>
          </div>
        </div>

        <div className="mision-floating-actions">
          <button className="mision-action-btn mision-change-btn" onClick={cambiarMision}>
            <FaSyncAlt size={20} />
            Cambiar misión
          </button>

          <button className="mision-action-btn mision-exit-btn" onClick={onBackToMenu}>
            <FaDoorOpen size={20} />
            Finalizar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mision-page">
      <div className="mision-container mision-game-container">
        <button
          className="mision-back-btn"
          onClick={cambiarMision}
        >
          ← Regresar
        </button>
        <div className="mision-score-box">Puntaje: {aciertos}/{totalObjetos}</div>

        <div className="mision-mission-badge">
          Misión: <strong>{temaSeleccionado}</strong>
        </div>

        <section className="mision-main-board">
          <p className="mision-main-title">¿Qué objeto sirve para...?</p>

          <div className="mision-function-card">
            <FaLightbulb className="mision-function-icon" />

            <span className="mision-function-label">Función objetivo</span>

            <strong>
              {objetivoActual?.funcion
                ? objetivoActual.funcion
                : "Cargando función..."}
            </strong>
          </div>

          {!respuestaRevelada && (
            <>
              <p className="mision-card-description mision-center-text">
                Explora los objetos reales y encuentra cuál cumple esta función.
              </p>

              <div className="mision-game-buttons">
                <button className="mision-confirm-btn" onClick={confirmarRespuesta}>
                  Confirmar respuesta
                </button>

                <button className="mision-reveal-btn" onClick={revelarRespuesta}>
                  <FaEye />
                  Revelar respuesta
                </button>
              </div>
            </>
          )}

          {respuestaRevelada && objetivoActual && (
            <div className="mision-answer-box">
              <p className="mision-answer-label">Respuesta revelada</p>

              {objetivoActual.imagen && (
                <div className="mision-image-box">
                  <img
                    src={objetivoActual.imagen}
                    alt={objetivoActual.nombre}
                    className="mision-image"
                  />
                </div>
              )}

              <h2 className="mision-object-name">{objetivoActual.nombre}</h2>

              <button className="mision-confirm-btn" onClick={siguienteRonda}>
                Siguiente reto
              </button>
            </div>
          )}

          <div
            className={`mision-feedback ${resultado === "correcto"
              ? "feedback-ok"
              : resultado === "incorrecto"
                ? "feedback-bad"
                : ""
              }`}
          >
            {resultado === "correcto" ? (
              <>
                <FaCheck />
                <span>¡Correcto detective!</span>
              </>
            ) : resultado === "incorrecto" ? (
              <>
                <FaTimes />
                <span>Intenta otra vez</span>
              </>
            ) : esperandoConfirmacion ? (
              <>
                <FaVolumeUp />
                <span>Di o presiona: Confirmar</span>
              </>
            ) : (
              <>
                <FaClock />
                <span>Esperando tu respuesta...</span>
              </>
            )}
          </div>
        </section>

        {mensajeTemporal && (
          <div className={`mision-toast mision-toast-${mensajeTemporal.tipo}`}>
            {mensajeTemporal.texto}
          </div>
        )}

        <div className="mision-floating-actions">
          <button className="mision-action-btn mision-exit-btn" onClick={finalizarJuego}>
            <FaDoorOpen size={20} />
            Finalizar
          </button>
        </div>

        {juegoFinalizado && (
          <div className="mision-dialog-overlay">
            <div className="mision-dialog">
              <h2>Misión completada</h2>

              <p>Tu puntuación final es:</p>

              <div className="mision-dialog-score">{aciertos}/{totalObjetos}</div>

              <div className="mision-dialog-actions">
                <button
                  className="mision-dialog-btn mision-dialog-secondary"
                  onClick={cambiarMision}
                >
                  Cambiar misión
                </button>

                <button className="mision-dialog-btn" onClick={onBackToMenu}>
                  Terminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}