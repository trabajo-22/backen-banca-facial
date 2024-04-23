const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const tipoprestamoSchema = Schema({
  codigo: {
    type: String,
    unique: true,
  },
  Nombre: {
    type: String,
  },
  estaActivo: {
    type: Number,
  },
  tipoTabla: {
    type: Array,
  },
  segmentoInterno: {
    type: Array,
  },
});
tipoprestamoSchema.methods.toJSON = function () {
  let tipoprestamo = this;
  let tipoprestamoObjeto = tipoprestamo.toObject();
  return tipoprestamoObjeto;
};

tipoprestamoSchema.plugin(uniqueValidator, {
  message: "{PATH} existe en la base de datos, debe de ser unico",
});

module.exports = model("Tipoprestamo", tipoprestamoSchema);
