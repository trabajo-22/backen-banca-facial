const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const instituciontransferenciaSchema = Schema({
  codigo: {
    type: String,
    unique: true,
  },
  nombre: {
    type: String,
  },
  codigoTipoInstitucion: {
    type: String,
  },
  numeroCuentaBCE: {
    type: String,
  },
  estaActivo: {
    type: Number,
  },
  numeroVerificador: {
    type: Number,
  },
});
instituciontransferenciaSchema.methods.toJSON = function () {
  let instituciontransferencia = this;
  let instituciontransferenciaObjeto = instituciontransferencia.toObject();
  return instituciontransferenciaObjeto;
};

instituciontransferenciaSchema.plugin(uniqueValidator, {
  message: "{PATH} existe en la base de datos, debe de ser unico",
});

module.exports = model(
  "Instituciontransferencia",
  instituciontransferenciaSchema
);
