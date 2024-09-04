const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const { string } = require("request-ip/lib/is");

const solicitudotpSchema = Schema({
  identificacion: {
    type: String,
  },
  tokens: {
    type: String,
  },
  esvalidado: {
    type: Boolean,
  },
  
  transaccion:{
    type: String
  }

});
solicitudotpSchema.methods.toJSON = function () {
  let solicitudotp = this;
  let solicitudotpObjeto = solicitudotp.toObject();
  return solicitudotpObjeto;
};

solicitudotpSchema.plugin(uniqueValidator, {
  message: "{PATH} existe en la base de datos, debe de ser unico",
});

module.exports = model("Solicitudotp", solicitudotpSchema);
