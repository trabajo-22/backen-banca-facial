
var configsql = {
    user: process.env.USER,
    password: process.env.PASSWORD,
    server: process.env.SERVER,
    database: process.env.DATABASE,
    options: {
        encrypt: false,
        trustServerCertificate: true,
    }
};


module.exports = configsql;