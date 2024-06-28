const { Router } = require("express");
const { GetInversionesPorNumCliente } = require('./../controllers/inversiones.controller');
const { validarJWTv2 } = require("../middlewares/validate-jwt");

const router = Router();

router.get('/inversiones-por-numcliente', [validarJWTv2], GetInversionesPorNumCliente);


module.exports = router;