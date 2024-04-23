const { response, request } = require("express");
const Usuario = require("../models/user");
const Cuenta = require("../models/cuenta");
const Deposito = require("../models/deposito");
const Prestamo = require("../models/prestamo");
const soap = require("soap");
const deposito = require("../models/deposito");

const url = process.env.SOAP;

/*
 ****************************
 ******** CONSOLIDADO *******
 ****************************
 */
const consolidado = async (req = request, res = response) => {
  const { numerocliente, _id } = req.uid;
  console.log(numerocliente)
  args = { numeroCliente: numerocliente };
  soap.createClient(url, function (err, client) {
    //client.setEndpoint("http://192.168.10.11/SitioWeb/SitioWeb.SitioWebWS.svc");
    if (err) {
      console.log(err);
      return res.status(500).json({
        ok: false,
        opt: "Error en la capa de datos",
        err,
      });
    } else {
      client.DevuelveConsolidadoPorCliente(args, function (er, result) {
        if (er) {
          console.log("Error al retornar datos del servicio 0002: " + er);
          return res.status(400).json({
            ok: false,
            er,
          });
        }
        var esCorrecta =
          result.DevuelveConsolidadoPorClienteResult.EsRespuestaCorrecta;
        if (esCorrecta) {
          /**BEGIN CUENTAS**/
          var cuentas =
            result.DevuelveConsolidadoPorClienteResult.DatoConsolidado.Cuentas
              .CuentaMaestroResumenParaConsolidado;
          if (!cuentas.length) {
            cuentas = [depositos];
          }
          cuentas.forEach((cuenta) => {
            Cuenta.findOne(
              { Secuencial: cuenta.Secuencial },
              function (err, c) {
                if (c) {
                  if (c.NombreEstado != cuenta.NombreEstado) {
                    c.NombreEstado = cuenta.NombreEstado;
                    c.save(async (er, countDB) => {
                      if (er) {
                        console.log(er);
                      }
                    });
                  }
                } else {
                  let count = new Cuenta({
                    Secuencial: cuenta.Secuencial,
                    codigo: cuenta.Codigo,
                    NombreTipoCuenta: cuenta.NombreTipoCuenta,
                    NombreEstado: cuenta.NombreEstado,
                    numerocliente: numerocliente,
                  });
                  count.save(async (er, countDB) => {
                    if (er) {
                      console.log(er);
                    }
                  });
                }
                if (err) {
                  console.log(err);
                }
              }
            );
          });
          /**END CUENTAS**/
          /**BEGIN DEPOSITOS**/
          depositos =
            result.DevuelveConsolidadoPorClienteResult.DatoConsolidado
              .DepositosAPlazo;

          if (depositos != null) {
            depositos = depositos.DepositoMaestroResumenParaConsolidado;
            if (!depositos.length) {
              depositos = [depositos];
            }
            depositos.forEach((deposito) => {
              Deposito.findOne(
                { secuencial: deposito.Secuencial },
                function (err, d) {
                  if (d) {
                    if (d.NombreEstado != deposito.NombreEstadoDeposito) {
                      d.NombreEstado = deposito.NombreEstadoDeposito;
                      d.save(async (er, deposDB) => {
                        if (er) {
                          console.log(er);
                        }
                      });
                    }
                  } else {
                    let depo = new Deposito({
                      secuencial: deposito.Secuencial,
                      NombreTipoDeposito: deposito.NombreTipoDeposito,
                      NombreEstadoDeposito: deposito.NombreEstadoDeposito,
                      numerocliente: numerocliente,
                    });
                    depo.save(async (er, deposDB) => {
                      if (er) {
                        console.log(er);
                      }
                    });
                  }
                  if (err) {
                    console.log(err);
                  }
                }
              );
            });
          }
          /**END CUENTAS**/
          /**BEGIN PRESTAMOS**/
          var prestamos =
            result.DevuelveConsolidadoPorClienteResult.DatoConsolidado
              .Prestamos;
          if (prestamos != null) {
            prestamos = prestamos.PrestamoMaestroResumenParaConsolidado;
            if (!prestamos.length) {
              prestamos = [prestamos];
            }
            prestamos.forEach((prestamo) => {
              Prestamo.findOne(
                { secuencial: prestamo.Secuencial },
                function (err, p) {
                  if (p) {
                    if (p.NombreEstado != prestamo.NombreEstadoPrestamo) {
                      p.NombreEstado = prestamo.NombreEstadoPrestamo;
                      p.save(async (er, prestamoDB) => {
                        if (er) {
                          console.log(er);
                        }
                      });
                    }
                  } else {
                    let pres = new Prestamo({
                      secuencial: prestamo.Secuencial,
                      NombreTipoPrestamo: prestamo.NombreTipoPrestamo,
                      NombreEstadoPrestamo: prestamo.NombreEstadoPrestamo,
                      numerocliente: numerocliente,
                    });
                    pres.save(async (er, prestamoDB) => {
                      if (er) {
                        console.log(er);
                      }
                    });
                  }
                  if (err) {
                    console.log(err);
                  }
                }
              );
            });
          }
          /**END PRESTAMOS**/
          res.json({ estado: esCorrecta, cuentas, depositos, prestamos });
        } else res.json({ estado: esCorrecta });
      });
    }
  });
};

/*
 **************************************
 ******** TRANSFERENCIA INTERNA *******
 **************************************
 */
const trasferenciai = (req, res) => {
  const { uid } = req;
  const { cuenta, monto } = req.body;
  const args = { numeroCuentaOrigen: uid };
};

/*
 ****************************
 ******** MOVIMIENTOS *******
 ****************************
 */
const movimiento = async (req = request, res = response) => {
  const { tipo, secuencial } = req.body;
  const { numerocliente } = req.uid;
  switch (tipo) {
    case "cuenta":
      Cuenta.find(
        {
          secuencial,
          NombreEstado: "ACTIVA",
          cliente: numerocliente,
        },
        function (err, cuenta) {
          if (err) {
            return res.status(400).json({
              ok: false,
              er: err,
            });
          }
          if (cuenta) {
            const { fini, ffin } = req.body;
            soap.createClient(url, function (err, client) {
              if (err) {
                console.log(err);
                return res.status(400).json({
                  ok: false,
                  opt: "movimientos",
                  err,
                });
              } else {
                client.DevuelveMovimientoCuentaPorSecuencial(
                  {
                    secuencialCuenta: secuencial,
                    fechaInicio: fini,
                    fechaFin: ffin,
                  },
                  function (er, result) {
                    if (er) {
                      console.log(
                        "Error al retornar datos del servicio 0003: " + er
                      );
                      return res.status(400).json({
                        ok: false,
                        er,
                      });
                    }
                    return res.json({ ok: true, result });
                  }
                );
              }
            });
          } else {
            return res.status(400).json({
              ok: false,
              er: "null",
            });
          }
        }
      );
      break;
    case "prestamo":
      Prestamo.find(
        { secuencial: secuencial, cliente: numerocliente },
        function (err, prestamo) {
          if (err) {
            console.log("Error al retornar prestamo 1 " + err);
            return res.status(400).json({
              ok: false,
              opt: "prestamo",
              err,
            });
          }
          if (prestamo) {
            soap.createClient(url, function (err, client) {
              if (err) {
                console.log(err);
                return res.status(400).json({
                  ok: false,
                  opt: "movimientosP",
                  err,
                });
              } else {
                client.DevuelveMovimientoPrestamoPorSecuencial(
                  { secuencialPrestamo: secuencial },
                  function (er, result) {
                    if (er) {
                      console.log(
                        "Error al retornar datos del servicio 0004: " + er
                      );
                      return res.status(400).json({
                        ok: false,
                        er,
                      });
                    }

                    console.log(result);
                    return res.json({ ok: true, result });
                  }
                );
              }
            });
          } else {
            console.log("Error al retornar prestamo 2 " + prestamo);
            return res.status(400).json({
              ok: false,
              opt: "prestamo",
              err,
            });
          }
        }
      );
      break;
  }
};

module.exports = {
  consolidado,
  movimiento,
  trasferenciai,
};
