const configsql = require("../database/sqlserver");
const sql = require("mssql");
const { DevuelvePrestamoOne } = require("../models/prestamos.sql");

const GetPrestamoOne = async (req = request, res = response) => {
    const identificacion = req.user;

    try {
        var dataResult = await DevuelvePrestamoOne(identificacion);
        res.status(200).json({ "response": dataResult });
    } catch (error) {
        res.status(400).json({ "error": dataResult });
    }
}


module.exports = {
    GetPrestamoOne
};