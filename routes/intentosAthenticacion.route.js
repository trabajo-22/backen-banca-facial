const { Router } = require("express");
const router = Router();

const {guardarSolicitudIntentoAuthenticacion, getverificarMaximoSolicitudPorDia,
    verificarDatosMetodo, verificarAlGuardar

} = require("../controllers/intentosAhutenticacion.controllers");

// router.post("/guardarIntentos", guardarSolicitudIntentoAuthenticacion);
// router.post("/getintentos", getverificarMaximoSolicitudPorDia);

router.post("/get", verificarDatosMetodo);
router.post("/guardar", verificarAlGuardar);

module.exports = router;
