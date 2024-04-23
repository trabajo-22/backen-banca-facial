const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const depositoSchema = Schema({
  secuencial: {
    type: String,
    unique: true,
  },
  NombreTipoDeposito: {
    type: String,
  },
  NombreEstadoDeposito: {
    type: String,
  },
  numerocliente: {
    type: String,
  },
});
depositoSchema.methods.toJSON = function () {
  let deposito = this;
  let depositoObjeto = deposito.toObject();
  return depositoObjeto;
};

depositoSchema.plugin(uniqueValidator, {
  message: "{PATH} existe en la base de datos, debe de ser unico",
});

module.exports = model("Deposito", depositoSchema);
