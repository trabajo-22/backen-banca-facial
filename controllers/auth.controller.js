const { response, request } = require("express");
const bcrypt = require("bcrypt");
const Usuario = require("../models/user");
const { generarJWT } = require("../helpers/generarjwt");
const Setting = require("../models/setting");
const e = require("express");
//const { config } = require("dotenv/types");
const { verificarSiEsSocio } = require("./users.controller");
const { check } = require("express-validator");

const tt = process.env.TOKENTIME;


const loginv2 = async (req, res) => {
  const { nick, password } = req.body;
  try {
    var usuario = await Usuario.findOne({ nick });
    if (!usuario) {
      return res.status(400).json({ "error": "Usuario o contraseña incorrectos", });
    }
    if (!usuario.estado) {
      return res.status(400).json({ "error": "Usuario bloqueado" });
    }
    var conf = await Setting.findOne({ user: usuario._id });
    if (!bcrypt.compareSync(password, usuario.password)) {
      conf.try = conf.try + 1;
      console.log("Error " + conf.try + " en login, usuario " + usuario.numerocliente);
      if (conf.try >= 3) {
        usuario.estado = false;
        usuario.save();
        console.log("Bloqueo de usuario " + usuario.numerocliente + " por intentos de acceso fallidos");
      }
      conf.save();
      return res.status(400).json({"error": "Usuario o contraseña incorrectos" });
    } else {
      var dia = new Date();
      conf.try = 0;
      conf.date = dia.getDate();
      conf.amount_out = 0;
      conf.transfer = 0;
      conf.save();

      const { _id, nombre, img, oficina, role, numerocliente, identificacion, check } = usuario;
      let esSocio = await verificarSiEsSocio(identificacion);
      const token = await generarJWT(_id, false, identificacion);
      res.json({
        token: token,
        user: {
          nombre,
          nick: usuario.nick,
          img,
          oficina,
          role,
          cedula: identificacion,
          essocio: esSocio,
          check
        },
      });
    }
  } catch (error) {
    console.log(error)
    return res.status(400).json({ "error": error });
  }
}

/******Login*******/
const login = async (req, res) => {
  const { nick, password } = req.body;
  try {
    usuario = await Usuario.findOne({ nick });
    if (!usuario) {
      return res.status(401).json({
        ok: false,
        er: {
          code: "L001",
          message: "Usuario o contraseña incorrectos",
        },
      });
    }
    if (!usuario.estado) {
      return res.status(401).json({
        ok: false,
        msg: "Usuario bloqueado",
      });
    }
    conf = await Setting.findOne({ user: usuario._id });
    if (!bcrypt.compareSync(password, usuario.password)) {
      conf.try = conf.try + 1;
      console.log(
        "Error " + conf.try + " en login, usuario " + usuario.numerocliente
      );
      if (conf.try >= 3) {
        usuario.estado = false;
        usuario.save();
        console.log(
          "Bloqueo de usuario " +
          usuario.numerocliente +
          " por intentos de acceso fallidos"
        );
      }
      conf.save();
      return res.status(401).json({
        ok: false,
        er: {
          code: "L002",
          message: "Usuario o contraseña incorrectos",
        },
      });
    }
    var dia = new Date();
    if (conf.date != dia.getDate()) {
      conf.try = 0;
      conf.date = dia.getDate();
      conf.amount_out = 0;
      conf.transfer = 0;
    }
    conf.save();
    const { _id, nombre, img, oficina, role, numerocliente, identificacion } = usuario;
    const token = await generarJWT(_id, false, numerocliente);
    res.json({
      ok: true,
      token: token,
      user: {
        nombre,
        nick: usuario.nick,
        img,
        oficina,
        role,
        cedula: identificacion
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "comunicar al administrador del sistema",
      error,
    });
  }
};

/******SetearUsuariosDiario *******/
const setUsers = async (req, res) => {
  const { uid } = req;
  if (uid.role == "Role_Admin") {
    var dia = new Date();
    //enzerar los intentos
    await Setting.find("try" != 0, (er, config) => {
      array.forEach((configs) => {
        if (config.Date != dia.getDate()) {
          config.try = 0;
        }
        //desbloquear usuario
        if (configs.try > 2) {
          _id = configs.user;
          usuario = Usuario.findOne({ _id });
          usuario.estado = true;
          usuario.save();
        }
        config.save();
      });
    });
    await Setting.find("try" != 0, (er, config) => {
      array.forEach((configs) => {
        if (config.Date != dia.getDate()) {
          config.try = 0;
        }
        //desbloquear usuario
        if (configs.try > 2) {
          _id = configs.user;
          usuario = Usuario.findOne({ _id });
          usuario.estado = true;
          usuario.save();
        }
        config.save();
      });
    });
  }
};

/********Check Token********/
const checker = async (req, res) => {
  const { checker } = req.body;
  const { uid } = req;
  const find = uid._id;
  let msg = "EMPTY";
  await Usuario.findOne(find, (er, usuarioBD) => {
    if (er) {
      return res.status(500).json({
        ok: false,
        er,
      });
    }
    if (!usuarioBD) {
      return res.status(200).json({
        ok: false,
        er: {
          code: "U000",
          message: "Usuario invalido",
        },
      });
    }
    let timeNow = new Date();
    let timeToken = new Date(usuarioBD.Date);
    let timeTras = new Date((timeNow.getTime() - timeToken.getTime()) / 60000);
    //Tiempo transcurrido >a tt 10 minutos
    if (timeTras.getTime() > tt) {
      return res.status(200).json({
        ok: false,
        er: {
          code: "T000",
          message: "Comprobante caducado",
        },
      });
    }
    if (!bcrypt.compareSync(checker, usuarioBD.check)) {
      console.log("valida " + timeNow + find);
      return res.status(200).json({
        ok: false,
        er: {
          code: "T001",
          message: "Comprobante invalido",
        },
      });
    }
    usuarioBD.check = true;
    usuarioBD.Date = null;
    usuarioBD.save();
    if (usuarioBD.password == "") msg = "Asignar password;";
    else msg = "Código correcto";
  });
  return res.json({
    ok: true,
    message: msg,
  });
};

/********ReNew Token********/
const renewtoken = async (req, res) => {
  const { _id, nombre, nick, img, role } = req.uid;
  const token = await generarJWT(_id);
  res.json({
    ok: true,
    token: token,
    user: {
      nombre: nombre,
      nick: nick,
      img: img,
      role: role,
    },
  });
};


/********ReNew Token********/
const renewtokenv2 = async (req, res) => {
  const identificacion = req.user;
  const _id = req.iduser;
  const token = await generarJWT(_id, false, identificacion);
  res.json({
    ok: true,
    token: token
  });
};

const tokenValida = async (req = request, res = response) => {
  res.json({ ok: true });
};


module.exports = {
  login,
  checker,
  renewtoken,
  renewtokenv2,
  tokenValida,
  loginv2
};
