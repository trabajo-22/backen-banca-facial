const configsql = require("../database/sqlserver");
const sql = require("mssql");

const getCuentaOne = async (request, response) => {

    const { secuencialcuenta } = request.body;

    var dataResult = await devuelveDatosDeUnaCuenta(secuencialcuenta)

    response.status(200).json({ "response": dataResult[0] });
}

const devuelveDatosDeUnaCuenta = async (secuencialcuenta) => {
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

const GetTipoCuentasPorCliente = async (req = request, res = response) => {
    const identificacion = req.user;
    var dataResult = [];

    console.log(identificacion)

    let sqlQuery = ` SELECT
                        TipoCuenta.codigo, 
                        TipoCuenta.nombre,
                        CuentaMaestro.secuencial
                    FROM Clientes.Cliente
                    INNER JOIN CaptacionesVista.CuentaCliente ON CuentaCliente.secuencialCliente = Cliente.secuencial
                    INNER JOIN CaptacionesVista.CuentaMaestro ON CuentaMaestro.secuencial = CuentaCliente.secuencialCuenta
                    INNER JOIN CaptacionesVista.TipoCuenta ON TipoCuenta.codigo = CuentaMaestro.codigoTipoCuenta
                    INNER JOIN Personas.Persona ON Persona.secuencial = Cliente.secuencialPersona
                    WHERE TipoCuenta.estaActivo = 1 and Persona.identificacion = @identificacion `

    let cnn = await sql.connect(configsql)
    let result = await cnn.request()
        .input('identificacion', sql.VarChar(15), identificacion)
        .query(sqlQuery)

    dataResult = result.recordset
    await cnn.close()

    res.status(200).json({ "response": dataResult });
}

const GetCuentaAhorrosCliente = async (request, response) => {
    const identificacion = request.user;
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
                    where PP.identificacion = @identificacion and CC.codigoTipoCuenta = '01                  '  `
    let cnn = await sql.connect(configsql)
    let result = await cnn.request()
        .input('identificacion', sql.VarChar(15), identificacion)
        .query(sqlQuery)

    dataResult = result.recordset
    response.status(200).json({ "response": dataResult });
}


module.exports = {
    GetTipoCuentasPorCliente,
    getCuentaOne,
    GetCuentaAhorrosCliente,
};