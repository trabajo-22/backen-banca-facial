require("dotenv").config();
const Servidor = require("./models/Servidor");
const server = new Servidor();
server.listen();
