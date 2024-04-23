const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const tipocuentatransferenciaSchema = Schema({
  codigo: {
    type: String,
    unique: true,
  },
  nombre: {
    type: String,
  },
  estaActivo: {
    type: Number,
  },
  numeroVerificador: {
    type: Number,
  },
});
tipocuentatransferenciaSchema.methods.toJSON = function () {
  let tipocuentatransferencia = this;
  let tipocuentatransferenciaObjeto = tipocuentatransferencia.toObject();
  return tipocuentatransferenciaObjeto;
};

tipocuentatransferenciaSchema.plugin(uniqueValidator, {
  message: "{PATH} existe en la base de datos, debe de ser unico",
});

module.exports = model(
  "Tipocuentatransferencia",
  tipocuentatransferenciaSchema
);
