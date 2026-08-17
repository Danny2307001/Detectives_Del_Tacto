const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://localhost/makeymakeydb');
  console.log('Conectado a MongoDB');
  
  const Schema = mongoose.Schema;
  const objetoSchema = new Schema({}, { strict: false });
  const Objeto = mongoose.model('Objeto', objetoSchema, 'objetos');
  
  const objects = await Objeto.find({});
  console.log(JSON.stringify(objects, null, 2));
  
  await mongoose.disconnect();
}

run().catch(console.error);
