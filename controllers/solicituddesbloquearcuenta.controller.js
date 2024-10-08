const Solicituddesbloquearcuenta = require("../models/solicituddesbloquearcuenta");

const guardarSolicitudDesbloquear = async (identificacion) => {
    let fechaActual = new Date().toLocaleDateString('es-EC', { timeZone: 'America/Guayaquil' });
    //let horaActual = new Date().toLocaleTimeString('es-EC', { timeZone: 'America/Guayaquil' });

    let solicitud = new Solicituddesbloquearcuenta({
        identificacion: identificacion,
        fechadate: new Date(),
        fechastring: fechaActual
    });

    await solicitud.save();
}



const verificarMaximoSolicitudPorDia = async (identificacion) => {
    let fechastring = new Date().toLocaleDateString('es-EC', { timeZone: 'America/Guayaquil' });
    let data = await Solicituddesbloquearcuenta.find({ fechastring, identificacion });
    if (data.length >= 2) {
        return true;
    } else {
        return false;
    }
}


module.exports = {
    guardarSolicitudDesbloquear,
    verificarMaximoSolicitudPorDia
}