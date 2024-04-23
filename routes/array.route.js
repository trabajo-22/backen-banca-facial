const { Router } = require("express");
const { check } = require("express-validator");
const router = Router();
const { consolidado, movimiento, trasferenciai } = require("../controllers/array.controller");
const { validateFields, isRoleValido } = require("../middlewares/validate-fields");
const { validateJWT } = require("../middlewares/validate-jwt");

router.get("/consolidado", [validateJWT, isRoleValido], consolidado);

router.post("/movimientoc",
  [
    check("num", "Se requiere numero de cuenta").not().isEmpty(),
    check("fini", "Se requiere rango inicio").not().isEmpty(),
    check("ffin", "Se requiere rango fin").not().isEmpty(),
    check("tipo", "Se requiere tipo de movimiento").not().isEmpty(),
    validateJWT,
    isRoleValido,
  ],
  movimiento
);
router.post("/movimientop",
  [
    check("num", "Se requiere rango fin").not().isEmpty(),
    check("tipo", "Se requiere numero de cuenta").not().isEmpty(),
    validateJWT,
    isRoleValido,
  ],
  movimiento
);

router.post("/trasferenciai",
  [
    check("cuenta", "Se requiere numero de cuenta").not().isEmpty(),
    check("monto", "Se requiere monto a transferir").not().isEmpty(),
    validateJWT,
    isRoleValido,
  ],
  trasferenciai
);

//[validateJWT],
module.exports = router;
