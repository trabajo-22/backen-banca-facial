const { response, request } = require("express");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/user");

const validateJWT = async (req = request, res = response, next) => {
  const token = req.header("x-force");
  //console.log(token);
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
    next();
  } catch (error) {
    console.log(error)
    return res.status(401).json({
      message: "No permitido",
    });
  }
}

const validarJWTRecuperacionContrasena = async (req, res, next) => {
  const token = req.header("x-force");
  if (!token) {
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
    console.log(error)
    return res.status(400).json({"error": "No permitido, Contraseña temporal a caducado"});
  }
}


module.exports = { validateJWT, validarJWTv2, validarJWTRecuperacionContrasena };
