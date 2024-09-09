const { response, request } = require("express");
const soap = require("soap");
const Usuario = require("../models/user");
const Cuenta = require("../models/cuenta");
const Setting = require("../models/setting");
const Beneficiariointerno = require("../models/beneficiariointerno");
const Beneficiariointerbancario = require("../models/beneficiariointerbancario");
const Instituciontransferencia = require("../models/instituciontransferencia");
const Tipoinstituciontransferencias = require("../models/tipoinstituciontransferencias");
const Tipocuentatransferencia = require("../models/tipocuentatransferencia");
const Origendestinotransferencia = require("../models/origendestinotransferencia");
const Conceptotransferencia = require("../models/conceptotransferencia");
const Comprobante = require("../models/comprobante");
const beneficiariointerbancario = require("../models/beneficiariointerbancario");
const Solicitudotp = require("../models/solicitudotp");
const bcrypt = require("bcrypt");
const configsql = require("../database/sqlserver");
const sql = require("mssql");
const {veridicarNumeroCuenta} = require("../models/cuentas.sql");

const url = process.env.SOAP;

/************************
 ************************
 REGISTRO DE BENEFICIARIO INTERNO
 ************************ 
 ************************/


const verificarNumeroCuentayNick = async (req, res) => {
  const { nick, cuenta, identificacionbeneficiario } = req.body;
  const identificacion = req.user;

  let dataVerificacion = await veridicarNumeroCuenta(identificacionbeneficiario, cuenta);
  if (!dataVerificacion) {
    res.status(400).json({ "error": "El número de cuenta es incorrecto!" });
    return;
  } else {
    const usuarioEnLinea = await Usuario.findOne({ identificacion: identificacion });
    const beneficiario = await Beneficiariointerno.findOne({ numerocliente: cuenta, cliente: usuarioEnLinea._id, nick: nick, identificacion: identificacionbeneficiario, estado: true });
    if (beneficiario) {
      res.status(400).json({ "error": "El beneficiario ya existe!" });
      return;
    } else {
      res.json({ 'response': "Datos correctos" });
      return;
    }
  }
}

const verificarNumeroCuentayNickBeneficiariosInterbancarios = async (req, res) => {
  const { nick, cuenta, identificacionbeneficiario } = req.body;
  const identificacion = req.user;

  const usuarioEnLinea = await Usuario.findOne({ identificacion: identificacion });
  const beneficiario = await Beneficiariointerbancario.findOne({ numeroCuentaBeneficiario: cuenta, cliente: usuarioEnLinea._id, nick: nick, identificacion: identificacionbeneficiario, estado: true });
  if (beneficiario) {
    res.status(400).json({ "error": "El beneficiario ya existe!" });
    return;
  } else {
    res.json({ 'response': "Datos correctos" });
    return;
  }
}

const registrarNuevoBeneficiario = async (req, res) => {
  const { email, identificacionbeneficiario, nick, cuenta, codigootp } = req.body;
  const identificacion = req.user;

  const solicitudotp = await Solicitudotp.findOne({ identificacion: identificacion, esvalidado: false }).sort({ $natural: -1 }).limit(1);
  if (!bcrypt.compareSync(codigootp, solicitudotp.tokens)) {
    res.status(400).json({ "error": "Código OTP Inválido" });
    return;
  } else {
    // verificar si existe en sqlserver
    let dataVerificacion = await veridicarNumeroCuenta(identificacionbeneficiario, cuenta);
    if (!dataVerificacion) {
      res.status(400).json({ "error": "El número de cuenta es incorrecto!" });
      return;
    } else {
      const usuarioEnLinea = await Usuario.findOne({ identificacion: identificacion });
      const beneficiario = await Beneficiariointerno.findOne({ numerocliente: cuenta, cliente: usuarioEnLinea._id, nick: nick, identificacion: identificacionbeneficiario, estado: true });
      if (beneficiario) {
        res.status(400).json({ "error": "El beneficiario ya existe!" });
        return;
      } else {
        let beneficiario = new Beneficiariointerno({
          nombre: dataVerificacion.nombres,
          email,
          nick,
          estado: 1,
          identificacion: identificacionbeneficiario,
          numerocliente: cuenta,
          cliente: usuarioEnLinea._id,
          update: new Date(),
        });
        beneficiario.save(async (er, beneficiarioDB) => {
          if (er) {
            res.status(400).json({ 'error': er });
            return;
          } else {
            res.json({ 'response': "Beneficiario creado!" });
            return;
          }
        });
      }
    }
  }
}

/************************
 ************************
 **LISTAR BENEFICIARIOS**
 ************************
 ************************/
const beneficiarios = async (req, res) => {
  const { _id } = req.uid;
  Beneficiariointerno.find(
    { cliente: _id, estado: true },
    function (err, result) {
      if (err) {
        return res.status(400).json({
          ok: false,
          opt: "error al listar beneficiarios ",
          err,
        });
      }
      if (result) {
        return res.json({ result });
      }
      return res.json({
        ok: true,
        opt: "No existen beneficiario",
      });
    }
  );
};

/************************
*************************
ELIMINAR BENEFICIARIO INTERNO
*************************
*************************/
const deleteBeneficiario = async (req, res) => {
  const { id } = req.params;
  console.log('Eliminado beneficiario: ' + id);
  Beneficiariointerno.findOne(
    { _id: id, estado: true },
    function (err, result) {
      if (err) {
        return res
          .status(200)
          .json({ ok: false, opt: "error al eliminar beneficiario", err });
      }
      if (result) {
        result.estado = !result.estado;
        result.save();
        return res.json({
          ok: true,
          opt: "Beneficiario Eliminado",
        });
      }
      return res.json({
        ok: true,
        opt: "No existe beneficiario",
      });
    }
  );
};

/*************************
 *************************
 **TRANSFERENCIA INTERNA**
 *************************
 *************************/

const internav2 = async (req, res) => {
  const { id, monto, cuentaorigen } = req.body;
  const identificacion = req.user;

  let benficiario = await Beneficiariointerno.findOne({ _id: id });

  const args = {
    numeroCuentaOrigen: cuentaorigen,
    numeroCuentaDestino: benficiario.numerocliente,
    valorTransaccion: monto,
  };

  soap.createClient(url, async function (err, client) {
    if (err) {
      console.log(err);
      return res.status(400).json({ 'error': err });
    } else {
      client.ProcesaTransferenciaInterna(args, async function (er, result) {
        if (er) {
          console.log("Error al retornar datos del servicio T0001: " + er);
          return res.status(400).json({ 'error': "error al registrar beneficiario" });
        } else {
          console.log(result.ProcesaTransferenciaInternaResult);
          if (result.ProcesaTransferenciaInternaResult.EsRespuestaCorrecta == "true") {
            let usuario = await Usuario.findOne({ identificacion: identificacion })
            let comprobante = new Comprobante({
              nombre: "Transferencia Interna",
              interna: 1,
              monto,
              codigoTransaccion: result.ProcesaTransferenciaInternaResult.NumeroDocumento,
              fecha: new Date(),
              beneficiario: benficiario._id,
              cliente: usuario._id,
            });
            await comprobante.save();
          }
          return res.json({ result });
        }
      });
    }
  });
}


/***************************************************************************************************************************************************/

/*************************
**************************
INSERTAR BENEFICIARIO INTERBANCARIO
**************************
*************************/

const RegistrarBeneficiarioInterbancarioV2 = async (req, res) => {
  const { nombre, email, nick, identificacionbeneficiario, tipoIdentificacion, codConceptoTransferencia, codTipoCuentaTransferencia, secuencialInstitucionTransferencia, numeroCuentaBeneficiario, codigootp } = req.body;
  const identificacion = req.user;
  console.log(req.body)

  const solicitudotp = await Solicitudotp.findOne({ identificacion: identificacion, esvalidado: false }).sort({ $natural: -1 }).limit(1);
  if (!bcrypt.compareSync(codigootp, solicitudotp.tokens)) {
    res.status(400).json({ "error": "Código OTP Inválido" });
    return;
  } else {
    const usuarioEnLinea = await Usuario.findOne({ identificacion: identificacion });
    const beneficiario = await Beneficiariointerbancario.findOne({ numeroCuentaBeneficiario: numeroCuentaBeneficiario, cliente: usuarioEnLinea._id, nick: nick, identificacion: identificacionbeneficiario, estado: true });
    if (beneficiario) {
      res.status(400).json({ "error": "El beneficiario ya existe!" });
      return;
    } else {
      let beneficiario = new Beneficiariointerbancario({
        nombre,
        email,
        nick,
        identificacion: identificacionbeneficiario,
        tipoIdentificacion,
        codigoConceptoTransferencia: codConceptoTransferencia,
        codigoTipoCuentaTransferencia: codTipoCuentaTransferencia,
        secuencialInstitucionTransferencia: secuencialInstitucionTransferencia,
        numeroCuentaBeneficiario,
        creacion: new Date(),
        cliente: usuarioEnLinea._id,
        estado: true,
      });
      beneficiario.save(async (er, beneficiarioDB) => {
        if (er) {
          res.status(400).json({ "error": er });
          return;
        } else {
          res.json({ "response": "Beneficiario creado!" });
        }
      });
    }
  }
}


/************************
 ************************
 **LISTAR BENEFICIARIOS**
 ************************
 ************************/
const BeneficiariosExternos = async (req, res) => {
  const { _id } = req.uid;
  console.log(_id);
  Beneficiariointerbancario.find(
    { cliente: _id, estado: true },
    function (err, result) {
      if (err) {
        return res.status(400).json({
          ok: false,
          opt: "error al listar Beneficiarios Externos",
          err,
        });
      }
      if (result.length) {
        return res.json({ beneficiarios: result });
      }
      return res.json({ ok: false, opt: "No hay beneficiarios registrados" });
    }
  );
};

/************************
*************************
ELIMINAR BENEFICIARIO INTERNO
*************************
*************************/
const deleteBeneficiarioExterno = async (req, res) => {
  const { id } = req.params;
  console.log('Beneficiario externo a eliminar' + id);
  Beneficiariointerbancario.findOne(
    { _id: id, estado: true },
    function (err, result) {
      if (err) {
        return res.status(200).json({
          ok: false,
          opt: "error al eliminar Beneficiario de otra institución",
          err,
        });
      }
      if (result) {
        result.estado = !result.estado;
        result.save();
        return res.json({
          ok: true,
          opt: "Beneficiario de otra institución Eliminado",
        });
      }
      return res.json({
        ok: true,
        opt: "No existe beneficiario",
      });
    }
  );
};

/*************************
 *************************
 **TRANSFERENCIA EXTERNA**
 *************************
 *************************/

cpf = (v) => {
  v = v.replace(/([^0-9\.]+)/g, '');
  v = v.replace(/^[\.]/, '');
  v = v.replace(/[\.][\.]/g, '');
  v = v.replace(/\.(\d)(\d)(\d)/g, '.$1$2');
  v = v.replace(/\.(\d{1,2})\./g, '.$1');
  v = v.toString().split('').reverse().join('').replace(/(\d{3})/g, '$1');
  v = v.split('').reverse().join('').replace(/^[\,]/, '');
  return v;
}


const transferenciaexternav2 = async (req, res) => {
  const { idbeneficiario, monto, detalle, cuentaorigen } = req.body;
  const identificacion = req.user;

  let montoconvertido = Number(cpf(monto));
  console.log(montoconvertido)

  let usuarioEnLinea = await Usuario.findOne({ identificacion: identificacion });
  let conf = await Setting.findOne({ user: usuarioEnLinea._id });

  // no es del mismo día y restablece los valores
  let verificacion = await verificarCuantasTransferenciasTieneAlDia(usuarioEnLinea._id);
  if (verificacion == false && conf.transfer > 0) {
    conf.transfer = 0;
    conf.amount_out = 0;
    await conf.save();
  }

  
  if (montoconvertido > conf.amount) {
    res.status(400).json({ "error": "Sobrepasa el monto diario" });
    return;
  } else {
    if (conf.amount_out >= conf.amount) {
      res.status(400).json({ "error": "Sobrepasa el monto diario" });
      return;
    } else {
      if (conf.transfer > 5) {
        res.status(400).json({ "error": "Sobrepasa cantidad de transferencias diarias" });
        return;
      } else {
        let beneficiario = await beneficiariointerbancario.findOne({ _id: idbeneficiario, cliente: usuarioEnLinea._id });
        if (beneficiario) {
          const args = {
            codigoConceptoTransferencia: beneficiario.codigoConceptoTransferencia,
            codigoTipoCuentaTransferencia: beneficiario.codigoTipoCuentaTransferencia,
            detalle,
            identificacionBeneficiario: beneficiario.identificacion,
            nombreBeneficiario: beneficiario.nombre,
            numeroCuentaBeneficiario: beneficiario.numeroCuentaBeneficiario,
            secuencialInstitucionTransferencia: parseInt(beneficiario.secuencialInstitucionTransferencia),
            valor: montoconvertido,
            esCedulaBeneficiario: beneficiario.tipoIdentificacion == "1" ? true : false,
            esRucBeneficiario: beneficiario.tipoIdentificacion == "2" ? true : false,
            esPasaporteBeneficiario: beneficiario.tipoIdentificacion == "3" ? true : false,
            secuencialCuentaDebita: +cuentaorigen,
            numeroCliente: usuarioEnLinea.numerocliente,
          };

          if (conf.amount_out == 0) {
            conf.amount_out = montoconvertido;
            conf.transfer = 1;
          } else {
            if (conf.transfer <= 5) {
              conf.amount_out = conf.amount_out + montoconvertido;
              conf.transfer = conf.transfer + 1;
            }
          }
          // actualizar fecha
          await conf.save();

          soap.createClient(url, function (err, client) {
            if (err) {
              console.log(err);
              res.status(400).json({ "error": err });
              return;
            } else {
              console.log(args);
              client.ProcesaTransferenciaInterbancaria(args, function (er, resultado) {
                if (er) {
                  res.status(400).json({ "error": er });
                  return;
                } else {
                  console.log("Transferencia realizada")
                  console.log(resultado)
                  if (resultado.ProcesaTransferenciaInterbancariaResult.EsRespuestaCorrecta == "true") {
                    console.log("True")
                    let comprobante = new Comprobante({
                      nombre: "Transferencia Interbancaria",
                      interna: 0,
                      monto: montoconvertido,
                      codigoTransaccion: resultado.ProcesaTransferenciaInterbancariaResult.NuevaTransferenciaMS.Documento,
                      codigoComision: resultado.ProcesaTransferenciaInterbancariaResult.NuevaTransferenciaMS.DocumentoComision,
                      detalle: JSON.stringify(resultado.ProcesaTransferenciaInterbancariaResult.NuevaTransferenciaMS.DetalleCuenta),
                      fecha: new Date(),
                      beneficiario: beneficiario._id,
                      cliente: usuarioEnLinea._id,
                    });
                    console.log(comprobante)
                    comprobante.save();
                    console.log("resultado")
                    res.json({ resultado });
                    return;
                  } else if (resultado.ProcesaTransferenciaInterbancariaResult.EsRespuestaCorrecta == "false") {
                    res.status(400).json({ "error": resultado.ProcesaTransferenciaInterbancariaResult.MensajeRespuesta });
                  }
                }
              }
              );
            }
          });

        } else {
          res.status(400).json({ "error": "Existe un problema con el beneficiario seleccionado" });
          return;
        }
      }
    }
  }
}

const verificarCuantasTransferenciasTieneAlDia = async (idcliente) => {
  let fechaBusqueda = new Date()
  let comprobantes = await Comprobante.find({ cliente: idcliente, fecha: { "$gt": fechaBusqueda.getDate() } });
  let conf = await Setting.findOne({ user: idcliente });
  if (!comprobantes) {
    conf.transfer = 0;
    conf.amount_out = 0;
    await conf.save();
    return true;
  } else {
    let contadorMonto = 0;
    let contadorCantidad = 0;
    for (let i = 0; i < comprobantes.length; i++) {
      contadorMonto = contadorMonto + comprobantes[i].amount_out;
      contadorCantidad = contadorCantidad + comprobantes[i].transfer;
    }
    if (conf.amount_out >= contadorMonto) {
      return false;
    } else if (conf.transfer >= 5) {
      return false;
    } else {
      return true;
    }
  }
}


/*************************
 *************************
 ** LISTAR COMPROBANTES **
 *************************
 *************************/
const comprobantes = (req, res) => {
  const { _id } = req.uid;
  Comprobante.find({ cliente: _id }, function (err, result) {
    if (err) {
      return res
        .status(200)
        .json({ ok: false, opt: "error al buscar beneficiario", err });
    }
    if (result.length) {
      return res.json({ ok: true, opt: "datos comprobantes", result });
    }
    return res.json({ ok: false, opt: "no hay datos de comprobantes" });
  });
};

/*************************
 *************************
 ** LLAMAR BENEFICIARIO **
 *************************
 *************************/
const beneficiario = (req, res) => {
  const { id, interna } = req.body;
  switch (interna) {
    case 0:
      beneficiariointerbancario.findOne({ _id: id }, function (err, result) {
        if (err) {
          return res
            .status(200)
            .json({ ok: false, opt: "error al buscar beneficiario", err });
        }
        if (result) {
          return res.json({ ok: true, opt: "datos de beneficiario", result });
        }
        return res.json({ ok: false, opt: "no hay datos de beneficiario" });
      });
      break;
    case 1:
      Beneficiariointerno.findOne({ _id: id }, function (err, result) {
        if (err) {
          return res
            .status(200)
            .json({ ok: false, opt: "error al buscar beneficiario", err });
        }
        if (result) {
          return res.json({ ok: true, opt: "datos de beneficiario", result });
        }
        return res.json({ ok: false, opt: "no hay datos de beneficiario" });
      });
      break;
  }
};
/*****************************************************************
 *****************CAMPOS TRANSFERENCIA EXTERNA********************
 *****************************************************************/

//Tipo de cuenta
const tipocuenta = (req, res) => {
  Tipocuentatransferencia.find({ estaActivo: 1 }, function (err, result) {
    if (err) {
      return res.status(400).json({
        ok: false,
        opt: "error al listar tipo de instituviones ",
        err,
      });
    }
    return res.json({ TipoCuenta: result });
  });
};

//Tipo de Instituciones
const tipoinstituciontransferencia = (req, res) => {
  Tipoinstituciontransferencias.find(
    { estadoActivo: "1" },
    function (err, result) {
      if (err) {
        return res.status(400).json({
          ok: false,
          opt: "error al listar tipo de instituviones ",
          err,
        });
      }
      return res.json({ TipoInstituciones: result });
    }
  );
};

//Instituciones
const instituciones = (req, res) => {
  const { tipo } = req.params;
  Instituciontransferencia.find(
    { codigoTipoInstitucion: tipo, estaActivo: 1 },
    function (err, result) {
      if (err) {
        return res.status(400).json({
          ok: false,
          opt: "error al listar instituviones ",
          err,
        });
      }
      return res.json({ Instituciones: result });
    }
  );
};

//Origen
const origen = (req, res) => {
  Origendestinotransferencia.find({ esOrigen: 1 }, function (err, result) {
    if (err) {
      return res.status(400).json({
        ok: false,
        opt: "error al listar origen de transferencia",
        err,
      });
    }
    return res.json({ origen: result });
  });
};

//Destino
const destino = (req, res) => {
  Origendestinotransferencia.find({ esOrigen: 0 }, function (err, result) {
    if (err) {
      return res.status(400).json({
        ok: false,
        opt: "error al listar destino de transferencia ",
        err,
      });
    }
    return res.json({ destino: result });
  });
};

//Tipo de cuenta
const concepto = (req, res) => {
  Conceptotransferencia.find({ estaActiva: "1" }, function (err, result) {
    if (err) {
      return res.status(400).json({
        ok: false,
        opt: "error al listar conceptos de transferencia",
        err,
      });
    }
    return res.json({ TipoCuenta: result });
  });
};

module.exports = {
  beneficiario,
  beneficiarios,
  deleteBeneficiario,
  BeneficiariosExternos,
  deleteBeneficiarioExterno,
  comprobantes,
  instituciones,
  tipoinstituciontransferencia,
  tipocuenta,
  origen,
  destino,
  concepto,
  verificarNumeroCuentayNick,
  registrarNuevoBeneficiario,
  internav2,
  verificarNumeroCuentayNickBeneficiariosInterbancarios,
  RegistrarBeneficiarioInterbancarioV2,
  transferenciaexternav2
};
