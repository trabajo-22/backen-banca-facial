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
    let usr = null;
    if (type) usr = await Usuario.findOne({ identificacion: uid });
    else usr = await Usuario.findById(uid);
    if (!usr.estado) {
      return res.status(401).json({
        message: "No permitido",
      });
    }
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
    const { numerocliente, type, uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
    req.user = numerocliente;
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


module.exports = { validateJWT, validarJWTv2 };
