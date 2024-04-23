const { json } = require("body-parser");
const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const comprobanteSchema = Schema({
  nombre: {
    type: String,
  },
  interna: {
    type: Number,
  },
  monto: {
    type: Number,
  },
  codigoTransaccion: {
    type: String,
  },
  codigoComision: {
    type: String,
  },
  detalle: { type: String },
  fecha: {
    type: Date,
  },
  beneficiario: {
    type: String,
  },
  cliente: {
    type: String,
  },
});

comprobanteSchema.methods.toJSON = function () {
  let comprobante = this;
  let comprobanteObjeto = comprobante.toObject();
  return comprobanteObjeto;
};

comprobanteSchema.plugin(uniqueValidator, {
  message: "{PATH} existe en la base de datos, debe de ser unico",
});

module.exports = model("Comprobante", comprobanteSchema);
