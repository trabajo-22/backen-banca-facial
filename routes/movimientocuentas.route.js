const { Router } = require("express");
const { getMovimientoCuenta } = require('./../controllers/movimientocuentas.controller');
const { validarJWTv2 } = require("../middlewares/validate-jwt");
const { validate } = require("../middlewares/validate-fields");
const { body } = require("express-validator");

const router = Router();

router.post('/movimientoscuentasporfecha',
    validate(
        [
            body('secuencialcuenta').not().isEmpty().escape(),
            body('secuencialcuenta').isLength({ min: 4, max: 8 }),
            body('secuencialcuenta').isInt(),

            body('fechainicio').not().isEmpty().escape(),
            body('fechainicio').isLength({ min: 8, max: 8 }),
            body('fechainicio').isString(),

            body('fechafin').not().isEmpty().escape(),
            body('fechafin').isLength({ min: 8, max: 8 }),
            body('fechafin').isString()
        ]
    ),
    validarJWTv2,
    getMovimientoCuenta
);


module.exports = router;
