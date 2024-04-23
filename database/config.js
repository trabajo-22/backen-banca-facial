const mongoose = require("mongoose");
const dbConnection = async () => {
  try {
    cadena = process.env.MONGO_CNN;
    await mongoose.connect(cadena, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log("Base de datos ONLINE");
  } catch (error) {
    throw new Error("Error al iniciar base de datos");
  }
};
module.exports = {
  dbConnection,
};
