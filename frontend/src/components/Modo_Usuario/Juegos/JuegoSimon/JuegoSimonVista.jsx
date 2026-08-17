import React from "react";
import "./JuegoSimon.css";
import {
  FaSyncAlt,
  FaDoorOpen,
  FaSearch,
  FaBullseye,
  FaCheck,
  FaTimes,
  FaVolumeUp,
  FaClock,
} from "react-icons/fa";

export default function JuegoSimonVista({
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
  finalizarJuego,
  confirmarRespuesta,

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
      <div className="simon-page">
        <div className="simon-dialog-overlay">
          <div className="simon-dialog">
            <h2>Simón Dice</h2>
            <p>{textoIntro}</p>
            <div className="simon-dialog-actions">
              <button className="simon-dialog-btn" onClick={confirmarIntro}>
                Confirmar
              </button>
              <button className="simon-dialog-btn simon-dialog-back-btn" onClick={onBackToMenu}>
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
      <div className="simon-page">
        <div className="simon-container">
          <div className="simon-header">
            <p className="simon-title">Detectives del Tacto</p>
            <h1 className="simon-brand">Simón Dice</h1>
          </div>

          <section className="simon-card">
            <button
              className="mision-back-btn"
              onClick={onBackToMenu}
            >
              ← Regresar
            </button>
            <h3 className="simon-card-title">Selecciona una misión</h3>
            <p className="simon-subtitle">
              {textoElegirMision}
            </p>
            <div className="simon-carousel">
              {temas.map((tema, index) => {
                const cantidad = objetos.filter(
                  (o) =>
                    (o.tema || "").toLowerCase() === tema.toLowerCase()
                ).length;

                return (
                  <button
                    key={tema}
                    className={`simon-tema-card ${indiceEscaneo === index ? "activo-escaneo" : ""}`}
                    onClick={() => setTemaSeleccionado(tema)}
                  >
                    <span className="simon-tema-icon">
                      <FaBullseye size={50} />
                    </span>

                    <span className="simon-tema-name">{tema}</span>

                    <span className="simon-tema-count">
                      {cantidad} objetos
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="simon-floating-actions">
            <button
              className="simon-action-btn simon-exit-btn"
              onClick={onBackToMenu}
            >
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
      <div className="simon-page">
        <div className="simon-dialog-overlay">
          <div className="simon-dialog">
            <h2>Misión: {temaSeleccionado}</h2>
            <p>{textoMision}</p>
            <div className="simon-dialog-actions">
              <button className="simon-dialog-btn" onClick={confirmarMision}>
                Confirmar
              </button>
              <button className="simon-dialog-btn simon-dialog-back-btn" onClick={onBackToMenu}>
                Regresar
              </button>
            </div>
          </div>
        </div>

        <div className="simon-floating-actions">
          <button
            className="simon-action-btn simon-change-btn"
            onClick={cambiarMision}
          >
            <FaSyncAlt color="white" size={20} />
            Cambiar misión
          </button>

          <button
            className="simon-action-btn simon-exit-btn"
            onClick={onBackToMenu}
          >
            <FaDoorOpen size={20} />
            Finalizar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="simon-page">
      <div className="simon-container simon-game-container">
        <button
          className="simon-back-btn"
          onClick={cambiarMision}
        >
          ← Regresar
        </button>
        <div className="simon-score-box">
          Puntaje: {aciertos} / {totalObjetos}
        </div>

        <div className="simon-mission-badge">
          Misión: <strong>{temaSeleccionado}</strong>
        </div>

        <section className="simon-main-board">
          <p className="simon-says-text">Simón dice toca...</p>

          <div className="simon-object-frame">
            {objetivoActual?.imagen ? (
              <img
                src={objetivoActual.imagen}
                alt={objetivoActual.nombre}
                className="simon-object-image"
              />
            ) : (
              <div className="simon-no-image">
                <FaSearch size={60} />
              </div>
            )}
          </div>

          <h1 className="simon-object-name">
            {objetivoActual ? objetivoActual.nombre : "Cargando..."}
          </h1>

          <p className="simon-instruction">
            Busca el objeto correcto y tócalo con Makey Makey.
          </p>

          <div
            className={`simon-feedback ${resultado === "correcto"
              ? "feedback-ok"
              : resultado === "incorrecto"
                ? "feedback-bad"
                : ""
              }`}
          >
            {resultado === "correcto" ? (
              <>
                <FaCheck />
                <span>¡Muy bien detective!</span>
              </>
            ) : resultado === "incorrecto" ? (
              <>
                <FaTimes />
                <span>Suerte a la próxima</span>
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

          <button className="simon-confirm-btn" onClick={confirmarRespuesta}>
            Confirmar
          </button>
        </section>

        {mensajeTemporal && (
          <div className={`simon-toast simon-toast-${mensajeTemporal.tipo}`}>
            {mensajeTemporal.texto}
          </div>
        )}

        <div className="simon-floating-actions">
          <button
            className="simon-action-btn simon-exit-btn"
            onClick={finalizarJuego}
          >
            <FaDoorOpen size={20} />
            Finalizar
          </button>
        </div>

        {juegoFinalizado && (
          <div className="simon-dialog-overlay">
            <div className="simon-dialog">
              <h2>Misión completada</h2>

              <p>Tu puntuación final es:</p>

              <div className="simon-dialog-score">
                {aciertos} / {totalObjetos}
              </div>

              <div className="simon-dialog-actions">
                <button
                  className="simon-dialog-btn simon-dialog-secondary"
                  onClick={cambiarMision}
                >
                  Cambiar misión
                </button>

                <button
                  className="simon-dialog-btn"
                  onClick={onBackToMenu}
                >
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