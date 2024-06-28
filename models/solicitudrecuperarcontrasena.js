const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const solicitudrecuperarcontrasenaSchema = Schema({
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

solicitudrecuperarcontrasenaSchema.methods.toJSON = function () {
    let solicitudrecuperarcontrasena = this;
    let solicitudrecuperarcontrasenaObjeto = solicitudrecuperarcontrasena.toObject();
    return solicitudrecuperarcontrasenaObjeto;
};

solicitudrecuperarcontrasenaSchema.plugin(uniqueValidator, {
    message: "{PATH} existe en la base de datos, debe de ser unico",
});

module.exports = model("Solicitudrecuperarcontrasena", solicitudrecuperarcontrasenaSchema);
