// backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Conectar a MongoDB
mongoose.connect('mongodb://localhost/makeymakeydb')
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.log('Error al conectar a MongoDB:', err));

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Esquema para objetos
const objetoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  tecla: { type: String, required: true },
  tema: { type: String },
  descripcion: { type: String },
  descripcionAutomatica: { type: String },
  textura: { type: String },
  forma: { type: String },
  tamaño: { type: String },
  material: { type: String },
  peso: { type: String },
  sonido: { type: String },
  funcion: { type: String },
  imagen: { type: String },
});

const Objeto = mongoose.model('Objeto', objetoSchema);

// Rutas
app.get('/objetos', async (req, res) => {
  const objetos = await Objeto.find();
  res.json(objetos);
});

// Ruta para guardar un objeto
app.post('/guardar_objeto', async (req, res) => {
  const { nombre, tecla, tema, descripcion, descripcionAutomatica, textura, forma, tamaño, material, peso, sonido, funcion, imagen } = req.body;

  // Verificar que los campos obligatorios están presentes
  if (!nombre || !tecla) {
    return res.status(400).send("Faltan campos obligatorios: nombre y tecla.");
  }


  // Crear el objeto para la base de datos
  const nuevoObjeto = new Objeto({
    nombre,
    tecla,
    tema,
    descripcion,
    descripcionAutomatica,
    textura,
    forma,
    tamaño,
    material,
    peso,
    sonido,
    funcion,
    imagen
  });

  try {
    // Intentar guardar el objeto en MongoDB
    await nuevoObjeto.save();
    console.log('Objeto guardado correctamente');
    res.status(201).send("Objeto registrado correctamente");
  } catch (error) {
    // Si hay un error, mostrarlo
    console.log("Error al guardar el objeto:", error);
    res.status(500).send("Error al guardar el objeto");
  }
});

//Ruta para eliminar todos los objetos 
// Eliminar todos los objetos
app.delete("/objetos", async (req, res) => {
  try {
    await Objeto.deleteMany({});
    res.json({ mensaje: "Todos los objetos fueron eliminados" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar objetos" });
  }
});

app.delete("/objetos/:id", async (req, res) => {
  try {
    const eliminado = await Objeto.findByIdAndDelete(req.params.id);

    if (!eliminado) {
      return res.status(404).json({ error: "Objeto no encontrado" });
    }

    res.json({ mensaje: "Objeto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar objeto" });
  }
});

// Eliminar todos los objetos de un tema (misión) específico
app.delete("/objetos/tema/:tema", async (req, res) => {
  try {
    const tema = req.params.tema;
    const escapedTema = tema.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    await Objeto.deleteMany({ tema: { $regex: new RegExp(`^${escapedTema}$`, 'i') } });
    res.json({ mensaje: `Todos los objetos del tema ${tema} fueron eliminados` });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar objetos del tema" });
  }
});

// Actualizar objeto (solo nombre y descripcion)
app.put("/objetos/:id", async (req, res) => {
  try {
    const { nombre, tema, descripcion, descripcionAutomatica, textura, forma, tamaño, material, peso, sonido, funcion, imagen } = req.body;

    const actualizado = await Objeto.findByIdAndUpdate(
      req.params.id,
      { nombre, tema, descripcion, descripcionAutomatica, textura, forma, tamaño, material, peso, sonido, funcion, imagen },
      { new: true }
    );

    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar objeto" });
  }
});


// Iniciar servidor para mi
/*app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});*/

//INICIAR SERVIDOR PARA OTROS EN MI MISMA RED
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
