import React from "react";
import { useNavigate } from "react-router-dom";
import "./Usuario.css";
import { FaDoorOpen, FaCheckCircle } from "react-icons/fa";

import detective from "../../imagenes/detective.png";
import huellas from "../../imagenes/huellas.png";
import nubes from "../../imagenes/nubes.png";

export default function UsuarioVista({
  pantalla,
  objetoActual,
  objetos = [],
  setPantalla,
  onBackToInicio,

  temaExploracion,
  seleccionarTemaExploracion,
  volverAMisionesExploracion,
  dialogoExploracionConfirmado,
  confirmarDialogoExploracion,
  temasExploracion = [],
  objetosExploracion = [],
  indiceExplorarEscaneo,
  detenerEscaneoExplorar,
  objetosTocados = [],
}) {
  const navigate = useNavigate();

  function regresarInicio() {
    onBackToInicio?.();
    navigate("/");
  }

  if (pantalla === "bienvenida") {
    return (
      <div className="usuario-page">
        <img src={nubes} alt="" className="usuario-nube nube-uno" />
        <img src={nubes} alt="" className="usuario-nube nube-dos" />
        <img src={huellas} alt="" className="usuario-huellas huellas-uno" />

        <button className="usuario-back-btn" onClick={regresarInicio}>
          ← Regresar
        </button>

        <main className="usuario-container usuario-welcome">
          <section className="usuario-text-zone">
            <p className="usuario-title">Detectives del Tacto</p>

            <h1 className="usuario-brand">Hola, detective</h1>

            <p className="usuario-subtitle">
              Puedes elegir EXPLORAR para descubrir objetos, o JUGAR para resolver misiones táctiles.
            </p>

            <div className="usuario-buttons-grid">
              <button
                className="usuario-selection-btn usuario-selection-btn-explorar"
                onClick={() => setPantalla("explorar")}
              >
                <span className="usuario-btn-icon">🔍</span>
                <span className="usuario-btn-label">Explorar</span>
                <span className="usuario-btn-desc">
                  Descubre objetos usando el tacto y el sonido.
                </span>
              </button>

              <button
                className="usuario-selection-btn usuario-selection-btn-jugar"
                onClick={() => setPantalla("menuJuegos")}
              >
                <span className="usuario-btn-icon">🎮</span>
                <span className="usuario-btn-label">Jugar</span>
                <span className="usuario-btn-desc">
                  Resuelve misiones táctiles como detective.
                </span>
              </button>
            </div>
          </section>

          <img
            src={detective}
            alt="Detective guía"
            className="usuario-detective"
          />
        </main>
      </div>
    );
  }

  if (pantalla === "explorar") {
    if (!dialogoExploracionConfirmado) {
      return (
        <div className="usuario-page">
          <div className="usuario-dialog-overlay">
            <div className="usuario-dialog">
              <h2>Explorar</h2>

              <p>
                En este modo podrás tocar objetos reales con Makey Makey y
                escuchar sus características. Primero deberás elegir una misión
                para explorar sus objetos.
              </p>

              <div className="usuario-dialog-actions">
                <button className="usuario-dialog-btn" onClick={confirmarDialogoExploracion}>
                  Confirmar
                </button>
                <button
                  className="usuario-dialog-btn usuario-dialog-back-btn"
                  onClick={() => setPantalla("bienvenida")}
                >
                  Regresar
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (!temaExploracion) {
      return (
        <div className="usuario-page">
          <img src={nubes} alt="" className="usuario-nube nube-uno" />
          <img src={nubes} alt="" className="usuario-nube nube-dos" />
          <img src={huellas} alt="" className="usuario-huellas huellas-dos" />

          <button
            className="usuario-back-btn"
            onClick={() => {
              detenerEscaneoExplorar?.();
              setPantalla("bienvenida");
            }}
          >
            ← Regresar
          </button>

          <main className="usuario-container">
            <p className="usuario-brand">Detectives del Tacto</p>
            <h1 className="usuario-title">Explorar</h1>
            <p className="usuario-subtitle">
              Antes de comenzar, debes elegir una misión. Te leeré cada opción disponible. Después, tendrás 5 segundos para decir 'confirmar' si deseas elegirla.
            </p>

            <section className="usuario-card usuario-misiones-card">
              <h2 className="usuario-section-title">Misiones disponibles</h2>

              <div className="usuario-temas-grid">
                {temasExploracion.map((tema, index) => {
                  const cantidad = objetos.filter(
                    (o) =>
                      (o.tema || "").toLowerCase() === tema.toLowerCase()
                  ).length;

                  return (
                    <button
                      key={tema}
                      className={`usuario-tema-card ${indiceExplorarEscaneo === index ? "activo-escaneo" : ""}`}
                      onClick={() => {
                        detenerEscaneoExplorar?.();
                        seleccionarTemaExploracion(tema);
                      }}
                    >
                      <span className="usuario-tema-icon">🔎</span>
                      <span className="usuario-tema-name">{tema}</span>
                      <span className="usuario-tema-count">
                        {cantidad} objeto{cantidad === 1 ? "" : "s"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </main>

          <button
            className="usuario-btn-finalizar"
            onClick={() => {
              detenerEscaneoExplorar?.();
              setPantalla("bienvenida");
            }}
          >
            <FaDoorOpen size={24} />
            Finalizar
          </button>
        </div>
      );
    }

    return (
      <div className="usuario-page">
        <img src={nubes} alt="" className="usuario-nube nube-uno" />
        <img src={huellas} alt="" className="usuario-huellas huellas-dos" />

        <button
          className="usuario-back-btn"
          onClick={volverAMisionesExploracion}
        >
          ← Regresar
        </button>

        <main className="usuario-container usuario-exploracion-layout">
          <p className="usuario-brand">Detectives del Tacto</p>

          <h1 className="usuario-title">Exploración</h1>

          <div className="usuario-mission-badge">
            Misión: <strong>{temaExploracion}</strong>
          </div>

          <section className="usuario-exploracion-board">
            <div className="usuario-objetos-ring">
              {objetosExploracion.map((o) => {
                const objKey = o._id || `${o.tecla}-${o.nombre}`;
                const tocado = objetosTocados.includes(objKey);

                return (
                  <div
                    key={objKey}
                    className={`usuario-mini-object ${objetoActual?._id === o._id ? "activo" : ""} ${tocado ? "usuario-mini-object-tocado" : ""}`}
                  >
                    {tocado && (
                      <div className="usuario-mini-object-check">
                        <FaCheckCircle />
                      </div>
                    )}

                    {o.imagen ? (
                      <img src={o.imagen} alt={o.nombre} />
                    ) : (
                      <span>🔍</span>
                    )}

                    <small>{o.nombre}</small>
                  </div>
                );
              })}
            </div>

            <div className={`usuario-object-center ${!objetoActual ? "sin-objeto" : ""}`}>
              {objetoActual && (
                <>
                  {objetoActual.imagen && (
                    <div className="usuario-object-image">
                      <img src={objetoActual.imagen} alt={objetoActual.nombre} />
                    </div>
                  )}

                  <p className="usuario-card-label">Objeto detectado</p>

                  <h2 className="usuario-card-title">
                    {objetoActual.nombre}
                  </h2>

                  <p className="usuario-card-key">
                    Tecla: {objetoActual.tecla}
                  </p>

                  <p className="usuario-card-description">
                    {objetoActual.descripcion ||
                      objetoActual.descripcionAutomatica ||
                      "Objeto registrado sin descripción."}
                  </p>

                  {objetoActual.funcion && (
                    <p className="usuario-card-description">
                      <strong>Función:</strong> {objetoActual.funcion}
                    </p>
                  )}
                </>
              )}
            </div>
          </section>
        </main>

        <button
          className="usuario-btn-finalizar"
          onClick={() => {
            detenerEscaneoExplorar?.();
            setPantalla("bienvenida");
          }}
        >
          <FaDoorOpen size={24} />
          Finalizar
        </button>
      </div>
    );
  }

  if (pantalla === "menuJuegos") {
    return (
      <div className="usuario-page">
        <img src={nubes} alt="" className="usuario-nube nube-uno" />
        <img src={nubes} alt="" className="usuario-nube nube-dos" />
        <img src={huellas} alt="" className="usuario-huellas huellas-uno" />

        <button
          className="usuario-back-btn"
          onClick={() => setPantalla("bienvenida")}
        >
          ← Regresar
        </button>

        <main className="usuario-container">
          <p className="usuario-title">Detectives del Tacto</p>
          <h1 className="usuario-brand">Menú de Juegos</h1>
          <p className="usuario-subtitle">
            Di "Simón", "Detective" o "Misión" para descubrir distintas misiones.
          </p>

          <div className="usuario-games-grid">
            <button
              className="usuario-game-card"
              onClick={() => setPantalla("juegoSimon")}
            >
              <span className="usuario-game-number">Misión 1</span>
              <h2>🖐️ Simón Dice</h2>
              <p>Reconoce objetos siguiendo la instrucción del sistema.</p>
            </button>

            <button
              className="usuario-game-card"
              onClick={() => setPantalla("juegoDetective")}
            >
              <span className="usuario-game-number">Misión 2</span>
              <h2>🕵️ Detective Sensorial</h2>
              <p>Encuentra objetos usando pistas táctiles y sensoriales.</p>
            </button>

            <button
              className="usuario-game-card"
              onClick={() => setPantalla("juegoMisionUtil")}
            >
              <span className="usuario-game-number">Misión 3</span>
              <h2>🎯 Misión Útil</h2>
              <p>
                Identifica objetos a partir de su utilidad y para qué sirven en
                la vida diaria.
              </p>
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="usuario-page">
      <main className="usuario-container">
        <section className="usuario-card">
          <p>Pantalla no reconocida.</p>
        </section>
      </main>
    </div>
  );
}