const { Router } = require("express");
const { check } = require("express-validator");
const router = Router();
const {
  beneficiarioInternoRegister,
  interna,
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
} = require("../controllers/transfer.controller");
const { validateFields } = require("../middlewares/validate-fields");
const { validateJWT } = require("../middlewares/validate-jwt");

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
module.exports = router;
