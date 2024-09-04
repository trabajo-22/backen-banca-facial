const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const cuentaSchema = Schema({
  Secuencial: {
    type: String,
  },
  codigo: {
    type: String,
  },
  NombreTipoCuenta: {
    type: String,
  },
  NombreEstado: {
    type: String,
  },
  numerocliente: {
    type: String,
  },
});

cuentaSchema.methods.toJSON = function () {
  let cuenta = this;
  let cuentaObjeto = cuenta.toObject();
  return cuentaObjeto;
};

cuentaSchema.plugin(uniqueValidator, {
  message: "{PATH} existe en la base de datos, debe de ser unico",
});

module.exports = model("Cuenta", cuentaSchema);
