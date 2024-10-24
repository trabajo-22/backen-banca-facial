const configsql = require("../database/sqlserver");
const sql = require("mssql");

const DevuelveDatosDeUnaCuenta = async (secuencialcuenta) => {
    var dataResult = []
    let sqlQuery = `SELECT  
                        (select ISNULL(max(saldo),'0.000000') from CaptacionesVista.CuentaCliente
                        inner join Clientes.Cliente on Cliente.secuencial = CuentaCliente.secuencialCliente
                        inner join Personas.Persona on Persona.secuencial = Cliente.secuencialPersona
                        inner join CaptacionesVista.CuentaMaestro on CuentaMaestro.secuencial = CuentaCliente.secuencialCuenta
                        inner join CaptacionesVista.TipoCuenta on TipoCuenta.codigo = CuentaMaestro.codigoTipoCuenta
                        inner join CaptacionesVista.CuentaComponente_Vista on CuentaComponente_Vista.secuencialCuenta = CuentaMaestro.secuencial
                        where CuentaCliente.secuencialCuenta = @secuencialcuenta) saldo,
                            CuentaMaestro.codigo, 
                            CuentaMaestro.fechaSistemaCreacion fechaapertura,
                            EstadoCuenta.nombre estado,
                            Producto.nombre nombreproducto,
                            TipoCuenta.nombre tipo,
                            CuentaMaestro.secuencial,
                            Oficina.ciudad oficina
                    FROM CaptacionesVista.CuentaMaestro
                    inner join CaptacionesVista.EstadoCuenta ON EstadoCuenta.codigo = CuentaMaestro.codigoEstado
                    inner join CaptacionesVista.TipoCuenta ON TipoCuenta.codigo = CuentaMaestro.codigoTipoCuenta
                    inner join NegociosFinancieros.Producto ON Producto.codigo = CuentaMaestro.codigoProductoVista
                    inner join Organizaciones.Oficina ON Oficina.secuencialDivision = CuentaMaestro.secuencialOficina
                    where CuentaMaestro.secuencial = @secuencialcuenta`
    let cnn = await sql.connect(configsql)
    let result = await cnn.request()
        .input('secuencialcuenta', sql.Int, secuencialcuenta)
        .query(sqlQuery)

    dataResult = result.recordset
    await cnn.close()

    return dataResult
}

const DevuelveTipoCuentasPorCliente = async (identificacion) => {

    var dataResult = [];

    let sqlQuery = ` SELECT
                        TipoCuenta.codigo, 
                        TipoCuenta.nombre,
                        CuentaMaestro.secuencial
                    FROM Clientes.Cliente
                    INNER JOIN CaptacionesVista.CuentaCliente ON CuentaCliente.secuencialCliente = Cliente.secuencial
                    INNER JOIN CaptacionesVista.CuentaMaestro ON CuentaMaestro.secuencial = CuentaCliente.secuencialCuenta
                    INNER JOIN CaptacionesVista.TipoCuenta ON TipoCuenta.codigo = CuentaMaestro.codigoTipoCuenta
                    INNER JOIN Personas.Persona ON Persona.secuencial = Cliente.secuencialPersona
                    WHERE TipoCuenta.estaActivo = 1 and Persona.identificacion = @identificacion and CuentaMaestro.codigoEstado = 'A' `

    let cnn = await sql.connect(configsql)
    let result = await cnn.request()
        .input('identificacion', sql.VarChar(15), identificacion)
        .query(sqlQuery)

    dataResult = result.recordset
    await cnn.close()

    return dataResult
}



const DevuelveCuentaAhorrosCliente = async (identificacion) => {

    var dataResult = [];

    let sqlQuery = ` SELECT  
                        (select ISNULL(max(saldo),'0.000000') from CaptacionesVista.CuentaCliente
                        inner join Clientes.Cliente on Cliente.secuencial = CuentaCliente.secuencialCliente
                        inner join Personas.Persona on Persona.secuencial = Cliente.secuencialPersona
                        inner join CaptacionesVista.CuentaMaestro on CuentaMaestro.secuencial = CuentaCliente.secuencialCuenta
                        inner join CaptacionesVista.TipoCuenta on TipoCuenta.codigo = CuentaMaestro.codigoTipoCuenta
                        inner join CaptacionesVista.CuentaComponente_Vista on CuentaComponente_Vista.secuencialCuenta = CuentaMaestro.secuencial
                        where CuentaCliente.secuencialCuenta = CC.secuencial ) saldo,
                            CC.codigo, 
                            CC.fechaSistemaCreacion fechaapertura,
                            EstadoCuenta.nombre estado,
                            Producto.nombre nombreproducto,
                            TipoCuenta.nombre tipo,
                            CC.secuencial,
                            Oficina.ciudad oficina
                    FROM CaptacionesVista.CuentaMaestro CC
                    inner join CaptacionesVista.EstadoCuenta ON EstadoCuenta.codigo = CC.codigoEstado
                    inner join CaptacionesVista.TipoCuenta ON TipoCuenta.codigo = CC.codigoTipoCuenta
                    inner join NegociosFinancieros.Producto ON Producto.codigo = CC.codigoProductoVista
                    inner join Organizaciones.Oficina ON Oficina.secuencialDivision = CC.secuencialOficina
                    inner join CaptacionesVista.CuentaCliente ON CuentaCliente.secuencialCuenta = CC.secuencial
                    inner join Clientes.Cliente ON Cliente.secuencial = CuentaCliente.secuencialCliente
                    inner join Personas.Persona PP ON PP.secuencial = Cliente.secuencialPersona
                    where PP.identificacion = @identificacion and (CC.codigoTipoCuenta = '01                  ' or CC.codigoTipoCuenta = '09                  ') and CC.codigoEstado = 'A' `
    let cnn = await sql.connect(configsql)
    let result = await cnn.request()
        .input('identificacion', sql.VarChar(15), identificacion)
        .query(sqlQuery)

    dataResult = result.recordset

    return dataResult
}

const veridicarNumeroCuenta = async (identificacion, numerocuenta) => {
    let sqlQuery = `SELECT 
                      PP.nombreUnido nombres
                    FROM Personas.Persona PP
                    INNER JOIN Clientes.Cliente CC ON CC.secuencialPersona = PP.secuencial
                    INNER JOIN CaptacionesVista.CuentaCliente VC ON VC.secuencialCliente = CC.secuencial
                    INNER JOIN CaptacionesVista.CuentaMaestro CM ON CM.secuencial = vc.secuencialCuenta
                    WHERE identificacion = @identificacion and CM.codigo = @numerocuenta and CM.codigoTipoCuenta != '00                  ' and CM.codigoEstado = 'A'`
    let cnn = await sql.connect(configsql)
    let result = await cnn.request()
      .input('identificacion', sql.VarChar(15), identificacion)
      .input('numerocuenta', sql.VarChar(15), numerocuenta)
      .query(sqlQuery)
  
    dataResult = result.recordset[0]
    await cnn.close();
  
    return dataResult;
  }

module.exports = {
    DevuelveDatosDeUnaCuenta,
    DevuelveTipoCuentasPorCliente,
    DevuelveCuentaAhorrosCliente,
    veridicarNumeroCuenta
}