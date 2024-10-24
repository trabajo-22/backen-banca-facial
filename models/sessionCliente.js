const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");


const sesionClienteSchema = Schema({
  idcliente: {
    type: String,
  },
 
  token: {
    type: String,
  },

  idtelefono: {
    type: String,
  },
  
  modelotelefono: {
    type: String,
  },

  update: {
    type: Date,
  },

});


sesionClienteSchema.methods.toJSON = function () {
  let usuario = this;
  let usuariObjeto = usuario.toObject();
  return usuariObjeto;
};

sesionClienteSchema.plugin(uniqueValidator, {
  message: "{PATH} existe en la base de datos, debe de ser unico",
});

module.exports = model("Sessioncliente", sesionClienteSchema);
