const { response, request } = require("express");
const Usuario = require("../models/user");
const bcrypt = require("bcrypt");
const _ = require("underscore");
const soap = require("soap");
const { rest } = require("underscore");
const { generarJWT } = require("../helpers/generarjwt");
const Dato = require("../models/dato");
const setting = require("../models/setting");

const url = process.env.SOAP;

/*
 ****************************
 *** USUARIOS REGISTRADOS ***
 ****************************
 */
const usersR = (req = request, res = response) => {
  const { p = 1, limit = 5 } = req.query;
  const query = { estado: true };
  const p2 = Number(p) * Number(limit);
  Usuario.find(query)
    .skip(p2)
    .limit(Number(limit))
    .exec((err, users) => {
      console.log(users);
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }
      Usuario.countDocuments(query, (er, cantidad) => {
        if (er) {
          return res.status(400).json({
            ok: false,
            er,
          });
        }
        res.json({
          ok: true,
          cantidad,
          users,
        });
      });
    });
};

/*
 ***************************
 **********REGISTRO*********
 ***************************
 */

const RegistrarUsuario = async (req, res) => {
  const { cedula, cuenta, sms, mail, nick } = req.body;

  // verificar si ya se encuentra registrado
  const user = await Usuario.findOne({ identificacion: cedula });
  if (user) {
    return res.status(400).json({ ok: false, error: "Ya existe usuario" });
  } else {

    // verificar si numero de cliente ya se encuentra registrado
    const usernumcliente = await Usuario.findOne({ numerocliente: cuenta });
    if (usernumcliente) {
      return res.status(400).json({ ok: false, error: "Ya existe número de cliente" });
    } else {

      // verificar si nick ya se encuentra registrado
      const usernick = await Usuario.findOne({ nick });
      if (usernick) {
        return res.status(400).json({ ok: false, error: "Ya existe el nick" });
      } else {

        //--- Consultar los datos del cliente, si es socio, junior o ahorro campo

        
      }
    }
  }



}

const userRegister = async (req, res) => {
  const { cedula, cuenta, sms, mail, nick } = req.body;
  const args = {
    identificacion: cedula,
    numeroCliente: cuenta,
    enviaSMS: sms,
    enviaMail: !sms,
  };
  let datos, envio, msg;
  soap.createClient(url, function (err, client) {
    if (err) {
      return res.status(400).json({
        ok: false,
        opt: "cliente",
        err,
      });
    } else {
      console.log("Entra al servidor soap");
      client.ConsultaClientesPorNumeroIdentificacion(
        args,
        async function (er, result) {
          console.log(result)
          if (er) {
            console.log("Error al retornar datos del servicio 0001: " + er);
            return res.status(400).json({
              ok: false,
              opt: "datos",
              er,
            });
          } else {
            console.log("Retorna datos del servicio 0001 REGISTRO");
            envio = result.ConsultaClientesPorNumeroIdentificacionResult.EsRespuestaCorrecta;
            msg = result.ConsultaClientesPorNumeroIdentificacionResult.MensajeRespuesta;
            if (envio == "true") {
              datos = result.ConsultaClientesPorNumeroIdentificacionResult.DatoPerfil;
              let usuario = new Usuario({
                nombre: datos.Nombres,
                email: datos.Mail,
                nick: nick,
                password: "",
                img: "/user/unknown-profile.jpg",
                constitucion: datos.FechaNacimientoConstitucion,
                estado: 1,
                identificacion: datos.Identificacion,
                oficina: datos.Oficina,
                sexo: datos.Sexo,
                Tidentificacion: datos.TipoIdentificacion,
                numerocliente: datos.NumeroCliente,
                role: "Role_User",
                check: bcrypt.hashSync(datos.Token, 10, function (err, hash) {
                  if (err) console.log(err);
                }),
                Date: Date.now(),
                add: Date.now(),
                update: "",
              });
              let dia = new Date();
              let configuracion = new setting({
                try: 0,
                accept: true,
                amount: 5000,
                amount_out: 0,
                transfer: 0,
                months: 3,
                date: dia.getDate(),
                user: usuario._id,
              });
              usuario.save(async (er, userDB) => {
                if (er) {
                  return res.status(400).json({
                    ok: false,
                    er,
                  });
                } else {
                  const token = await generarJWT(userDB._id, false, datos.NumeroCliente);
                  configuracion.save();
                  res.json({
                    ok: true,
                    message: "Usuario creado!",
                    token: token,
                  });
                }
              });
            } else {
              return res.status(400).json({
                ok: false,
                code: "U002",
                message: msg,
              });
            }
          }
        }
      );
    }
  });
};

/*
 **************************
 ****** ESTADO USR BD *****
 **************************
 */
const userDelete = (req, res) => {
  let id = req.params.uid;
  Usuario.findById(id, function (err, usr) {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }
    if (usr) {
      usr.estado = !usr.estado;
      usr.save();
      return res.json({
        ok: true,
        usuario: usr,
        detalle: `Borrado el usuarios`,
      });
    } else {
      return res.status(400).json({
        ok: false,
        code: "D000",
        message: "Usuario no encontrado",
      });
    }
  });
};

/*
 **************************
 **** Asignar Password ****
 **************************
 */
const userPassword = async (req, res) => {
  const { password, passwordV } = req.body;
  const { uid } = req;
  await Usuario.findById(uid._id, async function (err, usr) {
    if (err) {
      return res.status(400).json({
        ok: false,
        code: "P00",
        message: "NO EXISTE",
        err,
      });
    }
    if (password === passwordV) {
      Dato.find({ cliente: usr._id }, function (er, datos) {
        if (datos) {
          if (datos.length) {
            datos.forEach((dato) => {
              console.log(dato.dato + "<-------------- DATO FOR EACH");
              if (bcrypt.compareSync(password, dato.dato)) {
                return res.status(200).json({
                  ok: false,
                  message: "Claves ya utilizada",
                });
              }
            });
          }
        }
      });
      if (usr.password != null || usr.password != "") {
        let dato = new Dato({
          dato: usr.password,
          fecha: new Date(),
          cliente: usr._id,
        });
        dato.save();
      }
      usr.password = bcrypt.hashSync(password, 10, function (err, hash) {
        console.log("encrypt");
        if (err) {
          console.log(err);
          return res.status(500).json({
            ok: false,
            err,
          });
        }
      });
      usr.check = null;
      usr.save();
      const token = await generarJWT(usr._id, false, usr.numerocliente);
      return res.json({
        ok: true,
        token: token,
        user,
        detalle: "Contraseña asignada ",
      });
    } else {
      return res.status(400).json({
        ok: false,
        code: "P001",
        message: "Claves no son iguales",
      });
    }
  });
};

const passwordValidate = (req, res) => {
  const { password } = req.body;
  const { _id } = req.uid;
  Usuario.findOne({ _id }, function (err, usr) {
    if (err) {
      return res.status(400).json({
        ok: false,
        message: "Error al identificar",
      });
    }
    if (usr) {
      if (bcrypt.compareSync(password, usr.password)) {
        return res.status(200).json({
          ok: true,
        });
      } else {
        return res.status(200).json({
          ok: false,
        });
      }
    }
  });
};

/********New Checker********/
const renewcheck = async (req, res) => {
  const { identificacion, numerocliente } = req.uid;
  const args = {
    identificacion,
    numeroCliente: numerocliente,
    enviaSMS: true,
    enviaMail: false,
  };
  console.log(args);
  soap.createClient(url, function (err, client) {
    if (err) {
      console.log(err);
      return res.status(400).json({
        ok: false,
        opt: "check",
        err,
      });
    } else {
      client.GeneraToken(args, function (er, result) {
        console.log(result)
        if (er) {
          console.log("Error al retornar datos del servicio 0001: " + er);
          return res.status(400).json({
            ok: false,
            opt: "datos",
            er,
          });
        } else {
          Usuario.findOne({ identificacion }, function (er, usuario) {
            console.log(result.GeneraTokenResult.Token);
            usuario.check = bcrypt.hashSync(
              result.GeneraTokenResult.Token,
              10,
              function (err, hash) {
                console.log("encrypt");
                if (err) {
                  console.log(err);
                  return res.status(500).json({
                    ok: false,
                    err,
                  });
                }
              }
            );
            usuario.Date = new Date();
            usuario.save(async (er, userDB) => {
              if (er) {
                return res.status(400).json({
                  ok: false,
                  er,
                });
              } else {
                let msg = "";
                if (args.enviaMail) {
                  msg = "Código enviado al Email";
                } else {
                  msg = "Código enviado al número registrado";
                }
                return res.json({
                  ok: true,
                  message: msg,
                  token: result.GeneraTokenResult.Token,
                });
              }
            });
          });
        }
      });
    }
  });
};

module.exports = {
  usersR,
  userRegister,
  userDelete,
  userPassword,
  renewcheck,
  passwordValidate,
};
