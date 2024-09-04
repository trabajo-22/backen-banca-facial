const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const solicituddesbloquearcuentaSchema = Schema({
    identificacion: {
        type: String,
    },
    fechadate: {
        type: Date,
    },
    fechastring: {
        type: String,
    }
});

solicituddesbloquearcuentaSchema.methods.toJSON = function () {
    let solicituddesbloquearcuenta = this;
    let solicituddesbloquearcuentaObjeto = solicituddesbloquearcuenta.toObject();
    return solicituddesbloquearcuentaObjeto;
};

solicituddesbloquearcuentaSchema.plugin(uniqueValidator, {
    message: "{PATH} existe en la base de datos, debe de ser unico",
});

module.exports = model("Solicituddesbloquearcuenta", solicituddesbloquearcuentaSchema);
