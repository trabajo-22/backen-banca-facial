const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const solicitudrecuperarusuarioSchema = Schema({
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

solicitudrecuperarusuarioSchema.methods.toJSON = function () {
    let solicitudrecuperarusuario = this;
    let solicitudrecuperarusuarioObjeto = solicitudrecuperarusuario.toObject();
    return solicitudrecuperarusuarioObjeto;
};

solicitudrecuperarusuarioSchema.plugin(uniqueValidator, {
    message: "{PATH} existe en la base de datos, debe de ser unico",
});

module.exports = model("Solicitudrecuperarusuario", solicitudrecuperarusuarioSchema);
