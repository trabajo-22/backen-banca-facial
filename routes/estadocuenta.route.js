const { Router } = require("express");
const { getEstadoDeCuentas, getEstadoDeCuentaPDF } = require('./../controllers/estadocuenta.controller');
const { validarJWTv2 } = require("../middlewares/validate-jwt");
const { validate } = require("../middlewares/validate-fields");
const { body } = require("express-validator");

const router = Router();

router.post('/estadocuenta',
    validate(
        [
            body('secuencialcuenta').not().isEmpty().escape(),
            body('secuencialcuenta').isLength({ min: 4, max: 8 }),
            body('secuencialcuenta').isInt(),

            body('mes').not().isEmpty().escape(),
            body('mes').isLength({ min: 1, max: 2 }),
            body('mes').isInt(),

            body('anio').not().isEmpty().escape(),
            body('anio').isLength({ min: 4, max: 4 }),
            body('anio').isInt()
        ]
    ),
    validarJWTv2,
    getEstadoDeCuentas
);

router.post('/estadocuentapdf',
    validate(
        [
            body('secuencialcuenta').not().isEmpty().escape(),
            body('secuencialcuenta').isLength({ min: 4, max: 8 }),
            body('secuencialcuenta').isInt(),

            body('mes').not().isEmpty().escape(),
            body('mes').isLength({ min: 1, max: 2 }),
            body('mes').isInt(),

            body('anio').not().isEmpty().escape(),
            body('anio').isLength({ min: 4, max: 4 }),
            body('anio').isInt()
        ]
    ),
    validarJWTv2,
    getEstadoDeCuentaPDF
);

module.exports = router;