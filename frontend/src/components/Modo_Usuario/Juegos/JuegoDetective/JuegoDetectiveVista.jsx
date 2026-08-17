import React from "react";
import "./JuegoDetective.css";
import {
  FaSearch,
  FaDoorOpen,
  FaSyncAlt,
  FaCheck,
  FaTimes,
  FaVolumeUp,
  FaClock,
  FaFingerprint,
  FaEye,
} from "react-icons/fa";

export default function JuegoDetectiveVista({
  temas = [],
  objetos = [],
  temaSeleccionado,
  setTemaSeleccionado,

  objetivoActual,
  pistasActuales = [],
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
      <div className="detective-page">
        <div className="detective-dialog-overlay">
          <div className="detective-dialog">
            <h2>Detective Sensorial</h2>
            <p>{textoIntro}</p>

            <div className="detective-dialog-actions">
              <button className="detective-dialog-btn" onClick={confirmarIntro}>
                Confirmar
              </button>

              <button
                className="detective-dialog-btn detective-dialog-back-btn"
                onClick={onBackToMenu}
              >
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
      <div className="detective-page">
        <div className="detective-container">
          <div className="detective-header">
            <p className="detective-title">Detectives del Tacto</p>
            <h1 className="detective-brand">Detective Sensorial</h1>
          </div>

          <section className="detective-card detective-temas-card">
            <button
              className="detective-back-btn"
              onClick={onBackToMenu}
            >
              ← Regresar
            </button>
            <h3 className="detective-card-title">Selecciona una misión</h3>
            <p className="detective-subtitle">
              {textoElegirMision}
            </p>
            <div className="detective-temas-carousel">
              {temas.map((tema, index) => {
                const cantidad = objetos.filter(
                  (o) => (o.tema || "").toLowerCase() === tema.toLowerCase()
                ).length;

                return (
                  <button
                    key={tema}
                    className={`detective-tema-card ${indiceEscaneo === index ? "activo-escaneo" : ""}`}
                    onClick={() => setTemaSeleccionado(tema)}
                  >
                    <span className="detective-tema-icono">
                      <FaSearch size={48} />
                    </span>

                    <span className="detective-tema-nombre">{tema}</span>

                    <span className="detective-tema-contador">
                      {cantidad} objetos
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="detective-floating-actions">
            <button className="detective-action-btn detective-exit-btn" onClick={onBackToMenu}>
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
      <div className="detective-page">
        <div className="detective-dialog-overlay">
          <div className="detective-dialog">
            <h2>Misión: {temaSeleccionado}</h2>
            <p>{textoMision}</p>

            <div className="detective-dialog-actions">
              <button className="detective-dialog-btn" onClick={confirmarMision}>
                Confirmar
              </button>
              <button className="detective-dialog-btn detective-dialog-back-btn"
                onClick={() => { cambiarMision() }}>
                Regresar
              </button>
            </div>
          </div>
        </div>

        <div className="detective-floating-actions">
          <button className="detective-action-btn detective-change-btn" onClick={cambiarMision}>
            <FaSyncAlt size={20} />
            Cambiar misión
          </button>

          <button className="detective-action-btn detective-exit-btn" onClick={onBackToMenu}>
            <FaDoorOpen size={20} />
            Finalizar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="detective-page">
      <div className="detective-container detective-game-container">
        <button
          className="detective-back-btn"
          onClick={cambiarMision}
        >
          ← Regresar
        </button>
        <div className="detective-score-box">Puntaje: {aciertos}/{totalObjetos}</div>

        <div className="detective-mission-badge">
          Misión: <strong>{temaSeleccionado}</strong>
        </div>

        <section className="detective-main-board">
          <p className="detective-main-title">Caso misterioso</p>

          <div className="detective-evidence-grid">
            {pistasActuales.length > 0 ? (
              pistasActuales.map((pista, index) => (
                <div className="detective-evidence-card" key={`${pista.tipo}-${index}`}>
                  <FaFingerprint className="detective-evidence-icon" />
                  <span className="detective-evidence-label">Pista {index + 1}</span>
                  <strong>{pista.frase}</strong>
                </div>
              ))
            ) : (
              <div className="detective-evidence-card">
                <FaClock className="detective-evidence-icon" />
                <span className="detective-evidence-label">Preparando</span>
                <strong>Esperando pistas...</strong>
              </div>
            )}
          </div>

          {respuestaRevelada && objetivoActual && (
            <div className="detective-answer-box">
              <p className="detective-answer-label">Respuesta revelada</p>

              {objetivoActual.imagen && (
                <div className="detective-image-box">
                  <img
                    src={objetivoActual.imagen}
                    alt={objetivoActual.nombre}
                    className="detective-image"
                  />
                </div>
              )}

              <h2 className="detective-object-name">{objetivoActual.nombre}</h2>

              <button className="detective-confirm-btn" onClick={siguienteRonda}>
                Siguiente caso
              </button>
            </div>
          )}

          {!respuestaRevelada && (
            <>
              <p className="detective-card-description detective-center-text">
                Explora los objetos reales. Cuando creas encontrar el correcto,
                confirma tu respuesta.
              </p>

              <div className="detective-game-buttons">
                <button className="detective-confirm-btn" onClick={confirmarRespuesta}>
                  Confirmar respuesta
                </button>

                <button className="detective-reveal-btn" onClick={revelarRespuesta}>
                  <FaEye />
                  Revelar respuesta
                </button>
              </div>
            </>
          )}

          <div
            className={`detective-feedback ${resultado === "correcto"
              ? "feedback-ok"
              : resultado === "incorrecto"
                ? "feedback-bad"
                : ""
              }`}
          >
            {resultado === "correcto" ? (
              <>
                <FaCheck />
                <span>¡Caso resuelto!</span>
              </>
            ) : resultado === "incorrecto" ? (
              <>
                <FaTimes />
                <span>Sigue investigando</span>
              </>
            ) : esperandoConfirmacion ? (
              <>
                <FaVolumeUp />
                <span>Di o presiona: lo encontré</span>
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
          <div className={`detective-toast detective-toast-${mensajeTemporal.tipo}`}>
            {mensajeTemporal.texto}
          </div>
        )}

        <div className="detective-floating-actions">
          <button className="detective-action-btn detective-exit-btn" onClick={finalizarJuego}>
            <FaDoorOpen size={20} />
            Finalizar
          </button>
        </div>

        {juegoFinalizado && (
          <div className="detective-dialog-overlay">
            <div className="detective-dialog">
              <h2>Misión completada</h2>

              <p>Tu puntuación final es:</p>

              <div className="detective-dialog-score">{aciertos}/{totalObjetos}</div>

              <div className="detective-dialog-actions">
                <button
                  className="detective-dialog-btn detective-dialog-secondary"
                  onClick={cambiarMision}
                >
                  Cambiar misión
                </button>

                <button className="detective-dialog-btn" onClick={onBackToMenu}>
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