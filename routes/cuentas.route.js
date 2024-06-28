const { Router } = require("express");
const { GetTipoCuentasPorCliente, getCuentaOne, GetCuentaAhorrosCliente } = require('./../controllers/cuentas.controller');
const { validarJWTv2 } = require("../middlewares/validate-jwt");
const { validate } = require("../middlewares/validate-fields");
const { body } = require("express-validator");

const router = Router();

router.get('/tipo-cuentas-porcliente', [validarJWTv2], GetTipoCuentasPorCliente);
router.get('/cuenta-ahorro-cliente', [validarJWTv2], GetCuentaAhorrosCliente);

router.post('/cuentaone',
    validate(
        [
            body('secuencialcuenta').not().isEmpty().escape(),
            body('secuencialcuenta').isLength({ min: 4, max: 8 }),
            body('secuencialcuenta').isInt()
        ]
    ),
    validarJWTv2,
    getCuentaOne
);

module.exports = router;