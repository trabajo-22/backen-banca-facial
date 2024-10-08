const IntentosAuthenticacion = require("../models/intentoauthenticacion");



const verificarDatosMetodo = async (req, res) => {
    const { idusuario, metodo} = req.body
    let fecha = new Date().toLocaleDateString('es-EC', { timeZone: 'America/Guayaquil' });
    let data = await IntentosAuthenticacion.find({ fecha, idusuario, metodo  });
        if ( data.length >= 2 ) {
            res.status(400).json({ "error": "" });
            console.log('hay dos')
            return true;
        } else {
            console.log('hay uno')
            res.status(200).json({"message": "bien"})
            return false;
        }
}



const verificarAlGuardar = async (req, res) => {
    const { idusuario, metodo} = req.body
    let fecha = new Date().toLocaleDateString('es-EC', { timeZone: 'America/Guayaquil' });
    let data = await IntentosAuthenticacion.find({ fecha, idusuario, metodo  });
    if ( data.length >= 2 ) {
        res.status(400).json({ "error": "Superaste el número máximo de solicitudes de recuperación de cuenta, intentelo en 24 horas" });
        console.log('hay dos')
        return true;
    } else {
        console.log('hay uno')
        let solicitud = new IntentosAuthenticacion({
            idusuario: idusuario,
            metodo: metodo,
            fecha: fecha
        });
    await solicitud.save();

        res.status(200).json({"message": "bien"})
        return false;
    }
}




  



module.exports = {
    verificarAlGuardar,
    verificarDatosMetodo,
 
}