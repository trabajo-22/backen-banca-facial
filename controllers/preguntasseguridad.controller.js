const Preguntasseguridad = require("../models/preguntasseguridad");

const PreguntasSeguridadAll = async (req, res) => {
    /*
    let preguntaSeguridad = new Preguntasseguridad({
        pregunta:"¿Actualmente tienes una inversión en COAC Futuro Lamanense?",
        estado: true,
        grupo: 2
    })
    await preguntaSeguridad.save();
    */

    Preguntasseguridad.find({ estado: true },
        function (err, result) {
            if (err) {
                return res.status(400).json({ "error": err });
            }
            return res.json({ preguntas: result });
        }
    );

    
};

module.exports = {
    PreguntasSeguridadAll
}