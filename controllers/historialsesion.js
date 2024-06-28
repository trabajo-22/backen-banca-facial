const Historialsesion = require("../models/historialsesion");
const requestIp = require('request-ip');
const { enviarEmailInicioSesion } = require("../emails/Iniciosesion");
const { obtenerDatosCliente } = require("../controllers/users.controller");

const guardarHistorialSesion = async (req, res) => {
    const identificacion = req.user;
    const { dispositivo } = req.body;

    var clientIp = requestIp.getClientIp(req)

    let fechaActual = new Date().toLocaleDateString('es-EC', { timeZone: 'America/Guayaquil' });
    let horaActual = new Date().toLocaleTimeString('es-EC', { timeZone: 'America/Guayaquil' });

    let historial = new Historialsesion({
        ip: clientIp,
        fecha: fechaActual + ' ' + horaActual,
        dispositivo: dispositivo,
        identificacion: identificacion
    });

    await historial.save();

    // obtener email
    let cliente = await obtenerDatosCliente(identificacion);

    await enviarEmailInicioSesion(cliente.email, cliente.nombres, fechaActual + ' ' + horaActual, dispositivo.split("-")[0], clientIp.split("ffff:")[1])

    res.status(200).json({ "response": "Registrado" });
}

const getAllHistorialSesion = async (req, res) => {
    const identificacion = req.user;

    let historial = await Historialsesion.find({ identificacion: identificacion });

    res.status(200).json({ "response": historial });
}

module.exports = {
    guardarHistorialSesion,
    getAllHistorialSesion
}