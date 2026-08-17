import React from "react";
import "./Educador.css";

export default function EducadorFormulario({
  nombre,
  setNombre,
  tecla,
  setTecla,
  descripcionMejorada,
  setDescripcionMejorada,
  textura,
  setTextura,
  forma,
  setForma,
  tamaño,
  setTamaño,
  material,
  setMaterial,
  sonido,
  setSonido,
  peso,
  setPeso,
  funcion,
  setFuncion,
  imagenPreview,
  manejarCambioImagen,
  editId,
  guardarObjeto,
  guardarEdicion,
  cerrarFormulario,
  teclasDisponibles = [],
  teclasMakeyMakey = [],
  teclaToObjeto = new Map(),
}) {
  async function guardarYCerrar() {
    if (editId) {
      await guardarEdicion();
    } else {
      await guardarObjeto();
    }

    cerrarFormulario();
  }

  return (
    <div className="educador-modal-overlay">
      <section className="educador-modal">
        <div className="educador-modal-header">
          <h2>{editId ? "Editar objeto" : "Crear nuevo objeto"}</h2>

          <button className="educador-modal-close" onClick={cerrarFormulario}>
            ×
          </button>
        </div>

        <div className="educador-form-grid">
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

              {teclasDisponibles.map((t) => (
                <option key={t} value={t}>
                  {t} disponible
                </option>
              ))}

              {editId && tecla && !teclasDisponibles.includes(tecla) && (
                <option key={tecla} value={tecla}>
                  {tecla} (actual)
                </option>
              )}
            </select>
          </div>

          <div className="educador-form-group educador-form-wide">
            <label>Descripción mejorada</label>
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
              <option value="Áspera (raspa al pasar los dedos)">Áspera</option>
              <option value="Suave (no raspa, se siente lisa)">Suave</option>
              <option value="Rugosa (tiene pequeñas irregularidades)">Rugosa</option>
              <option value="Lisa (completamente plana al tacto)">Lisa</option>
              <option value="Con relieve (tiene partes que sobresalen)">Con relieve</option>
              <option value="Con huecos (tiene agujeros o espacios)">Con huecos</option>
              <option value="Pegajosa (se adhiere un poco a los dedos)">Pegajosa</option>
              <option value="Resbalosa (los dedos se deslizan fácilmente)">Resbalosa</option>
            </select>
          </div>

          <div className="educador-form-group">
            <label>Forma</label>
            <select value={forma} onChange={(e) => setForma(e.target.value)}>
              <option value="">Selecciona la forma</option>
              <option value="Redonda (puedes rodearla sin esquinas)">Redonda</option>
              <option value="Alargada (más larga que ancha)">Alargada</option>
              <option value="Plana (muy delgada, como una hoja)">Plana</option>
              <option value="Con esquinas (tiene bordes marcados)">Con esquinas</option>
              <option value="Puntiaguda (termina en punta)">Puntiaguda</option>
              <option value="Cilíndrica (como un tubo o botella)">Cilíndrica</option>
              <option value="Irregular (no tiene forma clara)">Irregular</option>
            </select>
          </div>

          <div className="educador-form-group">
            <label>Tamaño</label>
            <select value={tamaño} onChange={(e) => setTamaño(e.target.value)}>
              <option value="">Selecciona el tamaño</option>
              <option value="Muy pequeño (solo con yemas de dedos)">Muy pequeño</option>
              <option value="Pequeño (cabe en una mano)">Pequeño</option>
              <option value="Mediano (usas ambas manos)">Mediano</option>
              <option value="Grande (no puedes abarcarlo completamente)">Grande</option>
              <option value="Muy grande (más grande que tu alcance)">Muy grande</option>
            </select>
          </div>

          <div className="educador-form-group">
            <label>Material</label>
            <select value={material} onChange={(e) => setMaterial(e.target.value)}>
              <option value="">Selecciona el material</option>
              <option value="Duro (no se deforma al presionar)">Duro</option>
              <option value="Blando (se hunde al presionar)">Blando</option>
              <option value="Flexible (puede doblarse)">Flexible</option>
              <option value="Rígido (no se dobla)">Rígido</option>
              <option value="Frío (como metal)">Frío</option>
              <option value="Tibio (no transmite frío)">Tibio</option>
              <option value="Natural (como madera)">Natural</option>
              <option value="Artificial (como plástico)">Artificial</option>
              <option value="Frágil (puede romperse fácil)">Frágil</option>
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

          <div className="educador-form-group educador-form-wide">
            <label>Función del objeto</label>
            <textarea
              placeholder="Ej: Se usa para cortar papel, guardar dinero, abrir puertas..."
              value={funcion}
              onChange={(e) => setFuncion(e.target.value)}
            />
          </div>
        </div>

        <div className="educador-modal-actions">
          <button className="educador-cancel-btn" onClick={cerrarFormulario}>
            Cancelar
          </button>

          <button className="educador-save-btn" onClick={guardarYCerrar}>
            {editId ? "Guardar cambios" : "Guardar objeto"}
          </button>
        </div>
      </section>
    </div>
  );
}