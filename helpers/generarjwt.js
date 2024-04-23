const jwt = require("jsonwebtoken");
const { reject } = require("underscore");
const publicKey = process.env.SECRETORPRIVATEKEY;

const generarJWT = (uid = "", type = false, numerocliente = "") => {
  return new Promise((resolve, reject) => {
    const payload = { uid, type, numerocliente };
    jwt.sign(
      payload,
      publicKey,
      {
        expiresIn: "5m",
      },
      (err, token) => {
        if (err) {
          console.log(err);
          reject("No se genero el token");
        } else {
          resolve(token);
        }
      }
    );
  });
};


module.exports = {
  generarJWT
};
