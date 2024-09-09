const { Router } = require("express");
const { check } = require("express-validator");
const router = Router();
const {  movimiento } = require("../controllers/array.controller");
const { validateJWT } = require("../middlewares/validate-jwt");


//-------------- Migrar
router.post("/movimientoc",
  [
    check("num", "Se requiere numero de cuenta").not().isEmpty(),
    check("fini", "Se requiere rango inicio").not().isEmpty(),
    check("ffin", "Se requiere rango fin").not().isEmpty(),
    check("tipo", "Se requiere tipo de movimiento").not().isEmpty(),
    validateJWT,
  ],
  movimiento
);


//[validateJWT],
module.exports = router;
