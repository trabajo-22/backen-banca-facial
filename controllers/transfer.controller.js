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

const veridicarNumeroCuenta = async (identificacion, numerocuenta) => {
  let sqlQuery = `SELECT 
                    PP.nombreUnido nombres
                  FROM Personas.Persona PP
                  INNER JOIN Clientes.Cliente CC ON CC.secuencialPersona = PP.secuencial
                  INNER JOIN CaptacionesVista.CuentaCliente VC ON VC.secuencialCliente = CC.secuencial
                  INNER JOIN CaptacionesVista.CuentaMaestro CM ON CM.secuencial = vc.secuencialCuenta
                  WHERE identificacion = @identificacion and CM.codigo = @numerocuenta and CM.codigoTipoCuenta != '00                  '`
  let cnn = await sql.connect(configsql)
  let result = await cnn.request()
    .input('identificacion', sql.VarChar(15), identificacion)
    .input('numerocuenta', sql.VarChar(15), numerocuenta)
    .query(sqlQuery)

  dataResult = result.recordset[0]
  await cnn.close();

  return dataResult;
}

const beneficiarioInternoRegister = async (req = request, res = response) => {
  const { email, identificacion, nick, cuenta } = req.body;
  const { numerocliente, _id } = req.uid;
  let ct = cuenta.toString();
  let ctaB = parseInt(ct.substr(-5), 10);
  let ctaC = parseInt(numerocliente, 10);
  if (ctaB == ctaC) {
    return res.status(400).json({
      ok: false,
      opt: "no puede registrar su cuenta",
    });
  }
  const args = {
    identificacion: identificacion,
    numeroCliente: ct.substr(-5),
    enviaSMS: false,
    enviaMail: false,
  };
  let datos, envio, msg;
  soap.createClient(url, function (err, client) {
    if (err) {
      console.log(err);
      return res.status(400).json({
        ok: false,
        opt: "error al registrar beneficiario",
        err,
      });
    } else {
      client.ConsultaClientesPorNumeroIdentificacion(
        args,
        function (er, result) {
          if (er) {
            console.log("Error al retornar datos del servicio 0001: " + er);
            return res.status(400).json({
              ok: false,
              opt: "error al registrar beneficiario",
              er,
            });
          } else {
            envio =
              result.ConsultaClientesPorNumeroIdentificacionResult
                .EsRespuestaCorrecta;
            msg =
              result.ConsultaClientesPorNumeroIdentificacionResult
                .MensajeRespuesta;
            if (envio == "true") {
              datos =
                result.ConsultaClientesPorNumeroIdentificacionResult.DatoPerfil;
              Beneficiariointerno.find({ numerocliente: ct, cliente: _id },
                function (err, benef) {
                  if (err) {
                    res.status(400).json({
                      ok: false,
                      code: "B002",
                      message: err,
                    });
                  }
                  if (benef.length) {
                    benef[0].estado = true;
                    benef[0].save();
                    res.status(200).json({
                      ok: false,
                      code: "U002",
                      message: "Usuario ya registrado",
                    });
                  } else {
                    let beneficiario = new Beneficiariointerno({
                      nombre: datos.Nombres,
                      email,
                      nick,
                      estado: 1,
                      identificacion,
                      numerocliente: cuenta,
                      cliente: _id,
                      update: new Date(),
                    });
                    beneficiario.save(async (er, beneficiarioDB) => {
                      if (er) {
                        return res.status(400).json({
                          ok: false,
                          er,
                        });
                      } else {
                        res.json({
                          ok: true,
                          message: "Beneficiario creado!",
                        });
                      }
                    });
                  }
                }
              );
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

const interna = async (req, res) => {
  const { id, monto } = req.body;
  const { _id, numerocliente } = req.uid;
  //let ctaOrigen = await cuentaLength(numerocliente, 1);
  //let ctaDestino = await cuentaLength(cuenta, tipo);
  let ctaDestino = "";
  let BeneficiarioId = "";
  let ctaOrigen = "";
  Beneficiariointerno.findOne({ _id: id }, function (err, result) {
    if (err) {
      return res
        .status(200)
        .json({ ok: false, opt: "error al buscar beneficiario", err });
    }
    BeneficiarioId = result._id;
    ctaDestino = result.numerocliente;
  });

  await Cuenta.findOne(
    { numerocliente: numerocliente, NombreTipoCuenta: "Ahorros" },
    function (err, result) {
      if (err) {
        return res
          .status(200)
          .json({ ok: false, opt: "error al buscar cuenta", err });
      }
      ctaOrigen = result.codigo;
    }
  );
  const args = {
    numeroCuentaOrigen: ctaOrigen,
    numeroCuentaDestino: ctaDestino,
    valorTransaccion: monto,
  };
  soap.createClient(url, function (err, client) {
    if (err) {
      console.log(err);
      return res.status(400).json({
        ok: false,
        opt: "error al realizar transferencia ",
        err,
      });
    } else {
      client.ProcesaTransferenciaInterna(args, function (er, result) {
        if (er) {
          console.log("Error al retornar datos del servicio T0001: " + er);
          return res.status(400).json({
            ok: false,
            opt: "error al registrar beneficiario",
            er,
          });
        } else {
          console.log(result.ProcesaTransferenciaInternaResult);
          if (
            result.ProcesaTransferenciaInternaResult.EsRespuestaCorrecta ==
            "true"
          ) {
            comprobante = new Comprobante({
              nombre: "Transferencia Interna",
              interna: 1,
              monto,
              codigoTransaccion:
                result.ProcesaTransferenciaInternaResult.NumeroDocumento,
              fecha: new Date(),
              beneficiario: BeneficiarioId,
              cliente: _id,
            });
            comprobante.save();
          }
          return res.json({ result });
        }
      });
    }
  });
};

const cuentaLength = (cta, tipo) => {
  let ctaType = "";
  switch (tipo) {
    case 1:
      ctaType = "7126010";
      break;
    case 2:
      ctaType = "7126030";
      break;
  }
  switch (cta.length) {
    case 3:
      return ctaType + "00" + cta;
    case 4:
      return ctaType + "0" + cta;
    case 5:
      return ctaType + cta;
  }
};

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

const BeneficiarioExternoRegister = async (req = request, res = response) => {
  const {
    nombre,
    email,
    nick,
    identificacion,
    tipoIdentificacion,
    codigoConceptoTransferencia,
    codigoTipoCuentaTransferencia,
    secuencialInstitucionTransferencia,
    numeroCuentaBeneficiario,
  } = req.body;
  const { _id } = req.uid;
  console.log(_id);

  Beneficiariointerbancario.find(
    { numeroCuentaBeneficiario, cliente: _id },
    function (err, benef) {
      if (err) {
        res.status(400).json({
          ok: false,
          code: "B002",
          message: err,
        });
      }
      if (benef.length) {
        benef[0].estado = true;
        benef[0].save();
        res.status(200).json({
          ok: false,
          code: "U002",
          message: "Beneficiario ya registrado",
        });
      } else {
        let beneficiario = new Beneficiariointerbancario({
          nombre,
          email,
          nick,
          identificacion,
          tipoIdentificacion,
          codigoConceptoTransferencia,
          codigoTipoCuentaTransferencia,
          secuencialInstitucionTransferencia,
          numeroCuentaBeneficiario,
          creacion: new Date(),
          cliente: _id,
          estado: true,
        });
        beneficiario.save(async (er, beneficiarioDB) => {
          if (er) {
            return res.status(400).json({
              ok: false,
              er,
            });
          } else {
            res.json({
              ok: true,
              message: "Beneficiario creado!",
            });
          }
        });
      }
    }
  );
};

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
    conf.save();
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
          conf.save();

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
                      montoconvertido,
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

const externa = async (req, res) => {
  const { id, monto, detalle } = req.body;
  const { _id, numerocliente } = req.uid;
  let montoconvertido = Number(cpf(monto));
  let dia = new Date();
  conf = await Setting.findOne({ user: _id });
  if (montoconvertido > conf.amount) {
    console.log(
      "Usuario " +
      numerocliente +
      " registra intento de transferencia de " +
      montoconvertido +
      " superior al permitido"
    );
    return res
      .status(400)
      .json({ ok: false, opt: "error sobrepasa el monto diario" });
  } else {
    if (conf.amount_out >= conf.amount) {
      console.log(
        "Usuario " +
        numerocliente +
        " registra transferencia que sobrepasan lo permitido" +
        conf.amount_out
      );
      return res
        .status(400)
        .json({ ok: false, opt: "error sobrepasa el monto diario" });
    } else {
      if (conf.transfer > 5) {
        console.log(
          "Usuario " +
          numerocliente +
          " sobrepasa la cabtidad de transferencias diarias."
        );
        return res.status(400).json({
          ok: false,
          opt: "error sobrepasa cantidad de transferencias diarias",
        });
      }
    }
  }
  let ctaOrigen = "";
  await Cuenta.findOne(
    { numerocliente, NombreTipoCuenta: "Ahorros" },
    function (err, result) {
      if (err) {
        console.log(
          "Error al consultar cuenta: " + numerocliente + " error: " + err
        );
        return res
          .status(400)
          .json({ ok: false, opt: "error al buscar cuenta", err });
      }
      ctaOrigen = result.Secuencial;
    }
  );
  beneficiariointerbancario.findOne(
    { _id: id, cliente: _id },
    function (err, result) {
      if (err) {
        console.log("Error al consultar beneficiario: " + numerocliente);
        return res
          .status(400)
          .json({ ok: false, opt: "error al buscar beneficiario", err });
      }
      if (result) {
        const args = {
          codigoConceptoTransferencia: result.codigoConceptoTransferencia,
          codigoTipoCuentaTransferencia: result.codigoTipoCuentaTransferencia,
          detalle,
          identificacionBeneficiario: result.identificacion,
          nombreBeneficiario: result.nombre,
          numeroCuentaBeneficiario: result.numeroCuentaBeneficiario,
          secuencialInstitucionTransferencia: parseInt(
            result.secuencialInstitucionTransferencia
          ),
          valor: montoconvertido,
          esCedulaBeneficiario: result.tipoIdentificacion == "1" ? true : false,
          esRucBeneficiario: result.tipoIdentificacion == "2" ? true : false,
          esPasaporteBeneficiario:
            result.tipoIdentificacion == "3" ? true : false,
          secuencialCuentaDebita: parseInt(ctaOrigen),
          numeroCliente: numerocliente,
        };
        //return res.json({ ok: false, opt: "datos de transferencia", args });
        if (conf.amount_out == 0) {
          conf.amount_out = montoconvertido;
          conf.transfer = 1;
        } else {
          if (conf.transfer <= 5) {
            conf.amount_out = conf.amount_out + montoconvertido;
            conf.transfer = conf.transfer + 1;
          }
        }
        conf.save();
        soap.createClient(url, function (err, client) {
          if (err) {
            console.log(err);
            return res.status(400).json({
              ok: false,
              opt: "error al realizar transferencia ",
              err,
            });
          } else {
            client.ProcesaTransferenciaInterbancaria(
              args,
              function (er, resultado) {
                if (er) {
                  console.log(
                    "Error al retornar datos del servicio Transferencia Interbancari: " +
                    er
                  );
                  return res.status(400).json({
                    ok: false,
                    opt: "Error al retornar datos del servicio Transferencia Interbancaria",
                    er,
                  });
                } else {
                  if (
                    resultado.ProcesaTransferenciaInterbancariaResult
                      .EsRespuestaCorrecta == "true"
                  ) {
                    comprobante = new Comprobante({
                      nombre: "Transferencia Interbancaria",
                      interna: 0,
                      montoconvertido,
                      codigoTransaccion:
                        resultado.ProcesaTransferenciaInterbancariaResult
                          .NuevaTransferenciaMS.Documento,
                      codigoComision:
                        resultado.ProcesaTransferenciaInterbancariaResult
                          .NuevaTransferenciaMS.DocumentoComision,
                      detalle: JSON.stringify(
                        resultado.ProcesaTransferenciaInterbancariaResult
                          .NuevaTransferenciaMS.DetalleCuenta
                      ),
                      fecha: new Date(),
                      beneficiario: id,
                      cliente: _id,
                    });
                    comprobante.save();
                    console.log("transferencia satisfactoria:" + numerocliente);
                    return res.json({ resultado });
                  }
                  return res.json({ args, resultado });
                }
              }
            );
          }
        });
      }
    }
  );
};

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
  beneficiarioInternoRegister,
  beneficiario,
  interna,
  beneficiarios,
  deleteBeneficiario,
  BeneficiarioExternoRegister,
  BeneficiariosExternos,
  deleteBeneficiarioExterno,
  externa,
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
