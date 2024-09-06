const { Router } = require("express");
const { PreguntasSeguridadAll,formulario } = require('./../controllers/preguntasseguridad.controller');
const router = Router();

router.get('/all',PreguntasSeguridadAll);
router.post('/formulario',formulario);


module.exports = router;