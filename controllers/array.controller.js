const { response, request } = require("express");
const Cuenta = require("../models/cuenta");
const Prestamo = require("../models/prestamo");
const soap = require("soap");

const url = process.env.SOAP;

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
  movimiento
};
