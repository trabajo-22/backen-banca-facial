const { Router } = require("express");
const { check } = require("express-validator");
const router = Router();
const { renewtokenv2, loginv2 } = require("../controllers/auth.controller");
const { validarJWTv2 } = require("../middlewares/validate-jwt");

router.post(
  "/loginv2",
  [
    check("nick", "Se requiere usuario").not().isEmpty(),
    check("password", "Se requiere el password").not().isEmpty(),
  ],
  loginv2
);

router.get("/renewtokenv2", [validarJWTv2], renewtokenv2);

module.exports = router;
