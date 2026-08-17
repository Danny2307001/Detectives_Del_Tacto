import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

import detective from "../../imagenes/detective.png";
import huellas from "../../imagenes/huellas.png";
import nubes from "../../imagenes/nubes.png";

import logoEpn from "../../imagenes/EPN.png";
import logoFis from "../../imagenes/fis.png";
import logoLudolab from "../../imagenes/ludo.png";

export default function Home() {
  const navigate = useNavigate();

  const [mostrarAcceso, setMostrarAcceso] = useState(false);
  const [mostrarCreditos, setMostrarCreditos] = useState(false);
  const [claveEducador, setClaveEducador] = useState("");
  const [errorClave, setErrorClave] = useState("");

  function validarAcceso() {
    if (claveEducador === "detective123") {
      navigate("/educador");
      return;
    }

    setErrorClave("Clave incorrecta. Intenta nuevamente.");
  }

  return (
    <main className="home-detective">
      <img src={nubes} alt="" className="home-cloud cloud-one" />
      <img src={nubes} alt="" className="home-cloud cloud-two" />
      <img src={huellas} alt="" className="home-footprints footprints-one" />
      <img src={huellas} alt="" className="home-footprints footprints-two" />

      <section className="home-content">
        <div className="home-title-box">
          <h1 className="home-title">
            Detectives
            <span>del Tacto</span>
          </h1>

          <p className="home-subtitle">
            Explora, descubre y aprende con el tacto
          </p>
        </div>

        <button
          className="play-button"
          onClick={() => navigate("/usuario")}
          aria-label="Comenzar misión"
        >
          <span className="play-btn-icon">🎮</span>
          JUGAR
        </button>

        <button
          className="credits-button"
          onClick={() => setMostrarCreditos(true)}
        >
          ℹ Créditos
        </button>
      </section>

      <img
        src={detective}
        alt="Detective guía de la aplicación"
        className="home-detective-img"
      />

      <button
        className="educator-access"
        onClick={() => setMostrarAcceso(true)}
        aria-label="Acceso para educadores"
      >
        <span className="educator-text">Zona para educadores</span>
        <span className="gear">⚙️</span>
      </button>

      {mostrarAcceso && (
        <div className="home-modal-overlay">
          <div className="home-modal">
            <h2>Acceso del Detective Maestro</h2>

            <p>
              Ingresa la clave secreta para administrar las misiones educativas.
            </p>

            <input
              type="password"
              placeholder="Clave secreta"
              value={claveEducador}
              onChange={(e) => {
                setClaveEducador(e.target.value);
                setErrorClave("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") validarAcceso();
              }}
            />

            {errorClave && (
              <span className="home-modal-error">{errorClave}</span>
            )}

            <div className="home-modal-actions">
              <button
                className="home-modal-cancel"
                onClick={() => {
                  setMostrarAcceso(false);
                  setClaveEducador("");
                  setErrorClave("");
                }}
              >
                Cancelar
              </button>

              <button className="home-modal-enter" onClick={validarAcceso}>
                Entrar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarCreditos && (
        <div className="home-modal-overlay">
          <div className="home-credits-modal">
            <div className="credits-logos">
              <img src={logoEpn} alt="Escuela Politécnica Nacional" />
              <img src={logoFis} alt="Facultad de Ingeniería de Sistemas" />
              <img src={logoLudolab} alt="LudoLab" />
            </div>

            <h2>Créditos</h2>

            <p className="credits-description">
              Detectives del Tacto es un proyecto educativo diseñado para
              fortalecer el aprendizaje sensorial y la exploración táctil
              mediante interacción accesible con Makey Makey.
            </p>

            <div className="credits-info">
              <div>
                <strong>Autora</strong>
                <span>Daniela Guachamin</span>
              </div>

              <div>
                <strong>Tutor</strong>
                <span>PhD. Marco Santorum</span>
              </div>

              <div>
                <strong>Laboratorio</strong>
                <span>LudoLab - FIS EPN</span>
              </div>
            </div>

            <button
              className="home-modal-enter"
              onClick={() => setMostrarCreditos(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}