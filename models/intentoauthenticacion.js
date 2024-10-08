const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const intentosAuthenticacionSchema = Schema({
    idusuario: {
        type: String,
    },
    metodo: {
        type: String,
    },
    fecha: {
        type: Date,
    }
});

intentosAuthenticacionSchema.methods.toJSON = function () {
    let intentosAuthenticacion = this;
    let intentosAuthenticacionObjeto = intentosAuthenticacion.toObject();
    return intentosAuthenticacionObjeto;
};

intentosAuthenticacionSchema.plugin(uniqueValidator, {
    message: "{PATH} existe en la base de datos, debe de ser unico",
});

module.exports = model("Intentosauthenticacion", intentosAuthenticacionSchema);
