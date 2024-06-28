const { response, request } = require("express");
const Usuario = require("../models/user");
const bcrypt = require("bcrypt");
const _ = require("underscore");
const soap = require("soap");
const { rest } = require("underscore");
const Tipoprestamo = require("../models/tipoprestamo");
const Tipotabla = require("../models/tipotabla");
const Segmentointerno = require("../models/segmentointerno");
const Subcalificacioncontable = require("../models/subcalificacioncontable");
const Tipodeposito = require("../models/tipodeposito");
const Dato = require("../models/dato");

/*SIMULADOR CREDITO tipos de prestamo*/
const tipoPrestamos = async (req, res) => {
  await Tipoprestamo.find({ estaActivo: 1 }, function (err, tipoprestamos) {
    if (err) {
      console.log(err);
      return res.status(500).json({
        ok: false,
        er,
      });
    }
    res.json({ tipoprestamos });
  });
};

/*SIMULADOR CREDITO tipos de tabla presuntiva*/
const tipoTablas = async (req, res) => {
  const { codigo } = req.body;
  await Tipoprestamo.findOne({ codigo }, function (err, tipopres) {
    if (err) {
      console.log(err);
      return res.status(500).json({
        ok: false,
        er,
      });
    }
    Tipotabla.find(
      { secuencial: tipopres.tipoTabla },
      function (err, tipotablas) {
        if (err) {
          console.log(err);
          return res.status(500).json({
            ok: false,
            er,
          });
        }
        res.json({ tipotablas });
      }
    );
  });
};

/*SIMULADOR CREDITO segmentos internos*/
const segmentoInternos = async (req, res) => {
  const { codigo } = req.body;
  await Tipoprestamo.findOne({ codigo }, function (err, tipopres) {
    if (err) {
      console.log(err);
      return res.status(500).json({
        ok: false,
        er,
      });
    }
    Segmentointerno.find(
      { secuencial: tipopres.segmentoInterno },
      function (err, segmentointernos) {
        if (err) {
          console.log(err);
          return res.status(500).json({
            ok: false,
            er,
          });
        }
        res.json({ segmentointernos });
      }
    );
  });
};

/*SIMULADOR CREDITO sub calificación contable*/
const subcalificaciones = async (req, res) => {
  const { secuencial } = req.body;
  console.log(secuencial);
  await Segmentointerno.findOne(
    { secuencial },
    function (err, segmentointerno) {
      if (err) {
        console.log(err);
        return res.status(500).json({
          ok: false,
          er,
        });
      }
      Subcalificacioncontable.find(
        { codigo: segmentointerno.subCalificacion },
        function (err, subcalificacion) {
          if (err) {
            console.log(err);
            return res.status(500).json({
              ok: false,
              er,
            });
          }
          res.json({ subcalificacion });
        }
      );
    }
  );
};

/*SIMULADOR CREDITO*/
const prestamo = async (req, res) => {
  const {
    tipoPrestamo,
    tipoTabla,
    segmentoInterno,
    subcalificacion,
    fecha,
    monto,
    diaFijo,
    numCuotas,
    frecuenciaPago,
  } = req.body;
  //segmentoInterno,

  const args = {
    codigoTipoPrestamo: tipoPrestamo,
    montoSolicitado: monto,
    numeroCuotas: numCuotas,
    frecuenciaPago: 30,
    fechaAdjudicacion: fecha,
    secuencialCondicionTablaAmortizacion: tipoTabla,
    diaDePago: diaFijo,
    codigoSubcalificacion: subcalificacion,
  };
  console.log(args)
  soap.createClient(url, function (err, client) {
    if (err) {
      console.log(err);
      return res.status(400).json({
        ok: false,
        opt: "cliente",
        err,
      });
    } else {
      client.DevuelveTablaPresuntivaParaSitio(args, function (er, result) {
        if (er) {
          console.log("Error al retornar datos del servicio: " + er);
          return res.status(400).json({
            ok: false,
            opt: "datos",
            er,
          });
        }
        console.log(result)
        res.json({ result });
      });
    }
  });
};

/*SIMULADOR AHORRO PROGRAMADO*/
const ahorroinversion = async (req, res) => {
  const {
    montoApertura,
    plazoEnDias,
    aumentoCapital,
    fechaCancelacion,
  } = req.body;
  const args = {
    aumentoCapital,
    diaCobro: fechaCancelacion,
    plazoEnDias,
    valorApertura: montoApertura,
  };
  soap.createClient(url, function (err, client) {
    if (err) {
      console.log(err);
      return res.status(400).json({
        ok: false,
        opt: "cliente",
        err,
      });
    } else {
      client.SimuladorAhorroInversion(args, function (er, result) {
        if (er) {
          console.log("Error al retornar datos del servicio: " + er);
          return res.status(400).json({
            ok: false,
            opt: "Ahorro",
            er,
          });
        }
        res.json({ result });
      });
    }
  });
};

/*SIMULADOR INVERSION tipos de depositos*/
const tipoDepositos = async (req, res) => {
  await Tipodeposito.find({ estaActivo: 1 }, function (err, tipodepositos) {
    if (err) {
      console.log(err);
      return res.status(500).json({
        ok: false,
        er,
      });
    }
    res.json({ tipodepositos });
  });
};

/*SIMULADOR INVERSION*/
const inversion = async (req, res) => {
  const {
    codigoTipoDeposito,
    monto,
    plazoEnDias,
    numeroDiasPeriodico,
  } = req.body;
  const args = {
    codigoTipoDeposito,
    monto,
    plazoEnDias,
    numeroDiasPeriodico,
  };
  soap.createClient(url, function (err, client) {
    if (err) {
      console.log(err);
      return res.status(400).json({
        ok: false,
        opt: "cliente",
        err,
      });
    } else {
      client.SimuladorPlazoFijo(args, function (er, result) {
        if (er) {
          console.log("Error al retornar datos del servicio: " + er);
          return res.status(400).json({
            ok: false,
            opt: "inversion",
            er,
          });
        }
        res.json({ result });
      });
    }
  });
};

const url = process.env.SOAP;
module.exports = {
  tipoPrestamos,
  tipoTablas,
  segmentoInternos,
  subcalificaciones,
  prestamo,
  ahorroinversion,
  inversion,
  tipoDepositos,
};
