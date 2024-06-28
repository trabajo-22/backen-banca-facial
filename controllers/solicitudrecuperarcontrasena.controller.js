const Solicitudrecuperarcontrasena = require("../models/solicitudrecuperarcontrasena");

const guardarSolicitudRecuperarContrasenia = async (identificacion) => {
    let fechaActual = new Date().toLocaleDateString('es-EC', { timeZone: 'America/Guayaquil' });
    //let horaActual = new Date().toLocaleTimeString('es-EC', { timeZone: 'America/Guayaquil' });

    let solicitud = new Solicitudrecuperarcontrasena({
        identificacion: identificacion,
        fechadate: new Date(),
        fechastring: fechaActual
    });

    await solicitud.save();
}

const verificarMaximoSolicitudRecuperarContraPorDia = async (identificacion) => {
    let fechastring = new Date().toLocaleDateString('es-EC', { timeZone: 'America/Guayaquil' });
    let data = await Solicitudrecuperarcontrasena.find({ fechastring, identificacion });
    if (data.length >= 2) {
        return true;
    } else {
        return false;
    }
}

module.exports = {
    guardarSolicitudRecuperarContrasenia,
    verificarMaximoSolicitudRecuperarContraPorDia
}