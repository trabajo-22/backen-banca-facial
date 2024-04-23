const { Router } = require("express");
const { GetPrestamoOne } = require('./../controllers/prestamo.controller');
const { validarJWTv2 } = require("../middlewares/validate-jwt");

const router = Router();

router.get('/prestamos', [validarJWTv2], GetPrestamoOne);


module.exports = router;