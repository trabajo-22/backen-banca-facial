const Preguntasseguridad = require("../models/preguntasseguridad");

const PreguntasSeguridadAll = async (req, res) => {
//  let preguntaSeguridad = new Preguntasseguridad({
//         pregunta:"Actualmente tiene una inversón en nuestra institución",
//         estado: true,
//         grupo: 1
//     })
//     await preguntaSeguridad.save();

    try {
        const result = await Preguntasseguridad.find();
        console.log('data',result)
        return res.json(result[0] );

    } catch (err) {
        console.error('Error:', err);
        return res.status(400).json({ error: err.message });
    }
     
};







    




module.exports = {
    PreguntasSeguridadAll
}











    // let preguntaSeguridad = new Preguntasseguridad({
    //     pregunta:"¿Actualmente tienes una inversión en COAC Futuro Lamanense?",
    //     estado: true,
    //     grupo: 2
    // })
    // await preguntaSeguridad.save();


    // Preguntasseguridad.find(
    //     function (err, result) {
    //         console.log('mi respuesta:', result)
    //         if (err) {
    //             return res.status(400).json({ "error": err });
    //         }
    //         return res.json({ preguntas: result });
    //     }
    // );
