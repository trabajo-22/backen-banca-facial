const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");


const preguntasseguridadSchema = Schema({
  pregunta: {
    type: String,
  },
  estado: {
    type: Boolean,
  },
  grupo: {
    type: Number,
  },
});



preguntasseguridadSchema.methods.toJSON = function () {
  let preguntasseguridad = this;
  let preguntasseguridadObjeto = preguntasseguridad.toObject();
  return preguntasseguridadObjeto;
};



preguntasseguridadSchema.plugin(uniqueValidator, {
  message: "{PATH} existe en la base de datos, debe de ser unico",
});

module.exports = model("Preguntasseguridad", preguntasseguridadSchema);
