const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const subcalificacioncontableSchema = Schema({
  codigo: {
    type: String,
    unique: true,
  },
  nombre: {
    type: String,
  },
});
subcalificacioncontableSchema.methods.toJSON = function () {
  let subcalificacioncontable = this;
  let subcalificacioncontableObjeto = subcalificacioncontable.toObject();
  return subcalificacioncontableObjeto;
};

subcalificacioncontableSchema.plugin(uniqueValidator, {
  message: "{PATH} existe en la base de datos, debe de ser unico",
});

module.exports = model(
  "Subcalificacioncontable",
  subcalificacioncontableSchema
);
