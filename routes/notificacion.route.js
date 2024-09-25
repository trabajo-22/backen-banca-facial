const { Router } = require("express");
const router = Router();

const {notificacion} = require("../controllers/notificacionController");

router.post("/enviar", notificacion);


module.exports = router;
