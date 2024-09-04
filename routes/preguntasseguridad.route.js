const { Router } = require("express");
const { PreguntasSeguridadAll } = require('./../controllers/preguntasseguridad.controller');
const router = Router();

router.get('/all',PreguntasSeguridadAll);


module.exports = router;