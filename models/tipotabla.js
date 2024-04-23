const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const tipotablaSchema = Schema({
  secuencial: {
    type: String,
    unique: true,
  },
  codigoGeneracionVencimientoCuota: {
    type: String,
  },
  estaActivo: {
    type: String,
  },
  esConAlicuota: {
    type: String,
  },
  nombre: {
    type: String,
  },
});
tipotablaSchema.methods.toJSON = function () {
  let tipotabla = this;
  let tipotablaObjeto = tipotabla.toObject();
  return tipotablaObjeto;
};

tipotablaSchema.plugin(uniqueValidator, {
  message: "{PATH} existe en la base de datos, debe de ser unico",
});

module.exports = model("Tipotabla", tipotablaSchema);
