const { DevuelveDatosDeUnaCuenta, DevuelveTipoCuentasPorCliente, DevuelveCuentaAhorrosCliente } = require("../models/cuentas.sql")

const getCuentaOne = async (request, response) => {
    const { secuencialcuenta } = request.body;
    try {
        var dataResult = await DevuelveDatosDeUnaCuenta(secuencialcuenta)
        response.status(200).json({ "response": dataResult[0] });
    } catch (error) {
        response.status(400).json({ "error": error });
    }
}


const GetTipoCuentasPorCliente = async (req = request, res = response) => {
    const identificacion = req.user;
    try {
        var dataResult = await DevuelveTipoCuentasPorCliente(identificacion);
        res.status(200).json({ "response": dataResult });
    } catch (error) {
        res.status(400).json({ "error": error });
    }
}

const GetCuentaAhorrosCliente = async (request, response) => {
    const identificacion = request.user;
    try {
        var dataResult = await DevuelveCuentaAhorrosCliente(identificacion);
        response.status(200).json({ "response": dataResult });
    } catch (error) {
        response.status(400).json({ "error": error });
    }
}


module.exports = {
    GetTipoCuentasPorCliente,
    getCuentaOne,
    GetCuentaAhorrosCliente,
};