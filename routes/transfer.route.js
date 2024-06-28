const { Router } = require("express");
const { check } = require("express-validator");
const router = Router();
const {
  beneficiarioInternoRegister,
  interna,
  internav2,
  beneficiarios,
  deleteBeneficiario,
  BeneficiarioExternoRegister,
  BeneficiariosExternos,
  deleteBeneficiarioExterno,
  comprobantes,
  instituciones,
  tipoinstituciontransferencia,
  tipocuenta,
  origen,
  destino,
  concepto,
  beneficiario,
  externa,
  verificarNumeroCuentayNick,
  registrarNuevoBeneficiario,
  verificarNumeroCuentayNickBeneficiariosInterbancarios,
  RegistrarBeneficiarioInterbancarioV2,
  transferenciaexternav2
} = require("../controllers/transfer.controller");
const { validateFields, validate } = require("../middlewares/validate-fields");
const { body } = require("express-validator");
const { validateJWT, validarJWTv2 } = require("../middlewares/validate-jwt");

router.post(
  "/register/beneficiarioi",
  [
    check("nick", "Se requiere apodo").not().isEmpty(),
    check("email", "Se requiere correo").not().isEmpty(),
    check("cuenta", "Se requiere cuenta").not().isEmpty(),
    check("identificacion", "Se requiere identificación").not().isEmpty(),
    validateJWT,
    validateFields,
  ],
  beneficiarioInternoRegister
);

router.post(
  "/interna",
  [
    check("id", "Se requiere usuario").not().isEmpty(),
    check("monto", "Se requiere monto a transferir").not().isEmpty(),
    validateJWT,
    validateFields,
  ],
  interna
);

router.post("/internav2",
  validate(
    [
      body('id').not().isEmpty().escape(),
      body('monto').not().isEmpty().escape(),
      body('cuentaorigen').not().isEmpty().escape(),
      body('cuentaorigen').isString(),
    ]
  ),
  validarJWTv2,
  internav2
);

router.post("/tresferenciaexternav2",
  validate(
    [
      body('idbeneficiario').not().isEmpty().escape(),
      body('idbeneficiario').isString(),
      body('monto').not().isEmpty().escape(),
      body('detalle').not().isEmpty().escape(),
      body('detalle').isString(),
      body('cuentaorigen').not().isEmpty().escape(),
      body('cuentaorigen').isString(),
    ],
  ),
  validarJWTv2,
  transferenciaexternav2
);

router.post(
  "/register/beneficiarioexterno",
  [
    check("nick", "Se requiere apodo").not().isEmpty(),
    check("email", "Se requiere correo").not().isEmpty(),
    check("identificacion", "Se requiere identificación").not().isEmpty(),
    check("nombre", "Se requiere Nombre").not().isEmpty(),
    check(
      "codigoConceptoTransferencia",
      "Se requiere concepto de transferencia"
    )
      .not()
      .isEmpty(),
    check("codigoTipoCuentaTransferencia", "Se requiere Tipo de Cuenta")
      .not()
      .isEmpty(),
    check(
      "secuencialInstitucionTransferencia",
      "Se requiere Institución Financiera"
    )
      .not()
      .isEmpty(),
    check(
      "numeroCuentaBeneficiario",
      "Se requiere numero de cuenta de beneficiario"
    )
      .not()
      .isEmpty(),

    validateJWT,
    validateFields,
  ],
  BeneficiarioExternoRegister
);

router.post(
  "/externa",
  [
    check("id", "Se requiere usuario").not().isEmpty(),
    check("monto", "Se requiere monto a transferir").not().isEmpty(),
    check("detalle", "Se requiere detalle de transferencia").not().isEmpty(),
    validateJWT,
    validateFields,
  ],
  externa
);

router.get("/comprobantes", [validateJWT], comprobantes);
router.post("/beneficiario", [validateJWT], beneficiario);
router.get("/delete/beneficiarioi/:id", [validateJWT], deleteBeneficiario);
router.get("/beneficiarios", [validateJWT], beneficiarios);
router.get(
  "/delete/beneficiarioexterno/:id",
  [validateJWT],
  deleteBeneficiarioExterno
);
router.get("/beneficiariosexternos", [validateJWT], BeneficiariosExternos);
router.get("/instituciones/:tipo", [validateJWT], instituciones);
router.get("/tipoinstitucion", [validateJWT], tipoinstituciontransferencia);
router.get("/tipocuenta", [validateJWT], tipocuenta);
router.get("/destino", [validateJWT], destino);
router.get("/origen", [validateJWT], origen);
router.get("/concepto", [validateJWT], concepto);

router.post('/verificar-cuenta-nick',
  validate(
    [
      body('nick').not().isEmpty().escape(),
      body('nick').isLength({ min: 3, max: 30 }),
      body('nick').isString(),

      body('cuenta').not().isEmpty().escape(),
      body('cuenta').isLength({ min: 11, max: 14 }),
      body('cuenta').isString(),

      body('identificacionbeneficiario').not().isEmpty().escape(),
      body('identificacionbeneficiario').isLength({ min: 8, max: 15 }),
      body('identificacionbeneficiario').isString(),
    ]
  ),
  validarJWTv2,
  verificarNumeroCuentayNick
)

router.post('/verificar-cuenta-nick-beneficiario-interbancario',
  validate(
    [
      body('nick').not().isEmpty().escape(),
      body('nick').isLength({ min: 3, max: 30 }),
      body('nick').isString(),

      body('cuenta').not().isEmpty().escape(),
      body('cuenta').isLength({ min: 8, max: 16 }),
      body('cuenta').isString(),

      body('identificacionbeneficiario').not().isEmpty().escape(),
      body('identificacionbeneficiario').isLength({ min: 8, max: 15 }),
      body('identificacionbeneficiario').isString(),
    ]
  ),
  validarJWTv2,
  verificarNumeroCuentayNickBeneficiariosInterbancarios
)

router.post('/registrarbeneficiario',
  validate(
    [
      body('nick').not().isEmpty().escape(),
      body('nick').isLength({ min: 3, max: 30 }),
      body('nick').isString(),

      body('cuenta').not().isEmpty().escape(),
      body('cuenta').isLength({ min: 11, max: 14 }),
      body('cuenta').isString(),

      body('identificacionbeneficiario').not().isEmpty().escape(),
      body('identificacionbeneficiario').isLength({ min: 8, max: 15 }),
      body('identificacionbeneficiario').isString(),

      body('email').not().isEmpty().escape(),
      body('email').isString(),

      body('codigootp').not().isEmpty().escape(),
      body('codigootp').isLength({ min: 6, max: 6 }),
      body('codigootp').isString(),
    ]
  ),
  validarJWTv2,
  registrarNuevoBeneficiario
)

router.post('/registrarbeneficiariointerbancario',
  validate(
    [
      body('nombre').not().isEmpty().escape(),
      body('nombre').isLength({ min: 3, max: 100 }),
      body('nombre').isString(),

      body('email').not().isEmpty().escape(),
      body('email').isString(),

      body('nick').not().isEmpty().escape(),
      body('nick').isLength({ min: 3, max: 30 }),
      body('nick').isString(),

      body('identificacionbeneficiario').not().isEmpty().escape(),
      body('identificacionbeneficiario').isLength({ min: 8, max: 15 }),
      body('identificacionbeneficiario').isString(),

      body('tipoIdentificacion').not().isEmpty().escape(),
      body('tipoIdentificacion').isLength({ min: 1, max: 3 }),
      body('tipoIdentificacion').isString(),

      body('codConceptoTransferencia').not().isEmpty().escape(),
      body('codConceptoTransferencia').isLength({ min: 2, max: 3 }),
      body('codConceptoTransferencia').isString(),

      body('codTipoCuentaTransferencia').not().isEmpty().escape(),
      body('codTipoCuentaTransferencia').isLength({ min: 2, max: 3 }),
      body('codTipoCuentaTransferencia').isString(),

      body('secuencialInstitucionTransferencia').not().isEmpty().escape(),
      body('secuencialInstitucionTransferencia').isLength({ min: 1, max: 4 }),
      body('secuencialInstitucionTransferencia').isString(),

      body('numeroCuentaBeneficiario').not().isEmpty().escape(),
      body('numeroCuentaBeneficiario').isLength({ min: 8, max: 16 }),
      body('numeroCuentaBeneficiario').isString(),

      body('codigootp').not().isEmpty().escape(),
      body('codigootp').isLength({ min: 6, max: 6 }),
      body('codigootp').isString(),
    ]
  ),
  validarJWTv2,
  RegistrarBeneficiarioInterbancarioV2
)

module.exports = router;
