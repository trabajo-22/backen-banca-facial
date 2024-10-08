const Solicitudrecuperarusuario = require("../models/solicitudrecuperarusuario");

const guardarSolicitudRecuperarUsuario = async (identificacion) => {
    let fechaActual = new Date().toLocaleDateString('es-EC', { timeZone: 'America/Guayaquil' });
    //let horaActual = new Date().toLocaleTimeString('es-EC', { timeZone: 'America/Guayaquil' });

    let solicitud = new Solicitudrecuperarusuario({
        identificacion: identificacion,
        fechadate: new Date(),
        fechastring: fechaActual
    });

    await solicitud.save();
}



const verificarMaximoSolicitudRecuperarUserPorDia = async (identificacion) => {
    let fechastring = new Date().toLocaleDateString('es-EC', { timeZone: 'America/Guayaquil' });
    let data = await Solicitudrecuperarusuario.find({ fechastring, identificacion });
    if (data.length >= 3) {
        return true;
    } else {
        return false;
    }
}



module.exports = {
    guardarSolicitudRecuperarUsuario,
    verificarMaximoSolicitudRecuperarUserPorDia
}