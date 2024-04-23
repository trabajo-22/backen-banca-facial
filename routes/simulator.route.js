const { Router } = require("express");
const router = Router();

const {
  tipoPrestamos,
  tipoTablas,
  segmentoInternos,
  subcalificaciones,
  prestamo,
  ahorroinversion,
  inversion,
  tipoDepositos,
} = require("../controllers/simulator.controller");

router.post("/inversion", inversion);
router.get("/tipodeposito", tipoDepositos);
router.post("/ahorroinversion", ahorroinversion);
router.post("/prestamo", prestamo);
router.get("/tipoprestamo", tipoPrestamos);
router.post("/tipotablas", tipoTablas);
router.post("/segmentointerno", segmentoInternos);
router.post("/subcalificacion", subcalificaciones);

module.exports = router;
