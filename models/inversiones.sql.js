const configsql = require("../database/sqlserver");
const sql = require("mssql");

const DevuelveInversionesPorNumCliente = async (identificacion) => {
    var dataResult = [];

    let sqlQuery = `SELECT 
                        secuencialDeposito secuencial, 
                        NP.nombre producto, 
                        TD.nombre tipo, 
                        DM.monto, 
                        ED.nombre estado, 
                        DM.fechaCreacion, 
                        DM.fechaVencimiento, 
                        DM.tasa + DM.sobreTasa interesefectivoanual, 
                        DM.plazoEnDias,
                        OO.ciudad	
                    FROM CaptacionesPlazo.DepositoCliente  DC
                    INNER JOIN CaptacionesPlazo.DepositoMaestro DM ON DM.secuencial = DC.secuencialDeposito
                    INNER JOIN CaptacionesPlazo.TipoDeposito TD ON TD.codigo = DM.codigoTipoDeposito
                    INNER JOIN NegociosFinancieros.Producto_Plazo PP ON PP.codigoProducto = DM.codigoProductoPlazo
                    INNER JOIN NegociosFinancieros.Producto NP ON NP.codigo = PP.codigoProducto
                    INNER JOIN CaptacionesPlazo.EstadoDeposito ED on ED.codigo = DM.codigoEstadoDeposito
                    INNER JOIN Organizaciones.Oficina OO ON OO.secuencialDivision = DM.secuencialOficina
                    INNER JOIN Clientes.Cliente CC ON CC.secuencial = DC.secuencialCliente
                    INNER JOIN Personas.Persona PE ON PE.secuencial = CC.secuencialPersona 
                    WHERE identificacion = @identificacion`

    let cnn = await sql.connect(configsql)
    let result = await cnn.request()
        .input('identificacion', sql.VarChar(15), identificacion)
        .query(sqlQuery)

    dataResult = result.recordset
    await cnn.close()

    return dataResult
}


module.exports = {
    DevuelveInversionesPorNumCliente
};