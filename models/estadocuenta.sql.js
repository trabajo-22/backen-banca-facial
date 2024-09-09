const configsql = require("../database/sqlserver");
const sql = require("mssql");

const DevuelveMovimientoEstadoDeCuenta = async (secuencialcuenta, mes, anio) => {

    let sqlQuery = `SELECT 
        CuentaMaestro.codigo as CUENTA, 
        Transaccion.nombre as TIPO, 
        Movimiento.fecha as FECHA, 
        CASE 
        WHEN esDebito = 1
        THEN
        CONCAT ('-', (SELECT ISNULL(SUM(VALOR),0) 
        FROM CaptacionesVista.MovimientoCuentaComponente_Vista
        WHERE MovimientoCuentaComponente_Vista.secuencialMovimientoDetalle = MovimientoDetalle.secuencial
        AND MovimientoCuentaComponente_Vista.codigoTipoMovimiento IN ('Efectivo','Transferencia','Causal'))) 
        
        WHEN esDebito = 0
        THEN
        '0.00'
        END AS DEBITO,

        CASE
        WHEN esDebito = 1
        THEN
        '0.00'
        WHEN esDebito = 0
        THEN
        CONCAT ('+', (SELECT ISNULL(SUM(VALOR),0) 
        FROM CaptacionesVista.MovimientoCuentaComponente_Vista
        WHERE MovimientoCuentaComponente_Vista.secuencialMovimientoDetalle = MovimientoDetalle.secuencial
        AND MovimientoCuentaComponente_Vista.codigoTipoMovimiento IN ('Efectivo','Transferencia','Causal'))) 
        
        END AS CREDITO,
        (SELECT ISNULL(SUM(VALOR),0)  FROM CaptacionesVista.MovimientoCuentaComponente_Vista 
        WHERE MovimientoCuentaComponente_Vista.secuencialMovimientoDetalle = MovimientoDetalle.secuencial
        AND MovimientoCuentaComponente_Vista.codigoTipoMovimiento  IN ('Cheque')) CHEQUE, 
        MovimientoDetalle_Cuenta.saldoCuenta AS SALDO, ISNULL((SELECT MAX(Componente.nombre + ISNULL(MovimientoComponente_Causal.concepto,' '))
        FROM Causales.MovimientoComponente_Causal, NegociosFinancieros.MovimientoDetalle, NegociosFinancieros.Componente
        WHERE MovimientoComponente_Causal.secuencialMovimientoDetalle = MovimientoDetalle.secuencial
        AND MovimientoComponente_Causal.secuencialComponenteCausal = Componente.secuencial
        AND MovimientoDetalle.secuencialMovimiento = Movimiento.secuencial),' ') as CAUSAL 
        FROM  CaptacionesVista.CuentaCliente, CaptacionesVista.CuentaMaestro, CaptacionesVista.MovimientoDetalle_Cuenta, NegociosFinancieros.MovimientoDetalle, NegociosFinancieros.Movimiento, NegociosFinancieros.Transaccion
        WHERE CuentaCliente.secuencialCuenta = CuentaMaestro.secuencial
        AND MovimientoDetalle_Cuenta.secuencialCuenta = CuentaMaestro.secuencial
        AND MovimientoDetalle.secuencial = MovimientoDetalle_Cuenta.secuencialMovimientoDetalle
        AND MovimientoDetalle.secuencialMovimiento = Movimiento.secuencial
        AND Transaccion.secuencial = MovimientoDetalle.secuencialTransaccion
        AND Transaccion.esVisible  = 1 
        AND CuentaMaestro.secuencial = @secuencialcuenta
        AND YEAR(Movimiento.fecha) = @anio
        AND MONTH(Movimiento.fecha) = @mes
        ORDER BY Movimiento.fecha ASC, Movimiento.fechaMaquina ASC, MovimientoDetalle.secuencial ASC`
    let cnn = await sql.connect(configsql)
    let result = await cnn.request()
        .input('secuencialcuenta', sql.Int, secuencialcuenta)
        .input('anio', sql.Int, anio)
        .input('mes', sql.Int, mes)
        .query(sqlQuery)

    let detalleMovimientos = result.recordset
    await cnn.close();
    return detalleMovimientos;
}

const DevuelveNumeroDeCuenta = async (secuencialCuenta) => {
    let sqlQuery = `select codigo from CaptacionesVista.CuentaMaestro 
                    where secuencial = @secuencialcuenta`
    let cnn = await sql.connect(configsql)
    let result = await cnn.request()
        .input('secuencialcuenta', sql.Int, secuencialCuenta)
        .query(sqlQuery)

    dataResult = result.recordset;
    await cnn.close();
    return dataResult[0].codigo;
}

const DevuelveDatosCliente = async (identificacion) => {
    let sqlQuery = `select 
                        nombreUnido, direccionDomicilio, email,
                        (select top 1 numeroTelefono from Personas.TelefonoPersona where secuencialPersona = Persona.secuencial and estaActivo = 1 and envioSMS = 1) celular
                        from Personas.Persona 
                        where identificacion = @identificacion`
    let cnn = await sql.connect(configsql)
    let result = await cnn.request()
        .input('identificacion', sql.VarChar(15), identificacion)
        .query(sqlQuery)

    dataResult = result.recordset;
    await cnn.close();
    return dataResult[0];
}


module.exports = {
    DevuelveMovimientoEstadoDeCuenta,
    DevuelveNumeroDeCuenta,
    DevuelveDatosCliente
}