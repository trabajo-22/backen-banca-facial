const { Router } = require("express");
const { guardarHistorialSesion, getAllHistorialSesion } = require('./../controllers/historialsesion');
const { validarJWTv2 } = require("../middlewares/validate-jwt");
const { validate } = require("../middlewares/validate-fields");
const { body } = require("express-validator");

const router = Router();

router.post("/historialsesion",
    validate(
        [
            body('dispositivo').not().isEmpty().escape(),
            body('dispositivo').isLength({ min: 2 }),
            body('dispositivo').isString(),
        ]
    ),
    validarJWTv2,
    guardarHistorialSesion
);

router.get('/historial-sesion', [validarJWTv2], getAllHistorialSesion);

module.exports = router;