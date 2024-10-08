const configsql = require("../database/sqlserver");
const sql = require("mssql");

verificarSiTieneCuentasActivas = async (identificacion) => {
    let sqlQuery = `SELECT 
                          nombreUnido, 
                          numeroCliente, 
                          email, 
                          Cliente.secuencial, 
                          ( SELECT count(*) cantProductos from CaptacionesVista.CuentaCliente CC
                            INNER JOIN CaptacionesVista.CuentaMaestro CM ON CM.secuencial = CC.secuencialCuenta
                            WHERE secuencialCliente = Cliente.secuencial AND CM.codigoEstado = 'A'
                            AND (    CM.codigoTipoCuenta = '01                  ' 
                                  OR CM.codigoTipoCuenta = '02                  '
                                  OR CM.codigoTipoCuenta = '03                  '
                                  OR CM.codigoTipoCuenta = '07                  '
                                  OR CM.codigoTipoCuenta = '08                  '
                                  OR CM.codigoTipoCuenta = '09                  '
                                  OR CM.codigoTipoCuenta = '10                  ') )cantProductos
                      FROM Personas.Persona
                      INNER JOIN Clientes.Cliente ON Cliente.secuencialPersona = Persona.secuencial
                      WHERE identificacion = @identificacion `

    let cnn = await sql.connect(configsql)
    let result = await cnn.request()
        .input('identificacion', sql.VarChar(15), identificacion)
        .query(sqlQuery)

    let cliente = result.recordset[0]
    await cnn.close()
    return cliente
}

verificarSiEsSocio = async (identificacion) => {
    let sqlQuery = `SELECT 
                    ( SELECT count(*) cantProductos from CaptacionesVista.CuentaCliente CC
                    INNER JOIN CaptacionesVista.CuentaMaestro CM ON CM.secuencial = CC.secuencialCuenta
                    WHERE secuencialCliente = Cliente.secuencial AND CM.codigoEstado = 'A'
                    AND ( CM.codigoTipoCuenta = '00                  ' OR CM.codigoTipoCuenta = '09                  ' ) ) essocio
                    FROM Personas.Persona
                    INNER JOIN Clientes.Cliente ON Cliente.secuencialPersona = Persona.secuencial
                    WHERE identificacion = @identificacion `
    let cnn = await sql.connect(configsql)
    let result = await cnn.request()
        .input('identificacion', sql.VarChar(15), identificacion)
        .query(sqlQuery)

    let essocio = result.recordset[0].essocio
    await cnn.close()
    return essocio
}

obtenerDatosCliente = async (identificacion) => {
    let sqlQuery = `SELECT PE.nombreUnido nombres, PE.email, ISNULL(fechaNacimiento, '') fechaNacimiento, ISNULL(PN.esMasculino, 0) esMasculino, PT.nombre tipoidentificacion, OO.ciudad oficina, CC.numeroCliente  FROM Personas.Persona PE
                      LEFT JOIN Personas.Persona_Natural PN on PN.secuencialPersona = PE.secuencial
                      INNER JOIN Personas.TipoIdentificacion PT on PT.secuencial = PE.secuencialTipoIdentificacion
                      INNER JOIN Clientes.Cliente CC on CC.secuencialPersona = PE.secuencial
                      INNER JOIN Organizaciones.Oficina OO on OO.secuencialDivision = CC.secuencialOficina
                      WHERE identificacion = @identificacion `

    let cnn = await sql.connect(configsql)
    let result = await cnn.request()
        .input('identificacion', sql.VarChar(15), identificacion)
        .query(sqlQuery)

    let cliente = result.recordset[0]
    await cnn.close()
    return cliente
}


module.exports = {
    verificarSiTieneCuentasActivas,
    verificarSiEsSocio,
    obtenerDatosCliente
}
