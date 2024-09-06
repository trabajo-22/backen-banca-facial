const { Router } = require("express");
const { check } = require("express-validator");
const {
  validateFields,
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
  VerificarClientePorIdentificacion,
  generarCodigoOTP,
  RegistroUsuarioConOTP,
  cambiarContrasena,
  verificarContraseniaActual,
  verificarSiClevesFueronUtilizadas,
  verificarSiExisteNick,
  enviarContrasenaTemporal,
  nuevasContrasena,
  verificaCheckTemporal,
  enviarCodigoOTPRecuperarUsuario,
  enviarUsuarioRecuperarPorEmail,
  verificaCodigo,
  enviarCodigoOTPDesbloquearCuenta,
  cambiarEstado
} = require("../controllers/users.controller");
const { validate } = require("../middlewares/validate-fields");
const { body } = require("express-validator");
const { validateJWT, validarJWTv2, validarJWTRecuperacionContrasena } = require("../middlewares/validate-jwt");
const router = Router();


router.post('/VerificarCedula',
  validate([
    body('identificacion').isLength({min:9, max:15})
  ]),
  enviarCodigoOTPDesbloquearCuenta)


router.post('/cambiarDesbloqueoUser', cambiarEstado)


// recuperar codigo OTP
router.post('/enviar-email-recuperar-codigo-otp',
  validate(
    [
      body('codigootp').not().isEmpty().escape(),
      body('codigootp').isLength({ min: 6, max: 6 }),
      body('codigootp').isString(),
    ]
  ),
  validarJWTv2,
  verificaCodigo
);



// recuperar user
router.post('/enviar-email-recuperar-user',
  validate(
    [
      body('codigootp').not().isEmpty().escape(),
      body('codigootp').isLength({ min: 6, max: 6 }),
      body('codigootp').isString(),
    ]
  ),
  validarJWTv2,
  enviarUsuarioRecuperarPorEmail
);

// envia codigo OTP para recuperar usuario
router.post('/enviar-codigootp-recuperar-user',
  validate(
    [
      body('identificacion').not().isEmpty().escape(),
      body('identificacion').isLength({ min: 8, max: 15 }),
      body('identificacion').isString()
    ]
  ),
  enviarCodigoOTPRecuperarUsuario
);

router.get("/verificarchecktemporal", [validarJWTRecuperacionContrasena], verificaCheckTemporal);

// cambiar nueva contraseña
router.post('/cambiar-nueva-contrasena',
  validate(
    [
      body('contrasena1').not().isEmpty().escape(),
      body('contrasena1').isLength({ min: 6, max: 20 }),
      body('contrasena1').isString(),

      body('contrasena2').not().isEmpty().escape(),
      body('contrasena2').isLength({ min: 6, max: 20 }),
      body('contrasena2').isString(),
    ]
  ),
  validarJWTRecuperacionContrasena,
  nuevasContrasena
);

// envia contraseña temporal
router.post('/enviar-contrasena-temporal',
  validate(
    [
      body('identificacion').not().isEmpty().escape(),
      body('identificacion').isLength({ min: 8, max: 15 }),
      body('identificacion').isString()
    ]
  ),
  enviarContrasenaTemporal
);


// verifica la identidad del usuario
router.post('/verificarcliente',
  validate(
    [
      body('identificacion').not().isEmpty().escape(),
      body('identificacion').isLength({ min: 8, max: 15 }),
      body('identificacion').isString()
    ]
  ),
  VerificarClientePorIdentificacion
);

// envia código otp
router.post('/solicitudotp', validarJWTv2, generarCodigoOTP)

// registrar usuario con código otp
router.post('/registeruser',
  validate(
    [
      body('codigootp').not().isEmpty().escape(),
      body('codigootp').isLength({ min: 6, max: 6 }),
      body('codigootp').isString(),

      body('nick').not().isEmpty().escape(),
      body('nick').isLength({ min: 8, max: 15 }),
      body('nick').isString(),

      body('password').not().isEmpty().escape(),
      body('password').isLength({ min: 6, max: 20 }),
      body('password').isString(),
    ]
  ),
  validarJWTv2,
  RegistroUsuarioConOTP
)


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

router.post("/pass",
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

router.post("/cambiarcontrasena",
  validate(
    [
      body('codigootp').not().isEmpty().escape(),
      body('codigootp').isLength({ min: 6, max: 6 }),
      body('codigootp').isString(),

      body('nuevaclave').not().isEmpty().escape(),
      body('nuevaclave').isLength({ min: 6, max: 20 }),
      body('nuevaclave').isString(),
    ]
  ),
  validarJWTv2,
  cambiarContrasena
);

router.post("/verificarclaveactual",
  validate(
    [
      body('claveactual').not().isEmpty().escape(),
      body('claveactual').isLength({ min: 6, max: 20 }),
      body('claveactual').isString(),
    ]
  ),
  validarJWTv2,
  verificarContraseniaActual
);

router.post("/verificarnick",
  validate(
    [
      body('nick').not().isEmpty().escape(),
      body('nick').isLength({ min: 8, max: 15 }),
      body('nick').isString(),
    ]
  ),
  verificarSiExisteNick
);

router.post("/verificarsiclavefueutilizada",
  validate(
    [
      body('nuevaclave').not().isEmpty().escape(),
      body('nuevaclave').isLength({ min: 6, max: 20 }),
      body('nuevaclave').isString(),
    ]
  ),
  validarJWTv2,
  verificarSiClevesFueronUtilizadas
);

router.get("/renewcheck", [validateJWT], renewcheck);
router.post("/validate", [validateJWT], passwordValidate);


module.exports = router;
