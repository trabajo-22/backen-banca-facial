const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const prestamoSchema = Schema({
  secuencial: {
    type: String,
    unique: true,
  },
  NombreTipoPrestamo: {
    type: String,
  },
  NombreEstadoPrestamo: {
    type: String,
  },
  numerocliente: {
    type: String,
  },
});
prestamoSchema.methods.toJSON = function () {
  let prestamo = this;
  let prestamoObjeto = prestamo.toObject();
  returnprestamoObjeto;
};

prestamoSchema.plugin(uniqueValidator, {
  message: "{PATH} existe en la base de datos, debe de ser unico",
});

module.exports = model("Prestamo", prestamoSchema);
