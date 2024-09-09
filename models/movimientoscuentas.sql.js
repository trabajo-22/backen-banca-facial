const configsql = require("../database/sqlserver");
const sql = require("mssql");

const DevuelveMovimientoCuenta = async (secuencialcuenta, fechainicio, fechafin) => {

    var dataResult = [];

    let sqlQuery = `SELECT 
                        Movimiento.fecha AS fecha,
                        Movimiento.fechaMaquina AS fechaMaquina,
                        Division.nombre AS oficina, 
                        Movimiento.codigoUsuario AS usuario, 
                        Movimiento.documento AS documento,
                        Transaccion.nombre AS transaccion,
                        ~
                        Transaccion.esDebito AS esDeposito,
                        MovimientoDetalle.valor AS valor,
                        MovimientoDetalle_Cuenta.saldoCuenta AS saldo,
                        Movimiento.secuencial AS secuencialMovimiento,
                        MovimientoDetalle.secuencial AS secuencialMovimientoDetalle,
                        ISNULL((select TOP 1 CONCAT (Componente.nombre, MovimientoComponente_Causal.concepto) from NegociosFinancieros.MovimientoDetalle 
                        inner join Causales.MovimientoComponente_Causal on MovimientoComponente_Causal.secuencialMovimientoDetalle = MovimientoDetalle.secuencial
                        inner join NegociosFinancieros.Componente on Componente.secuencial = MovimientoComponente_Causal.secuencialComponenteCausal
                        where secuencialMovimiento = Movimiento.secuencial), '') AS causal
                        FROM CaptacionesVista.MovimientoDetalle_Cuenta
                        INNER JOIN NegociosFinancieros.MovimientoDetalle ON MovimientoDetalle_Cuenta.secuencialMovimientoDetalle = MovimientoDetalle.secuencial
                        INNER JOIN NegociosFinancieros.Movimiento ON MovimientoDetalle.secuencialMovimiento = Movimiento.secuencial
                        INNER JOIN Generales.Division ON Movimiento.secuencialOficinaUsuario = Division.secuencial
                        INNER JOIN NegociosFinancieros.Transaccion ON MovimientoDetalle.secuencialTransaccion = Transaccion.secuencial
                        WHERE
                        MovimientoDetalle_Cuenta.secuencialCuenta = @secuencialcuenta AND Movimiento.fecha between @fechainicio AND @fechafin
                        ORDER BY Movimiento.fecha DESC, Movimiento.fechaMaquina DESC, MovimientoDetalle.secuencial ASC`

    let cnn = await sql.connect(configsql)
    let result = await cnn.request()
        .input('secuencialcuenta', sql.Int, secuencialcuenta)
        .input('fechainicio', sql.VarChar(8), fechainicio)
        .input('fechafin', sql.VarChar(8), fechafin)
        .query(sqlQuery)

    dataResult = result.recordset
    await cnn.close()

    return dataResult
}

module.exports = {
    DevuelveMovimientoCuenta
}