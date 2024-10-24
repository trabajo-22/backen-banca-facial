const { response, request } = require("express");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/user");



// VALIDACION TOKEN INICIO DE SESION
const validarToken = async (req, res, next) => {
  const token = req.header('x-force');
  // console.log('dd',token)
  const deviceId = req.header('x-device-id');
  // console.log('idTelefono',deviceId)
  if (!token) {
    console.log('No hay token, autorización denegada')
    return res.status(401).json({ msg: "No hay token, autorización denegada" });
  }
  try {
     const { uid, idTelefono: deviceId } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
    const usuario = await Usuario.findById(uid);
    if (!usuario) {
      console.log('Token no válido')
      return res.status(401).json({ msg: "Token no válido" });
    }
    // Verificar que el token y el deviceId coincidan con los almacenados en la base de datos
    if (usuario.userToken !== token || usuario.idTelefono !== deviceId) {
      console.log('vuelva a iniciar session')
      return res.status(401).json({ msg: "Sesión inválida, por favor vuelva a iniciar sesión" });
    }
    console.log('bien')
    req.usuario = usuario;
    next();
  } catch (error) {
    console.error('erorrrrrrr',error);
    return res.status(401).json({ msg: "Token no válido" });
  }
};



const validateJWT = async (req = request, res = response, next) => {
  const token = req.header("x-force");
  console.log('MI_TOKENNN',token);
  if (!token) {
    return res.status(401).json({
      message: "No permitido",
    });
  }
  try {
    const { uid, type } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
    //console.log(uid + " | tipo: " + type);
    let usr = null;
    if (type) usr = await Usuario.findOne({ identificacion: uid });
    else usr = await Usuario.findById(uid);
    if (!usr.estado) {
      return res.status(401).json({
        message: "No permitido",
      });
    }
    //console.log(usr);
    req.uid = usr;
    req.uidType = type;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "No permitido",
    });
  }
};



const validarJWTv2 = async (req, res, next) => {
  const token = req.header("x-force");
  if (!token) {
    return res.status(401).json({
      message: "No permitido",
    });
  }

  try {
    const { identificacion, type, uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
    req.user = identificacion;
    req.uidType = type;
    req.iduser = uid;
    console.log('token valido')
    next();
  } catch (error) {
    console.log('tokeeee',error)
    return res.status(401).json({
      message: "No permitido",
    });
  }
}


const validarJWTRecuperacionContrasena = async (req, res, next) => {
  const token = req.header("x-force");
  if (!token) {
    console.log('toeeee',token)
    return res.status(401).json({
      message: "No permitido",
    });
  }
  try {
    const { codigo, identificacion } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
    req.codigo = codigo;
    req.user = identificacion;
    next();
  } catch (error) {
    console.log('a caducado..',error)
    return res.status(400).json({"error": "No permitido, Contraseña temporal a caducado"});
  }
}


module.exports = { validateJWT, validarJWTv2, validarJWTRecuperacionContrasena, validarToken };
