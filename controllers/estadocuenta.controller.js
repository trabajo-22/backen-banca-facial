const configsql = require("../database/sqlserver");
const sql = require("mssql");
const { jsPDF } = require("jspdf");
require('jspdf-autotable');
const fs = require('fs');
const { DevuelveMovimientoEstadoDeCuenta, DevuelveNumeroDeCuenta, DevuelveDatosCliente } = require("../models/estadocuenta.sql")

const getEstadoDeCuentaPDF = async (req, res) => {
    const identificacion = req.user;
    const { secuencialcuenta, mes, anio } = req.body;

    if (mes != mesActual()) {
        let detalleMovimientosEstadoCuenta = await devuelveMovimientoEstadoDeCuenta(secuencialcuenta, mes, anio);
        if (detalleMovimientosEstadoCuenta.length > 0) {
            let datosCliente = await DevuelveDatosCliente(identificacion);
            let numeroDeCuenta = await DevuelveNumeroDeCuenta(secuencialcuenta);
            let fechasPeriodo = devuelveFechasDePeriodo(mes, anio);

            let detallemovimiento = [];
            if (detalleMovimientosEstadoCuenta) {
                if (detalleMovimientosEstadoCuenta.length > 0) {
                    for (let i = 0; i < detalleMovimientosEstadoCuenta.length; i++) {
                        detallemovimiento.push(
                            [
                                i + 1,
                                mascaraFechaEmision(mascaraFechas(detalleMovimientosEstadoCuenta[i].FECHA)),
                                detalleMovimientosEstadoCuenta[i].TIPO,
                                detalleMovimientosEstadoCuenta[i].DEBITO,
                                detalleMovimientosEstadoCuenta[i].CREDITO,
                                detalleMovimientosEstadoCuenta[i].SALDO,
                                detalleMovimientosEstadoCuenta[i].CAUSAL
                            ],
                        );
                    }
                }
            }

            let urlDestino = await generarPDF(
                datosCliente.nombreUnido,
                identificacion,
                datosCliente.celular,
                numeroDeCuenta,
                mascaraFechas(fechasPeriodo.fechainicio),
                mascaraFechas(fechasPeriodo.fechafin),
                fechasPeriodo.fechaemision,
                datosCliente.direccionDomicilio,
                detallemovimiento
            );

            var PdfData = await fs.readFileSync(urlDestino).toString('base64');
            let nombreArchivo = identificacion + fechasPeriodo.fechaemision;

            // Eliminar pdf despues de obtener el base64
            await fs.unlinkSync(urlDestino);

            res.status(200).json({ "response": "hecho", "data": PdfData, "nombrearchivo": nombreArchivo });
        } else {
            return res.status(400).json({ "error": "No existe un estado de cuenta para el mes seleccionado" });
        }
    } else {
        return res.status(400).json({ "error": "No existe un estado de cuenta para el mes seleccionado" });
    }
}

const mascaraFechas = (fecha) => {
    var event = new Date(fecha);
    let date = JSON.stringify(event)
    date = date.slice(1, 11)
    var partes = date.split('-');
    return partes[2] + '-' + partes[1] + '-' + partes[0];
}

const mascaraFechaEmision = (fecha) => {
    var partes = fecha.split('-');
    return partes[2] + '/' + partes[1] + '/' + partes[0];
}

const generarPDF = async (nombres, identificacion, celular, numerocuenta, iniperiodo, finperiodo, fechaemision, direccion, detallemovimiento) => {
    const doc = new jsPDF();
    pathGlobal = 'public/recursospdf/';
    var path_url = pathGlobal + 'logo.png', format = 'PNG';
    var path_urlFooter = pathGlobal + 'YT.png';
    var path_urlBanner = pathGlobal + 'seguridad.png';
    var path_urlMarca = pathGlobal + 'marca.png';
    var imgData = fs.readFileSync(path_url).toString('base64');
    var imgDataFooter = fs.readFileSync(path_urlFooter).toString('base64');
    var imgDataBanner = fs.readFileSync(path_urlBanner).toString('base64');
    var imgDataMarca = fs.readFileSync(path_urlMarca).toString('base64');
    var font = fs.readFileSync(pathGlobal + 'Cairo-VariableFont_slnt,wght.ttf').toString('base64');
    var fontBold = fs.readFileSync(pathGlobal + 'static/Cairo-Bold.ttf').toString('base64');

    doc.addFileToVFS('Cairo-VariableFont_slnt,wght.ttf', font);
    doc.addFont('Cairo-VariableFont_slnt,wght.ttf', 'Cairo', 'normal')
    doc.addFileToVFS('Cairo-Bold.ttf', fontBold);
    doc.addFont('Cairo-Bold.ttf', 'Cairo', 'bold')
    doc.setFont('Cairo');

    var header = ['#', 'FECHA', 'TIPO', 'DEBITO', 'CREDITO', 'SALDO', 'DETALLE'];
    var data = detallemovimiento;

    //Marca de agua
    doc.addImage(imgDataMarca, format, 0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, undefined, 'FAST');

    doc.setTextColor(39, 39, 38);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    // columna 1
    doc.text(nombres, 15, 35);
    doc.setFont(undefined, 'bold');
    doc.text("Identificación:", 15, 41);

    doc.setFont(undefined, 'normal');
    doc.text(identificacion, 40, 41);

    doc.setFont(undefined, 'bold');
    doc.text("Celular:", 15, 47);

    doc.setFont(undefined, 'normal');
    doc.text(celular, 30, 47);

    doc.setFont(undefined, 'bold');
    doc.text("Dirección:", 15, 53);

    doc.setFont(undefined, 'bold');
    doc.text("Cuenta:", 110, 35);

    doc.setFont(undefined, 'normal');
    doc.text(numerocuenta, 124, 35);

    doc.setFont(undefined, 'bold');
    doc.text("Periodo:", 110, 41);

    doc.setFont(undefined, 'normal');
    doc.text(mascaraFechaEmision(iniperiodo) + " - " + mascaraFechaEmision(finperiodo), 125, 41);

    doc.setFont(undefined, 'bold');
    doc.text("Fecha de emisión:", 110, 47);

    doc.setFont(undefined, 'normal');
    doc.text(mascaraFechaEmision(fechaemision), 140, 47);

    doc.setFont(undefined, 'normal');
    doc.text(direccion, 33, 53);

    doc.setFont(undefined, 'normal');
    doc.autoTable({
        startY: 56,
        margin: { top: 30, bottom: 28 },
        columnStyles: { 1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' } },
        pageBreak: 'auto',
        head: [header],
        body: data,
        showFoot: 'everyPage',
        styles: { font: "cairo", overflow: 'linebreak', fontSize: 9 },
        headStyles: { fillColor: [32, 59, 121], valign: 'middle', halign: 'center' }
    })

    //doc.addPage('l', 'mm', 'a4');
    //doc.addImage(imgDataBanner, format, 15, 30, doc.internal.pageSize.width - 30, 180);

    const pageCount = doc.internal.getNumberOfPages()

    doc.setFontSize(8)
    for (var i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.addImage(imgDataFooter, format, 5, 271, doc.internal.pageSize.width - 10, 25, undefined, 'FAST');

        doc.setTextColor(39, 39, 38);
        doc.setFontSize(10);

        doc.setFont(undefined, 'normal');
        doc.text('Página ' + i + " de " + pageCount, 179, 8);

        doc.setTextColor(119, 183, 53);
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text("ESTADO DE CUENTA", 15, 20);

        doc.addImage(imgData, format, 150, 8, 50, 20, undefined, 'FAST');
    }

    let urlDestino = "public/estadodecuentas/" + identificacion + fechaemision + ".pdf"

    await doc.save(urlDestino);

    return urlDestino;
}

const getEstadoDeCuentas = async (req, res) => {
    const identificacion = req.user;
    const { secuencialcuenta, mes, anio } = req.body;

    if (mes != mesActual()) {
        let detalleMovimientos = await DevuelveMovimientoEstadoDeCuenta(secuencialcuenta, mes, anio);
        if (detalleMovimientos.length > 0) {
            let datosCliente = await DevuelveDatosCliente(identificacion);
            let numeroDeCuenta = await DevuelveNumeroDeCuenta(secuencialcuenta);
            let fechasPeriodo = devuelveFechasDePeriodo(mes, anio);

            res.status(200).json({ "response": detalleMovimientos, "datoscliente": datosCliente, "numerocuenta": numeroDeCuenta, "fechaperiodo": fechasPeriodo, "identificacion": identificacion });
        } else {
            return res.status(400).json({ "error": "No existe un estado de cuenta para el mes seleccionado" });
        }
    } else {
        return res.status(400).json({ "error": "No existe un estado de cuenta para el mes seleccionado" });
    }
}

const mesActual = () => {
    let date = new Date();
    var mes = +date.getMonth() + 1;
    return mes
}


const devuelveFechasDePeriodo = (mes, anio) => {
    let fechaInicio = new Date(anio, mes - 1, 1);
    let fechaFin = new Date(anio, mes, 0);
    let fechaEmision = new Date().toLocaleDateString('es-CL', { timeZone: 'America/Santiago' });
    return { "fechainicio": fechaInicio, "fechafin": fechaFin, "fechaemision": fechaEmision }
}


module.exports = {
    getEstadoDeCuentas,
    getEstadoDeCuentaPDF
};