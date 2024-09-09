const bcrypt = require("bcrypt");
const Usuario = require("../models/user");
const { generarJWT } = require("../helpers/generarjwt");
const Setting = require("../models/setting");
const { verificarSiEsSocio } = require("../models/user.sql");

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
      return res.status(400).json({ "error": "Usuario o contraseña incorrectos" });
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


module.exports = {
  renewtokenv2,
  loginv2
};
