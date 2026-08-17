import React from "react";
import { useNavigate } from "react-router-dom";
import "./Educador.css";

export default function EducadorVista({
  objetos = [],
  objetosFiltrados = [],
  nombre = "",
  setNombre,
  tecla = "",
  setTecla,
  descripcionMejorada = "",
  setDescripcionMejorada,
  descripcionAutomatica = "",
  textura = "",
  setTextura,
  forma = "",
  setForma,
  tamaño = "",
  setTamaño,
  material = "",
  setMaterial,
  sonido = "",
  setSonido,
  peso = "",
  setPeso,
  funcion = "",
  setFuncion,
  imagenPreview = "",
  manejarCambioImagen,
  editId = null,
  guardarObjeto,
  eliminarTodo,
  iniciarEdicion,
  guardarEdicion,
  cancelarEdicion,
  teclasDisponibles = [],
  teclasMakeyMakey = [],
  teclaToObjeto = new Map(),
  temaActual = "",
  setTemaActual,
  nuevoTema = "",
  setNuevoTema,
  crearTema,
  temas = [],
}) {
  const navigate = useNavigate();

  return (
    <div className="educador-page">
      <div className="educador-container">
        <div className="educador-topbar">
          <button className="educador-back-btn" onClick={() => navigate("/")}>
            ← Regresar
          </button>
        </div>

        <div className="educador-header">
          <h1 className="educador-title">Detectives del Tacto</h1>
          <h2 className="educador-brand">Centro de Misiones</h2>
          <p className="educador-subtitle">
            Crea pistas, registra objetos y prepara las misiones del juego.
          </p>
        </div>

        <section className="educador-card educador-misiones-card">

  <div className="educador-misiones-header">

    <h2 className="educador-misiones-title">
      Temas de misión
    </h2>

    <div className="educador-nueva-mision">

      <input
        type="text"
        placeholder="Nueva misión"
        value={nuevoTema}
        onChange={(e) => setNuevoTema(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            crearTema();
          }
        }}
      />

      <button
        className="educador-add-mision-btn"
        onClick={crearTema}
      >
        ➕ Crear
      </button>

    </div>
  </div>

  <div className="educador-temas-grid">

    {temas.map((tema) => {

      const cantidad = objetos.filter(
        (o) => o.tema && o.tema.toLowerCase() === tema.toLowerCase()
      ).length;

      return (
        <button
          key={tema}
          className={`educador-tema-card ${
            temaActual && temaActual.toLowerCase() === tema.toLowerCase() ? "activa" : ""
          }`}
          onClick={() => setTemaActual(tema)}
        >

          <span className="educador-tema-icono">
            🔎
          </span>

          <span className="educador-tema-nombre">
            {tema}
          </span>

          <span className="educador-tema-contador">
            {cantidad} objetos
          </span>

        </button>
      );
    })}

  </div>

</section>

        <div className="educador-grid">
          <section className="educador-card">
            <h3 className="educador-card-title">Crear nueva pista</h3>

            <div className="educador-form-group">
              <label>Nombre del objeto</label>
              <input
                type="text"
                placeholder="Ej: Moneda"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div className="educador-form-group">
              <label>Tecla Makey Makey</label>
              <select value={tecla} onChange={(e) => setTecla(e.target.value)}>
                <option value="">Selecciona tecla Makey Makey</option>

                {(teclasDisponibles || []).map((t) => (
                  <option key={t} value={t}>
                    {t} disponible
                  </option>
                ))}

                {(teclasMakeyMakey || [])
                  .filter((t) => !(teclasDisponibles || []).includes(t))
                  .map((t) => {
                    const o = teclaToObjeto?.get ? teclaToObjeto.get(t) : null;
                    return (
                      <option key={t} value={t} disabled>
                        {t} ocupada por {o?.nombre || "otro objeto"}
                      </option>
                    );
                  })}
              </select>
            </div>

            <div className="educador-form-group">
              <label>✍️ Descripción mejorada</label>
              <textarea
                placeholder="Ej: Toma el objeto con una mano. Explora su superficie..."
                value={descripcionMejorada}
                onChange={(e) => setDescripcionMejorada(e.target.value)}
              />
            </div>

            <div className="educador-form-group">
              <label>Textura</label>
              <select value={textura} onChange={(e) => setTextura(e.target.value)}>
                <option value="">Selecciona la textura</option>
                <option value="Áspera (raspa al pasar los dedos)">Áspera (raspa al pasar los dedos)</option>
                <option value="Suave (no raspa, se siente lisa)">Suave (no raspa, se siente lisa)</option>
                <option value="Rugosa (tiene pequeñas irregularidades)">Rugosa (tiene pequeñas irregularidades)</option>
                <option value="Lisa (completamente plana al tacto)">Lisa (completamente plana al tacto)</option>
                <option value="Con relieve (tiene partes que sobresalen)">Con relieve (tiene partes que sobresalen)</option>
                <option value="Con huecos (tiene agujeros o espacios)">Con huecos (tiene agujeros o espacios)</option>
                <option value="Pegajosa (se adhiere un poco a los dedos)">Pegajosa (se adhiere un poco a los dedos)</option>
                <option value="Resbalosa (los dedos se deslizan fácilmente)">Resbalosa (los dedos se deslizan fácilmente)</option>
              </select>
            </div>

            <div className="educador-form-group">
              <label>Forma</label>
              <select value={forma} onChange={(e) => setForma(e.target.value)}>
                <option value="">Selecciona la forma</option>
                <option value="Redonda (puedes rodearla sin esquinas)">Redonda (puedes rodearla sin esquinas)</option>
                <option value="Alargada (más larga que ancha)">Alargada (más larga que ancha)</option>
                <option value="Plana (muy delgada, como una hoja)">Plana (muy delgada, como una hoja)</option>
                <option value="Con esquinas (tiene bordes marcados)">Con esquinas (tiene bordes marcados)</option>
                <option value="Puntiaguda (termina en punta)">Puntiaguda (termina en punta)</option>
                <option value="Cilíndrica (como un tubo o botella)">Cilíndrica (como un tubo o botella)</option>
                <option value="Irregular (no tiene forma clara)">Irregular (no tiene forma clara)</option>
              </select>
            </div>

            <div className="educador-form-group">
              <label>Tamaño</label>
              <select value={tamaño} onChange={(e) => setTamaño(e.target.value)}>
                <option value="">Selecciona el tamaño</option>
                <option value="Muy pequeño (solo con yemas de dedos)">Muy pequeño (solo con yemas de dedos)</option>
                <option value="Pequeño (cabe en una mano)">Pequeño (cabe en una mano)</option>
                <option value="Mediano (usas ambas manos)">Mediano (usas ambas manos)</option>
                <option value="Grande (no puedes abarcarlo completamente)">Grande (no puedes abarcarlo completamente)</option>
                <option value="Muy grande (más grande que tu alcance)">Muy grande (más grande que tu alcance)</option>
              </select>
            </div>

            <div className="educador-form-group">
              <label>Material</label>
              <select value={material} onChange={(e) => setMaterial(e.target.value)}>
                <option value="">Selecciona el material</option>
                <option value="Duro (no se deforma al presionar)">Duro (no se deforma al presionar)</option>
                <option value="Blando (se hunde al presionar)">Blando (se hunde al presionar)</option>
                <option value="Flexible (puede doblarse)">Flexible (puede doblarse)</option>
                <option value="Rígido (no se dobla)">Rígido (no se dobla)</option>
                <option value="Frío (como metal)">Frío (como metal)</option>
                <option value="Tibio (no transmite frío)">Tibio (no transmite frío)</option>
                <option value="Natural (como madera)">Natural (como madera)</option>
                <option value="Artificial (como plástico)">Artificial (como plástico)</option>
                <option value="Frágil (puede romperse fácil)">Frágil (puede romperse fácil)</option>
              </select>
            </div>

            <div className="educador-form-group">
              <label>Sonido</label>
              <select value={sonido} onChange={(e) => setSonido(e.target.value)}>
                <option value="">Selecciona el sonido</option>
                <option value="Suena hueco">Suena hueco</option>
                <option value="No hace sonido">No hace sonido</option>
                <option value="Suena metálico">Suena metálico</option>
                <option value="Suena opaco">Suena opaco</option>
              </select>
            </div>

            <div className="educador-form-group">
              <label>Peso</label>
              <select value={peso} onChange={(e) => setPeso(e.target.value)}>
                <option value="">Selecciona el peso</option>
                <option value="Ligero">Ligero</option>
                <option value="Pesado">Pesado</option>
              </select>
            </div>

            <div className="educador-form-group">
              <label>Imagen del objeto</label>
              <input type="file" accept="image/*" onChange={manejarCambioImagen} />
              {imagenPreview && (
                <div className="educador-image-preview">
                  <img src={imagenPreview} alt="Vista previa" />
                </div>
              )}
            </div>

            <div className="educador-form-group">
              <label>Función del objeto</label>
              <textarea
                placeholder="Ej: Se usa para cortar papel, guardar dinero, abrir puertas..."
                value={funcion}
                onChange={(e) => setFuncion(e.target.value)}
              />
            </div>

            <div className="educador-actions">
              {editId ? (
                <>
                  <button className="educador-save-btn" onClick={guardarEdicion}>
                    Guardar cambios
                  </button>
                  <button className="educador-cancel-btn" onClick={cancelarEdicion}>
                    Cancelar
                  </button>
                </>
              ) : (
                <button className="educador-save-btn" onClick={guardarObjeto}>
                  Guardar pista
                </button>
              )}
            </div>
          </section>

          <section className="educador-card">
            <h3 className="educador-card-title">Objetos de la misión</h3>

            <p className="educador-counter">
              🕵️ {objetosFiltrados.length} objeto{objetosFiltrados.length === 1 ? "" : "s"} preparado
              {objetosFiltrados.length === 1 ? "" : "s"}
            </p>

            {objetosFiltrados.length > 0 ? (
              <div className="educador-list">
                {objetosFiltrados.map((o) => (
                  <div className="educador-item" key={o._id || `${o.tecla}-${o.nombre}`}>
                    <div className="educador-item-header">
                      <div className="educador-item-info">
                        <span className="educador-item-key">{o.tecla}</span>
                        <span className="educador-item-separator">—</span>
                        <span className="educador-item-name">{o.nombre}</span>
                      </div>

                      <button className="educador-edit-btn" onClick={() => iniciarEdicion(o)}>
                        Editar
                      </button>
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
                  </div>
                ))}
              </div>
            ) : (
              <p className="educador-empty-text">
                Aún no existen objetos preparados para la misión.
              </p>
            )}

            <div className="educador-footer-actions">
              <button className="educador-delete-btn" onClick={eliminarTodo}>
                Eliminar todo
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}