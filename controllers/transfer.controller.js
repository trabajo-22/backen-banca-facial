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

const url = process.env.SOAP;

/************************
 ************************
 REGISTRO DE BENEFICIARIO INTERNO
 ************************ 
 ************************/
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
              Beneficiariointerno.find(
                { numerocliente: ct, cliente: _id },
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
const externa = async (req, res) => {
  const { id, monto, detalle } = req.body;
  const { _id, numerocliente } = req.uid;
  conf = await Setting.findOne({ user: _id });
  if (monto > conf.amount) {
    console.log(
      "Usuario " +
        numerocliente +
        " registra intento de transferencia de " +
        monto +
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
          valor: monto,
          esCedulaBeneficiario: result.tipoIdentificacion == "1" ? true : false,
          esRucBeneficiario: result.tipoIdentificacion == "2" ? true : false,
          esPasaporteBeneficiario:
            result.tipoIdentificacion == "3" ? true : false,
          secuencialCuentaDebita: parseInt(ctaOrigen),
          numeroCliente: numerocliente,
        };
        //return res.json({ ok: false, opt: "datos de transferencia", args });
        if (conf.amount_out == 0) {
          conf.amount_out = Number(monto);
          conf.transfer = 1;
        } else {
          if (conf.transfer <= 5) {
            conf.amount_out = conf.amount_out + Number(monto);
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
                      monto,
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
};
