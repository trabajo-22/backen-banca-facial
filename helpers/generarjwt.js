const jwt = require("jsonwebtoken");
const publicKey = process.env.SECRETORPRIVATEKEY;

const generarJWT = (uid = "", type = false, identificacion = "") => {
  return new Promise((resolve, reject) => {
    const payload = { uid, type, identificacion };
    jwt.sign(payload, publicKey, { expiresIn: "10m" },
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

const generarJWTRecuperacion = (codigo, identificacion) => {
  return new Promise((resolve, reject) => {
    const payload = { codigo, identificacion };
    jwt.sign(payload, publicKey, { expiresIn: "10m" },
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
  generarJWT,
  generarJWTRecuperacion
};
