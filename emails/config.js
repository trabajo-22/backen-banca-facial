const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    host: "mail.futurolamanense.fin.ec",
    port: 465,
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: "servicios@futurolamanense.fin.ec",
        pass: "u-frZ2Jqa#{b",
    }
});

module.exports = {
    transporter
}