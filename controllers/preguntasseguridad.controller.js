const { mongo } = require("mongoose");
const Preguntasseguridad = require("../models/preguntasseguridad");
const configsql = require("../database/sqlserver");
const sql = require("mssql");
const { DevuelveRespuesta } = require("../models/preguntasseguridad.sql");
// FORMULARIO VER SI EXISTE INVERSION, CREDITO,CODIGO,FECHA



const formulario = async (req, res) => {
    const { identificacion } = req.body;
    try {
        var dataResult = await DevuelveRespuesta(identificacion);
        res.status(200).json({ "response": dataResult });
    } catch (error) {
        res.status(400).json({ "error": error });
    }
}


const PreguntasSeguridadAll = async (req, res) => {
      try {
        const result = await Preguntasseguridad.aggregate([{ $sample: { size: 1 } }]);
        return res.json(result);
    } catch (err) {
        console.error('Error:', err);
        return res.status(400).json({ error: err.message });
    }
};


module.exports = {
    PreguntasSeguridadAll,
    formulario
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
