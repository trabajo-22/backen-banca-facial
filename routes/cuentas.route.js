const { Router } = require("express");
const { GetTipoCuentasPorCliente, getCuentaOne } = require('./../controllers/cuentas.controller');
const { validarJWTv2 } = require("../middlewares/validate-jwt");
const { check } = require("express-validator");

const router = Router();

router.get('/tipo-cuentas-porcliente', [validarJWTv2], GetTipoCuentasPorCliente);

router.post('/cuentaone',
    [
        check("secuencialcuenta", "Se requiere rango fin").not().isEmpty(),
        validarJWTv2,
    ], getCuentaOne
);


module.exports = router;