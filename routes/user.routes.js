const { Router } = require("express");
const { check } = require("express-validator");
const router = Router();
const {
  validateFields,
  existsCedula,
  existsCuenta,
  existsNick,
  isRoleAdmin,
  isCheckerTrue,
} = require("../middlewares/validate-fields");
const {
  usersR,
  userRegister,
  userDelete,
  userPassword,
  renewcheck,
  passwordValidate,
} = require("../controllers/users.controller");
const express = require("express");
const { validateJWT } = require("../middlewares/validate-jwt");

const app = express();

router.get("/list", usersR);
router.post(
  "/register",
  [
    check("cedula", "Se requiere la identificación").not().isEmpty(),
    check("cuenta", "Se requiere el numero de cuenta").not().isEmpty(),
    check("nick", "Se requiere el apodo").not().isEmpty(),
    validateFields,
    //existsCedula,
    //existsCuenta,
    existsNick,
  ],
  userRegister
);
router.delete("/statususer/:uid", [validateJWT, isRoleAdmin], userDelete);
router.post(
  "/pass",
  [
    check("password", "Se requiere el password")
      .isLength({ min: 8 })
      .not()
      .isEmpty(),
    check("passwordV", "Se requiere confirmación del password")
      //.isLength({ min: 8 })
      .not()
      .isEmpty(),
    validateJWT,
    isCheckerTrue,
  ],
  userPassword
);

router.get("/renewcheck", [validateJWT], renewcheck);
router.post("/validate", [validateJWT], passwordValidate);

module.exports = router;
