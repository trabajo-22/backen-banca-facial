const configsql = require("../database/sqlserver");
const sql = require("mssql");


const getCuentaOne = async (request, response) => {

    const { secuencialcuenta } = request.body;

    var dataResult = [];

    let sqlQuery = `SELECT  
                        (select ISNULL(max(saldo),'0.000000') from CaptacionesVista.CuentaCliente
                        inner join Clientes.Cliente on Cliente.secuencial = CuentaCliente.secuencialCliente
                        inner join Personas.Persona on Persona.secuencial = Cliente.secuencialPersona
                        inner join CaptacionesVista.CuentaMaestro on CuentaMaestro.secuencial = CuentaCliente.secuencialCuenta
                        inner join CaptacionesVista.TipoCuenta on TipoCuenta.codigo = CuentaMaestro.codigoTipoCuenta
                        inner join CaptacionesVista.CuentaComponente_Vista on CuentaComponente_Vista.secuencialCuenta = CuentaMaestro.secuencial
                        where CuentaCliente.secuencialCuenta = ${+secuencialcuenta}) saldo,
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
                    where CuentaMaestro.secuencial = ${+secuencialcuenta}`

    let cnn = await sql.connect(configsql)
    let result = await cnn.query(sqlQuery)
    dataResult = result.recordset
    await cnn.close()

    response.status(200).json({ "response": dataResult[0] });
}

const GetTipoCuentasPorCliente = async (req = request, res = response) => {
    const numerocliente = req.user;
    var dataResult = [];

    let sqlQuery = ` SELECT
                        TipoCuenta.codigo, 
                        TipoCuenta.nombre,
                        CuentaMaestro.secuencial
                    FROM Clientes.Cliente
                    INNER JOIN CaptacionesVista.CuentaCliente ON CuentaCliente.secuencialCliente = Cliente.secuencial
                    INNER JOIN CaptacionesVista.CuentaMaestro ON CuentaMaestro.secuencial = CuentaCliente.secuencialCuenta
                    INNER JOIN CaptacionesVista.TipoCuenta ON TipoCuenta.codigo = CuentaMaestro.codigoTipoCuenta
                    WHERE TipoCuenta.estaActivo = 1 and numeroCliente = ${numerocliente} `

    let cnn = await sql.connect(configsql)
    let result = await cnn.query(sqlQuery)
    dataResult = result.recordset
    await cnn.close()

    res.status(200).json({ "response": dataResult });
}


module.exports = {
    GetTipoCuentasPorCliente,
    getCuentaOne
};