const { validationResult } = require("express-validator");
const Usuario = require("../models/user");

const validateFields = (req, res = response, next) => {
  const errors = validationResult(req);
  /*console.log({
    msg: "middle validateFields",
    limpio: errors.isEmpty(),
  });*/
  if (!errors.isEmpty()) {
    return res.status(400).json(errors);
  }
  next();
};

const existsCedula = async (req, res = response, next) => {
  const { cedula } = req.body;
  const user = await Usuario.findOne({ identificacion: cedula });
  params(
    req,
    res,
    next,
    "existsCedula",
    user,
    "U000.0",
    cedula,
    "numero de identificación ya registrada"
  );
};

const existsCuenta = async (req, res = response, next) => {
  const { cuenta } = req.body;
  const user = await Usuario.findOne({ numerocliente: cuenta });
  params(
    req,
    res,
    next,
    "existsCuenta",
    user,
    "U000.1",
    cuenta,
    "numero de cliente ya registrado"
  );
};

const existsNick = async (req, res = response, next) => {
  const { nick } = req.body;
  const user = await Usuario.findOne({ nick });
  params(
    req,
    res,
    next,
    "existsNick",
    user,
    "U000.2",
    nick,
    "Apodo ya registrado"
  );
};

const params = (req, res, next, title, user, code, param, message) => {
  //console.log({
  //  msg: "----> middle " + title,
  //  param,
  //});
  if (user) {
    return res.status(400).json({
      ok: false,
      code,
      message,
    });
  }
  //console.log({ msg: "<----| next middle " });
  next();
};

const UserStatus = async (req, res = response, next) => {
  const { estado } = req.uid;
  if (!estado) {
    return res.status(401).json({
      ok: false,
      message: "Token no valido",
    });
  }
  next();
};

const isRoleAdmin = async (req, res = response, next) => {
  const { role } = req.uid;
  if (role != "Role_Admin") {
    return res.status(401).json({
      ok: false,
      message: "Error en la capa de datos",
    });
  }
  next();
};

const isRoleValido = (req, res = response, next) => {
  const { role } = req.uid;
  if (role != "Role_Admin") {
    if (role != "Role_User") {
      return res.status(401).json({
        ok: false,
        message: "Error en la capa de datos cod RNA",
      });
    }
  }
  next();
};

const isCheckerTrue = async (req, res = response, next) => {
  const { check } = req.uid;
  console.log(check);
  if (check == "true") {
    next();
  } else {
    return res.status(401).json({
      ok: false,
      message: "Error autorización seguno factor",
    });
  }
};

module.exports = {
  validateFields,
  existsCedula,
  existsCuenta,
  existsNick,
  UserStatus,
  isRoleAdmin,
  isRoleValido,
  isCheckerTrue,
};
