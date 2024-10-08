const configsql = require("../database/sqlserver");
const sql = require("mssql");
const { DevuelveMovimientoCuenta } = require("../models/movimientoscuentas.sql");

const getMovimientoCuenta = async (request, response) => {

    const { secuencialcuenta, fechainicio, fechafin } = request.body;

    try {
        var dataResult = await DevuelveMovimientoCuenta(secuencialcuenta, fechainicio, fechafin);
        response.status(200).json({ "response": dataResult });
    } catch (error) {
        response.status(400).json({ "error": error });
    }
}

module.exports = {
    getMovimientoCuenta
};