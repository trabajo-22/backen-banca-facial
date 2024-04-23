const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const beneficiarioiSchema = Schema({
  nombre: {
    type: String,
    required: [true, "Requiere el nombre"],
  },
  email: {
    type: String,
  },
  nick: {
    type: String,
    required: [true, "El NickName es necesario"],
  },
  estado: {
    type: Boolean,
    default: true,
  },
  identificacion: {
    type: String,
    required: [true, "La identificación es obligatoria"],
  },
  numerocliente: {
    type: String,
  },
  cliente: { type: String },
  update: {
    type: Date,
  },
});

beneficiarioiSchema.methods.toJSON = function () {
  let beneficiarioi = this;
  let beneficiarioiObjeto = beneficiarioi.toObject();
  return beneficiarioiObjeto;
};

beneficiarioiSchema.plugin(uniqueValidator, {
  message: "{PATH} existe en la base de datos, debe de ser unico",
});

module.exports = model("Beneficiariointerno", beneficiarioiSchema);
