const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const tipodepositoSchema = Schema({
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
});
tipodepositoSchema.methods.toJSON = function () {
  let tipodeposito = this;
  let tipodepositoObjeto = tipodeposito.toObject();
  return tipodepositoObjeto;
};

tipodepositoSchema.plugin(uniqueValidator, {
  message: "{PATH} existe en la base de datos, debe de ser unico",
});

module.exports = model("Tipodeposito", tipodepositoSchema);
