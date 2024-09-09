const { DevuelveInversionesPorNumCliente } = require("../models/inversiones.sql");

const GetInversionesPorNumCliente = async (req = request, res = response) => {
    const identificacion = req.user;

    try {
        var dataResult = await DevuelveInversionesPorNumCliente(identificacion);
        res.status(200).json({ "response": dataResult });
    } catch (error) {
        res.status(400).json({ "error": error });
    }
}


module.exports = {
    GetInversionesPorNumCliente
};