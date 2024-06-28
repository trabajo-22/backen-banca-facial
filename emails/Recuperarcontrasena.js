const { transporter } = require('./config');

const enviarEmailContrasenaTemporal = async (email, nombres, contraseniaTemporal) => {
    const info = await transporter.sendMail({
        from: 'Futuro Lamanense <servicios@futurolamanense.fin.ec>', // sender address
        to: email, // list of receivers   
        subject: "Contraseña Temporal", // Subject line
        html: plantillaHtml(nombres, contraseniaTemporal),
    });
    console.log(info)
}

const plantillaHtml = (nombres, contraseniaTemporal) => {
    return `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    
    <body>
        <style>
            @media only screen and (max-width : 1000px) {
                .head {
                    background-color: #203B79;
                    width: 100%;
                }
    
                .title-estado {
                    width: 100%;
                }
    
                .detalle {
                    padding-left: 0px;
                    width: 100%;
                }
    
                .infoadicional {
                    width: 100%;
                }
            }
        </style>
        <div style="background-color: #203B79; width: 800px; padding: 0px; margin: 0px;">
            <img src="https://futurolamanense.fin.ec/logos/logoblanco.png" style="width: 240px;">
        </div>
        <h2
            style="padding-bottom: 10px; border-bottom: solid; border-bottom-color: #77B735; color: rgb(99, 99, 99); width: 800px;">
            Contraseña Temporal
        </h2>
    
        <br>
    
        <div
            style="padding-left: 15px; border-bottom: solid; border-bottom-color: #77B735; padding-bottom: 35px; font-size: 18px; color: rgb(99, 99, 99); width: 800px;">
            <p>Estimado/a `+ nombres + `</p>
            <p>Tu contraseña temporal es: <b style="color: green; border: solid green 1px; padding: 5px;">`+ contraseniaTemporal + `</b></p>
            <p style="color: rgb(150, 123, 2);"><b>Nota: </b>Esta contraseña tiene una duración de 10 minutos</p>
            <p>Atentamente </p>
            <p><b>Futuro Lamanense</b></p>
        </div>
        <br>
        <div style="color: rgb(99, 99, 99); width: 800px; text-align: justify;">
            <p>Si necesitas mas información no dudes en comunicarte con nosotros al (03) 2 568 435 Ext: 1002. </p>
            <p>Por favor no responder este mensaje. </p>
            <p>La información contenida en este email es confidencial; solo puede ser utilizada por el usuario a quien esta
                dirigido. Recuerda que Coac Futuro Lamanense no requiere por ningún medio tu usuario y contraseña de la
                banca móvil y web </p>
        </div>
        <a href="https://futurolamanense.fin.ec/" style="font-size: 17px;">www.futurolamanense.fin.ec</a>
    </body>
    
    </html>`
}

module.exports = {
    enviarEmailContrasenaTemporal
}