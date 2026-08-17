import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Educador.css";

export default function EducadorMisiones({
  objetos = [],
  temas = [],
  nuevoTema,
  setNuevoTema,
  crearTema,
  setTemaActual,
  eliminarMision,
}) {
  const navigate = useNavigate();

  const [modalCrear, setModalCrear] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [temaAEliminar, setTemaAEliminar] = useState(null);
  const [modalNotificacion, setModalNotificacion] = useState(null);

  const misionesPorPagina = 4;
  const totalPaginas = Math.ceil(temas.length / misionesPorPagina);

  const temasPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * misionesPorPagina;
    return temas.slice(inicio, inicio + misionesPorPagina);
  }, [temas, paginaActual]);

  function crearYCerrar() {
    crearTema();
    setModalCrear(false);

    setTimeout(() => {
      setPaginaActual(
        Math.ceil((temas.length + 1) / misionesPorPagina)
      );
    }, 100);
  }

  async function confirmarEliminar() {
    if (!temaAEliminar) return;
    try {
      const temaNombre = temaAEliminar;
      await eliminarMision(temaNombre);
      setTemaAEliminar(null);
      setModalNotificacion({
        titulo: "Misión eliminada",
        mensaje: `La misión "${temaNombre}" fue eliminada correctamente.`
      });
    } catch (err) {
      setTemaAEliminar(null);
      setModalNotificacion({
        titulo: "Error",
        mensaje: "No se pudo eliminar la misión. Inténtalo de nuevo."
      });
    }
  }

  return (
    <div className="educador-page">
      <div className="educador-container">
        <button className="educador-back-btn" onClick={() => navigate("/")}>
          ← Regresar
        </button>

        <header className="educador-header">
          <h1 className="educador-brand">Detectives del Tacto</h1>

          <h2 className="educador-title">Centro de Misiones</h2>

          <p className="educador-subtitle">
            Crea una misión o abre una existente para registrar objetos.
          </p>
        </header>

        <section className="educador-card educador-misiones-card">
          <div className="educador-misiones-header">
            <h2 className="educador-misiones-title">Misiones creadas</h2>

            <button
              className="educador-add-mision-btn"
              onClick={() => setModalCrear(true)}
            >
              + Crear misión
            </button>
          </div>

          <div className="educador-temas-grid">
            {temasPaginados.map((tema) => {
              const cantidad = objetos.filter(
                (o) =>
                  (o.tema || "").toLowerCase() === tema.toLowerCase()
              ).length;

              return (
                <div
                  key={tema}
                  className="educador-tema-card"
                  onClick={() => setTemaActual(tema)}
                >
                  <button
                    className="educador-delete-mision-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTemaAEliminar(tema);
                    }}
                  >
                    🗑️
                  </button>

                  <span className="educador-tema-icono">🔎</span>

                  <span className="educador-tema-nombre">
                    {tema}
                  </span>

                  <span className="educador-tema-contador">
                    {cantidad} objeto{cantidad === 1 ? "" : "s"}
                  </span>

                  <span className="educador-tema-action">
                    Abrir misión
                  </span>
                </div>
              );
            })}
          </div>

          {totalPaginas > 1 && (
            <div className="educador-pagination">
              <button
                onClick={() =>
                  setPaginaActual((p) => Math.max(p - 1, 1))
                }
                disabled={paginaActual === 1}
              >
                ← Anterior
              </button>

              <span>
                Página {paginaActual} de {totalPaginas}
              </span>

              <button
                onClick={() =>
                  setPaginaActual((p) => Math.min(p + 1, totalPaginas))
                }
                disabled={paginaActual === totalPaginas}
              >
                Siguiente →
              </button>
            </div>
          )}
        </section>

        {modalCrear && (
          <div className="educador-modal-overlay">
            <section className="educador-modal educador-create-mission-modal">
              <div className="educador-modal-header">
                <h2>Crear misión</h2>

                <button
                  className="educador-modal-close"
                  onClick={() => setModalCrear(false)}
                >
                  ×
                </button>
              </div>

              <div className="educador-form-group">
                <label>Nombre de la misión</label>

                <input
                  type="text"
                  placeholder="Ej: Frutas, casa, útiles..."
                  value={nuevoTema}
                  autoFocus
                  onChange={(e) => setNuevoTema(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") crearYCerrar();
                  }}
                />
              </div>

              <div className="educador-modal-actions">
                <button
                  className="educador-cancel-btn"
                  onClick={() => setModalCrear(false)}
                >
                  Cancelar
                </button>

                <button
                  className="educador-save-btn"
                  onClick={crearYCerrar}
                >
                  Crear misión
                </button>
              </div>
            </section>
          </div>
        )}

        {temaAEliminar && (
          <div className="educador-modal-overlay">
            <section className="educador-modal educador-create-mission-modal">
              <div className="educador-modal-header">
                <h2>Confirmar eliminación</h2>

                <button
                  className="educador-modal-close"
                  onClick={() => setTemaAEliminar(null)}
                >
                  ×
                </button>
              </div>

              <div className="educador-form-group" style={{ margin: "20px 0" }}>
                <p style={{ fontSize: "20px", fontWeight: "800", color: "#3b1f0f", lineHeight: "1.5", margin: 0 }}>
                  ¿Estás seguro que deseas eliminar la misión "{temaAEliminar}" y TODOS sus objetos?
                </p>
              </div>

              <div className="educador-modal-actions">
                <button
                  className="educador-cancel-btn"
                  onClick={() => setTemaAEliminar(null)}
                >
                  Cancelar
                </button>

                <button
                  className="educador-delete-btn"
                  onClick={confirmarEliminar}
                >
                  Eliminar misión
                </button>
              </div>
            </section>
          </div>
        )}

        {modalNotificacion && (
          <div className="educador-modal-overlay">
            <section className="educador-modal educador-create-mission-modal">
              <div className="educador-modal-header">
                <h2>{modalNotificacion.titulo}</h2>
                <button
                  className="educador-modal-close"
                  onClick={() => setModalNotificacion(null)}
                >
                  ×
                </button>
              </div>

              <div className="educador-form-group" style={{ margin: "20px 0" }}>
                <p style={{ fontSize: "20px", fontWeight: "800", color: "#3b1f0f", lineHeight: "1.5", margin: 0 }}>
                  {modalNotificacion.mensaje}
                </p>
              </div>

              <div className="educador-modal-actions">
                <button
                  className="educador-save-btn"
                  onClick={() => setModalNotificacion(null)}
                >
                  Aceptar
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}