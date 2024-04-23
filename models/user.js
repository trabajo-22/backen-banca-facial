const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const rolesValidos = {
  values: ["ADMIN_ROLE", "USER_ROLE"],
  message: "{VALUE} no es un valor permitido",
};

const usuarioSchema = Schema({
  nombre: {
    type: String,
    required: [true, "Requiere el nombre"],
  },
  email: {
    type: String,
    unique: true,
  },
  nick: {
    type: String,
    required: [true, "El NickName es necesario"],
    unique: true,
  },
  password: {
    type: String,
  },
  img: {
    type: String,
  },
  constitucion: {
    type: Date,
  },
  estado: {
    type: Boolean,
    default: true,
  },
  identificacion: {
    type: String,
    required: [true, "La identificación es obligatoria"],
    unique: true,
  },
  oficina: {
    type: String,
  },
  Tidentificacion: {
    type: String,
  },
  numerocliente: {
    type: String,
  },
  comprobante: {
    type: String,
  },
  role: {
    type: String,
  },
  check: {
    type: String,
  },
  Date: {
    type: Date,
  },
  add: {
    type: Date,
  },
  update: {
    type: Date,
  },
});

usuarioSchema.methods.toJSON = function () {
  let usuario = this;
  let usuariObjeto = usuario.toObject();
  delete usuariObjeto.password;
  return usuariObjeto;
};

usuarioSchema.plugin(uniqueValidator, {
  message: "{PATH} existe en la base de datos, debe de ser unico",
});

module.exports = model("Usuario", usuarioSchema);
