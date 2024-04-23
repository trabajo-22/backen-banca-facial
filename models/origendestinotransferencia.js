const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const origendestinotransferenciaSchema = Schema({
  secuencial: {
    type: Number,
    unique: true,
  },
  detalle: {
    type: String,
  },
  esOrigen: {
    type: Number,
  },
  estaActivo: {
    type: Number,
  },
  numeroVerificador: {
    type: Number,
  },
});
origendestinotransferenciaSchema.methods.toJSON = function () {
  let origendestinotransferencia = this;
  let origendestinotransferenciaObjeto = origendestinotransferencia.toObject();
  return origendestinotransferenciaObjeto;
};

origendestinotransferenciaSchema.plugin(uniqueValidator, {
  message: "{PATH} existe en la base de datos, debe de ser unico",
});

module.exports = model(
  "Origendestinotransferencia",
  origendestinotransferenciaSchema
);
