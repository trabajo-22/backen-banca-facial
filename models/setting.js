const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const settingSchema = Schema({
  try: {
    type: Number,
  },
  accept: {
    type: Boolean,
  },
  amount: {
    type: Number,
    required: [true, "Requiere monto diario"],
  },
  amount_out: {
    type: Number,
  },
  transfer: {
    type: Number,
  },
  months: {
    type: Number,
    required: [true, "Requiere meses de consulta"],
  },
  date: {
    type: Number,
  },
  user: {
    type: String,
    unique: true,
  },
});
settingSchema.methods.toJSON = function () {
  let setting = this;
  let settingObjeto = setting.toObject();
  return settingObjeto;
};

settingSchema.plugin(uniqueValidator, {
  message: "{PATH} existe en la base de datos, debe de ser unico",
});

module.exports = model("Setting", settingSchema);
