const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const datoSchema = Schema({
  dato: {
    type: String,
  },
  fecha: {
    type: Date,
  },
  cliente: {
    type: String,
  },
});
datoSchema.methods.toJSON = function () {
  let dato = this;
  let datoObjeto = dato.toObject();
  return datoObjeto;
};

datoSchema.plugin(uniqueValidator, {
  message: "{PATH} existe en la base de datos, debe de ser unico",
});

module.exports = model("Dato", datoSchema);
