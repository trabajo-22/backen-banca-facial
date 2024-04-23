const https = require("http");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const { dbConnection } = require("../database/config");

class Servidor {
  constructor() {
    this.https_options = {
      key: fs.readFileSync("./cr/apifuturo.key"),
      cert: fs.readFileSync("./cr/api_futurolamanense_fin_ec.crt"),
      ca: [
        fs.readFileSync("./cr/TrustedRoot.crt"),
        fs.readFileSync("./cr/DigiCertCA.crt"),
      ],
    };
    this.app = express();
    this.port = process.env.PORT;
    //Path de rutas
    this.userPath = "/api/user";
    this.sesionPath = "/api/log";
    this.arrayPath = "/api/array";
    this.transferPath = "/api/transfer";
    this.simulatorPath = "/api/simulator";
    this.cuentasPath = "/api/cuentas";
    this.prestamoPath = "/api/prestamo";

    //conectar bd
    this.connectDB();
    //Middlewares
    this.middlewares();
    //rutas
    this.routes();
  }

  async connectDB() {
    await dbConnection();
  }

  middlewares() {
    let optionsCors = {
      allowedHeaders: [
        "Access-Control-Allow-Headers",
        "Authorization",
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "X-Access-Token",
        "Access-Control-Allow-Request-Method",
        "X-API-KEY",
        "x-force",
      ],
      credentials: true,
      methods: "GET,POST",
      origin: "*",
      preflightContinue: false,
    };
    this.app.use(cors(optionsCors));
    this.app.use(express.json());
    this.app.use(express.static("public"));
  }

  routes() {
    this.app.use(this.userPath, require("../routes/user.routes"));
    this.app.use(this.sesionPath, require("../routes/auth.route"));
    this.app.use(this.arrayPath, require("../routes/array.route"));
    this.app.use(this.transferPath, require("../routes/transfer.route"));
    this.app.use(this.simulatorPath, require("../routes/simulator.route"));
    this.app.use(this.cuentasPath, require("../routes/cuentas.route"));
    this.app.use(this.prestamoPath, require("../routes/prestamo.route"));
  }

  listen() {
    /*
    https.createServer(this.https_options, this.app).listen(this.port, () => {
      console.log("Escuchando puerto:", this.port);
    });
    */

    this.app.listen(this.port, () => {
      console.log("Escuchando puerto:", this.port);
    });
  }

}
module.exports = Servidor;
