const { mongo } = require("mongoose");
const Preguntasseguridad = require("../models/preguntasseguridad");
const configsql = require("../database/sqlserver");
const sql = require("mssql");
// FORMULARIO VER SI EXISTE INVERSION, CREDITO,CODIGO,FECHA

const formulario = async (req, res) =>{
    const {identificacion} = req.body;
    // const identificacion = req.user;
    var dataResult = [];

        let sqlQuery = ` SELECT 

            (SELECT COUNT(*) 
             FROM Personas.Persona PP
             INNER JOIN Clientes.Cliente CC ON CC.secuencialPersona = PP.secuencial
             INNER JOIN Cartera.PrestamoCliente CP ON CP.secuencialCliente = CC.secuencial
             INNER JOIN Cartera.PrestamoMaestro CPM ON CPM.secuencial = CP.secuencialPrestamo
             WHERE CPM.codigoEstadoPrestamo = 'A'
             AND PP.identificacion = @identificacion
            ) AS credito,
            
            (SELECT COUNT(*) 
             FROM Personas.Persona PP
             INNER JOIN Clientes.Cliente CC ON CC.secuencialPersona = PP.secuencial
             INNER JOIN CaptacionesPlazo.DepositoCliente CD ON CD.secuencialCliente = CC.secuencial
             INNER JOIN CaptacionesPlazo.DepositoMaestro CDM ON CDM.secuencial = CD.secuencialDeposito
             WHERE PP.identificacion = @identificacion
             AND CDM.codigoEstadoDeposito = 'A'
            ) AS inversion,
            
            (SELECT TOP 1 codigoIndividualDactilar
                FROM Personas.Persona PP
                INNER JOIN Clientes.Cliente CC ON CC.secuencialPersona = PP.secuencial
                INNER JOIN Personas.Persona_NaturalCodigoDactilar PPN ON PPN.secuencialPersonaNatural = PP.secuencial 
                WHERE PP.identificacion = @identificacion
                ) AS codigoDactilar,

            (SELECT TOP 1 PN.fechaNacimiento
            FROM Personas.Persona PP
            INNER JOIN Personas.Persona_Natural PN ON PN.secuencialPersona = PP.secuencial
            WHERE PP.identificacion = @identificacion
            ) AS fechaNacimiento
            
            `
    
    let cnn = await sql.connect(configsql)
    let result = await cnn.request()
        .input('identificacion', sql.VarChar(15), identificacion)
        .query(sqlQuery)
        
        dataResult = result.recordset[0]
        await cnn.close()
    
        res.status(200).json({ "response": dataResult });
  }

  







const PreguntasSeguridadAll = async (req, res) => {
//  let preguntaSeguridad = new Preguntasseguridad({
//         pregunta:"Actualmente tiene una crédito en nuestra institución?.",
//         estado: true,
//         grupo: 2
//     })
//     await preguntaSeguridad.save();


    try {
        const result = await Preguntasseguridad.aggregate([{ $sample: { size: 1 } }]);
       
        return res.json(result );

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
