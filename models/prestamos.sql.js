const configsql = require("../database/sqlserver");
const sql = require("mssql");

const DevuelvePrestamoOne = async (identificacion) => {

    var dataResult = [];

    let sqlQuery = ` select 
                        PrestamoMaestro.deudaInicial, 
                        PrestamoMaestro.fechaAdjudicacion, 
                        PrestamoMaestro.fechaVencimiento, 
                        saldoActual, 
                        numeroCuotas, 
                        frecuenciaPago,
                        (select SUM(valorProyectado) from Cartera.PrestamoComponente_Cartera
                        where secuencialPrestamo = PrestamoMaestro.secuencial and codigoEstadoPrestamoComponente = 'A ') Valorapagar,
                        (select top 1 fechaVencimiento from Cartera.PrestamoComponente_Cartera
                        where secuencialPrestamo = PrestamoMaestro.secuencial and codigoEstadoPrestamoComponente = 'A ') fechaapagar,
                        EstadoPrestamo.nombre estadoprestamo,
                        TipoPrestamo.nombre tipoprestamo,
                        Oficina.ciudad,
                        Producto.nombre,
                        PrestamoMaestro.numeroPrestamo,
                        PrestamoMaestro.secuencial
                    from Cartera.PrestamoCliente
                    inner join Clientes.Cliente on Cliente.secuencial = PrestamoCliente.secuencialCliente
                    inner join Personas.Persona on Persona.secuencial = Cliente.secuencialPersona
                    inner join Cartera.PrestamoMaestro on PrestamoMaestro.secuencial = PrestamoCliente.secuencialPrestamo
                    inner join Cartera.EstadoPrestamo on EstadoPrestamo.codigo = PrestamoMaestro.codigoEstadoPrestamo
                    inner join Credito.TipoPrestamo on TipoPrestamo.codigo = PrestamoMaestro.codigoTipoPrestamo
                    inner join Organizaciones.Oficina ON Oficina.secuencialDivision = PrestamoMaestro.secuencialOficina
                    inner join NegociosFinancieros.Producto ON Producto.codigo = PrestamoMaestro.codigoProductoCartera
                    where Persona.identificacion = @identificacion and PrestamoMaestro.codigoEstadoPrestamo != 'Z '
                    order by PrestamoMaestro.secuencial desc `
    
    let cnn = await sql.connect(configsql)
    let result = await cnn.request()
        .input('identificacion', sql.VarChar(15), identificacion)
        .query(sqlQuery)
        
    dataResult = result.recordset
    await cnn.close()

    return dataResult
}


module.exports = {
    DevuelvePrestamoOne
};