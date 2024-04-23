const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const segmentointernoSchema = Schema({
  secuencial: {
    type: String,
    unique: true,
  },
  nombre: {
    type: String,
  },
  subCalificacion: {
    type: Array,
  },
});
segmentointernoSchema.methods.toJSON = function () {
  let segmentointerno = this;
  let segmentointernoObjeto = segmentointerno.toObject();
  return segmentointernoObjeto;
};

segmentointernoSchema.plugin(uniqueValidator, {
  message: "{PATH} existe en la base de datos, debe de ser unico",
});

module.exports = model("Segmentointerno", segmentointernoSchema);
