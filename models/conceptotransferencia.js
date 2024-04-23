const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const conceptotransferenciaSchema = Schema({
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
conceptotransferenciaSchema.methods.toJSON = function () {
  let conceptotransferencia = this;
  let conceptotransferenciaObjeto = conceptotransferencia.toObject();
  return conceptotransferenciaObjeto;
};

conceptotransferenciaSchema.plugin(uniqueValidator, {
  message: "{PATH} existe en la base de datos, debe de ser unico",
});

module.exports = model("Conceptotransferencia", conceptotransferenciaSchema);
