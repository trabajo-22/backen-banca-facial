const configsql = require("../database/sqlserver");
const sql = require("mssql");

const DevuelveRespuesta = async (identificacion) => {
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

    return dataResult
}

module.exports = {
    DevuelveRespuesta
}