import React, { useState } from "react";
import EducadorFormulario from "./EducadorFormulario";
import "./Educador.css";

export default function EducadorMisionDetalle(props) {
  const {
    temaActual,
    setTemaActual,
    objetosFiltrados = [],
    iniciarEdicion,
    eliminarTodo,
    eliminarObjeto,
    editId,
    cancelarEdicion,
    modalNotificacion,
    setModalNotificacion,
  } = props;

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [objetoAEliminar, setObjetoAEliminar] = useState(null);
  const [confirmarEliminarTodo, setConfirmarEliminarTodo] = useState(false);

  function ejecutarEliminarObjeto() {
    if (!objetoAEliminar) return;
    eliminarObjeto(objetoAEliminar._id);
    setObjetoAEliminar(null);
  }

  function ejecutarEliminarTodo() {
    eliminarTodo();
    setConfirmarEliminarTodo(false);
  }

  function abrirNuevoObjeto() {
    cancelarEdicion();
    setMostrarFormulario(true);
  }

  function editarObjeto(obj) {
    iniciarEdicion(obj);
    setMostrarFormulario(true);
  }

  return (
    <div className="educador-page">
      <div className="educador-container">
        <button
          className="educador-back-btn"
          onClick={() => setTemaActual("")}
        >
          ← Volver a misiones
        </button>

        <header className="educador-header">
          <h1 className="educador-brand">Detectives del Tacto</h1>
          <h2 className="educador-title">Misión: {temaActual}</h2>
          <p className="educador-subtitle">
            Administra los objetos que pertenecen a esta misión.
          </p>
        </header>

        <section className="educador-card educador-detalle-card">
          <div className="educador-detalle-header">
            <div>
              <h2 className="educador-card-title">Objetos de la misión</h2>
              <p className="educador-counter">
                🕵️ {objetosFiltrados.length} objeto
                {objetosFiltrados.length === 1 ? "" : "s"} preparado
                {objetosFiltrados.length === 1 ? "" : "s"}
              </p>
            </div>

            <button className="educador-save-btn" onClick={abrirNuevoObjeto}>
              + Nuevo objeto
            </button>
          </div>

          {objetosFiltrados.length > 0 ? (
            <div className="educador-list educador-list-cards">
              {objetosFiltrados.map((o) => (
                <article
                  className="educador-item educador-object-card"
                  key={o._id || `${o.tecla}-${o.nombre}`}
                  style={{ position: 'relative' }}
                >
                  <div className="educador-item-header">
                    <div>
                      <span className="educador-item-key">{o.tecla}</span>
                      <h3 className="educador-item-name">{o.nombre}</h3>
                    </div>

                    <div className="educador-card-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        className="educador-edit-btn"
                        onClick={() => editarObjeto(o)}
                      >
                        Editar
                      </button>
                      <button
                        className="educador-delete-mision-btn"
                        style={{ position: 'relative', top: 'auto', right: 'auto', display: 'inline-flex', width: '38px', height: '38px', fontSize: '16px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setObjetoAEliminar(o);
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {o.imagen && (
                    <div className="educador-item-image">
                      <img src={o.imagen} alt={o.nombre} />
                    </div>
                  )}

                  <div className="educador-item-details">
                    <small>
                      {o.textura && `Textura: ${o.textura}`}
                      {o.forma && ` | Forma: ${o.forma}`}
                      {o.tamaño && ` | Tamaño: ${o.tamaño}`}
                      {o.material && ` | Material: ${o.material}`}
                      {o.sonido && ` | Sonido: ${o.sonido}`}
                      {o.peso && ` | Peso: ${o.peso}`}
                      {o.funcion && ` | Función: ${o.funcion}`}
                    </small>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="educador-empty-text">
              Aún no existen objetos preparados para esta misión.
            </p>
          )}

          <div className="educador-footer-actions">
            <button className="educador-delete-btn" onClick={() => setConfirmarEliminarTodo(true)}>
              Eliminar todos los objetos
            </button>
          </div>
        </section>

        {mostrarFormulario && (
          <EducadorFormulario
            {...props}
            editId={editId}
            cerrarFormulario={() => {
              cancelarEdicion();
              setMostrarFormulario(false);
            }}
          />
        )}

        {modalNotificacion && (
          <div className="educador-modal-overlay" style={{ zIndex: 10000 }}>
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

        {objetoAEliminar && (
          <div className="educador-modal-overlay" style={{ zIndex: 10000 }}>
            <section className="educador-modal educador-create-mission-modal">
              <div className="educador-modal-header">
                <h2>Confirmar eliminación</h2>
                <button
                  className="educador-modal-close"
                  onClick={() => setObjetoAEliminar(null)}
                >
                  ×
                </button>
              </div>

              <div className="educador-form-group" style={{ margin: "20px 0" }}>
                <p style={{ fontSize: "20px", fontWeight: "800", color: "#3b1f0f", lineHeight: "1.5", margin: 0 }}>
                  ¿Estás seguro que deseas eliminar el objeto "{objetoAEliminar.nombre}"?
                </p>
              </div>

              <div className="educador-modal-actions">
                <button
                  className="educador-cancel-btn"
                  onClick={() => setObjetoAEliminar(null)}
                >
                  Cancelar
                </button>
                <button
                  className="educador-delete-btn"
                  onClick={ejecutarEliminarObjeto}
                >
                  Eliminar objeto
                </button>
              </div>
            </section>
          </div>
        )}

        {confirmarEliminarTodo && (
          <div className="educador-modal-overlay" style={{ zIndex: 10000 }}>
            <section className="educador-modal educador-create-mission-modal">
              <div className="educador-modal-header">
                <h2>Confirmar eliminación</h2>
                <button
                  className="educador-modal-close"
                  onClick={() => setConfirmarEliminarTodo(false)}
                >
                  ×
                </button>
              </div>

              <div className="educador-form-group" style={{ margin: "20px 0" }}>
                <p style={{ fontSize: "20px", fontWeight: "800", color: "#3b1f0f", lineHeight: "1.5", margin: 0 }}>
                  ¿Estás seguro que deseas eliminar TODOS los objetos de la misión "{temaActual}"?
                </p>
              </div>

              <div className="educador-modal-actions">
                <button
                  className="educador-cancel-btn"
                  onClick={() => setConfirmarEliminarTodo(false)}
                >
                  Cancelar
                </button>
                <button
                  className="educador-delete-btn"
                  onClick={ejecutarEliminarTodo}
                >
                  Eliminar todos
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}