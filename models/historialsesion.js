const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const historialsesionSchema = Schema({
  fecha: {
    type: String,
  },
  ip: {
    type: String,
  },
  dispositivo: {
    type: String,
  },
  identificacion: {
    type: String,
  },
});

historialsesionSchema.methods.toJSON = function () {
  let historialsesion = this;
  let historialsesionObjeto = historialsesion.toObject();
  return historialsesionObjeto;
};

historialsesionSchema.plugin(uniqueValidator, {
  message: "{PATH} existe en la base de datos, debe de ser unico",
});

module.exports = model("Historialsesion", historialsesionSchema);
