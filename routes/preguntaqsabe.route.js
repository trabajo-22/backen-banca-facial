const { Router } = require("express");
const { guardarPreguntaSabe,listarPreguntasPorUsuario, verifcarSiTienePregunta} = require('../controllers/preguntaqsabe.controller');
const {  validarToken } = require("../middlewares/validate-jwt");
const router = Router();

router.post('/tienePregunta',  verifcarSiTienePregunta);
router.post('/create',guardarPreguntaSabe);
router.get('/listarPregunta/:idusuario',listarPreguntasPorUsuario);


module.exports = router;