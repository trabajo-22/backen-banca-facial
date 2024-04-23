const { Router } = require("express");
const { check } = require("express-validator");
const router = Router();
const {
  login,
  checker,
  renewtoken,
  tokenValida,
} = require("../controllers/auth.controller");
const { validateFields } = require("../middlewares/validate-fields");
const { validateJWT, validarJWTv2 } = require("../middlewares/validate-jwt");

router.post(
  "/login",
  [
    check("nick", "Se requiere usuario").not().isEmpty(),
    check("password", "Se requiere el password").not().isEmpty(),
    validateFields,
  ],
  login
);

//router.get("/logout", logout);
router.post(
  "/check",
  [
    check("checker", "Se requiere el codigo para verificación").not().isEmpty(),
    validateFields,
    validateJWT,
  ],
  checker
);

router.get("/renewtoken", [validarJWTv2], renewtoken);
router.get("/tokenvalidator", [validarJWTv2], tokenValida);

module.exports = router;
