const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");


const tablalistaSchema = new Schema({
  nombre: {
    type: String,
  }
              
});


const preguntaSchema = new Schema({

  titulo: { 
    type: String
  }, 

  pregunta: { 
    type: String
  }, 

  lista: [tablalistaSchema] ,

  estado: { 
    type: Boolean, 
    default: true 
  },   

  grupo: { 
    type: Number
  }     
});




const tablaPSchema = new Schema({
  idusuario: {
    type: String,
  },  
  listpregunta: [ preguntaSchema ]              
});



tablaPSchema.methods.toJSON = function () {
  let preguntaqsabe = this;
  let preguntaqsabeObjeto = preguntaqsabe.toObject();
  return preguntaqsabeObjeto;
};



tablaPSchema.plugin(uniqueValidator, {
  message: "{PATH} existe en la base de datos, debe de ser unico",
});

module.exports = model("Preguntaqsabe", tablaPSchema);
