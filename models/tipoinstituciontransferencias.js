const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const tipoinstituciontransferenciasSchema = Schema({
  codigo: {
    type: String,
    unique: true,
  },
  nombre: {
    type: String,
  },
  estaActivo: {
    type: String,
  },
  numeroVerificador: {
    type: String,
  },
});
tipoinstituciontransferenciasSchema.methods.toJSON = function () {
  let tipoinstituciontransferencias = this;
  let tipoinstituciontransferenciasObjeto = tipoinstituciontransferencias.toObject();
  return tipoinstituciontransferenciasObjeto;
};

tipoinstituciontransferenciasSchema.plugin(uniqueValidator, {
  message: "{PATH} existe en la base de datos, debe de ser unico",
});

module.exports = model(
  "Tipoinstituciontransferencias",
  tipoinstituciontransferenciasSchema
);
