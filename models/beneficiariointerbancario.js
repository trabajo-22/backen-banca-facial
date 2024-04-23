const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const beneficiariointerbancarioSchema = Schema({
  nombre: {
    type: String,
    required: [true, "Requiere el nombre"],
  },
  email: {
    type: String,
    required: [true, "El email es necesario"],
  },
  nick: {
    type: String,
    required: [true, "El apodo es necesario"],
  },
  identificacion: {
    type: String,
    required: [true, "La identificación es obligatoria"],
  },
  tipoIdentificacion: {
    type: String,
    required: [true, "El tipo de identificación es obligatorio"],
  },
  codigoConceptoTransferencia: {
    type: String,
    required: [true, "El concepto de transferencia es obligatorio"],
  },
  codigoTipoCuentaTransferencia: {
    type: String,
    required: [true, "La Tipo de cuenta es obligatorio"],
  },
  secuencialInstitucionTransferencia: {
    type: String,
    required: [true, "La institucion financiera es obligatoria"],
  },
  numeroCuentaBeneficiario: {
    type: String,
    required: [true, "El numero de cuenta del beneficiario es obligatoria"],
  },
  cliente: { type: String },
  creacion: { type: Date },
  estado: { type: Boolean },
});

beneficiariointerbancarioSchema.methods.toJSON = function () {
  let beneficiariointerbancario = this;
  let beneficiariointerbancarioObjeto = beneficiariointerbancario.toObject();
  return beneficiariointerbancarioObjeto;
};

beneficiariointerbancarioSchema.plugin(uniqueValidator, {
  message: "{PATH} existe en la base de datos, debe de ser u-nico",
});

module.exports = model(
  "beneficiariointerbancarionterno",
  beneficiariointerbancarioSchema
);
