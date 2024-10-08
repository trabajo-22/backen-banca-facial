const Preguntaqsabe = require("../models/pregunta_qsabe");


const verifcarSiTienePregunta = async (req, res) => {
    const { idusuario } = req.body;
    try {
        const solicitud = await Preguntaqsabe.findOne({ idusuario: idusuario });

        if (!solicitud) {
            return res.status(400).json({ message: 'Usuario no encontrado.' });
        }


        return res.status(200).json({
           message:'Si'
        });
    } catch (error) {

        return res.status(500).json({ message: 'Error al listar las preguntas.', error: error.message });
    }
};




const listarPreguntasPorUsuario = async (req, res) => {
    const { idusuario } = req.params;
    try {
        const solicitud = await Preguntaqsabe.findOne({ idusuario: idusuario });

        if (!solicitud) {
            return res.status(400).json({ message: 'Usuario no encontrado.' });
        }
        const preguntas = solicitud.listpregunta;
        if (preguntas.length === 0) {
            return res.status(404).json({ message: 'No hay preguntas disponibles para este usuario.' });
        }

        const preguntaAleatoria = preguntas[Math.floor(Math.random() * preguntas.length)];
        return res.status(200).json({
            idusuario: solicitud.idusuario,
            listpregunta: preguntaAleatoria
        });
    } catch (error) {

        return res.status(500).json({ message: 'Error al listar las preguntas.', error: error.message });
    }
};





const guardarPreguntaSabe = async (req, res) => {
    const { idusuario, pregunta, grupo, titulo } = req.body;

    // Define las listas de datos

    const color = [
        { nombre: 'Azul' },
        { nombre: 'Rojo' },
        { nombre: 'Verde' },
        { nombre: 'Negro' },
        { nombre: 'Blanco' },
        { nombre: 'Rosado' },
        { nombre: 'Amarillo' }
    ];

    const animales = [
        { nombre: 'Gato' },
        { nombre: 'Loro' },
        { nombre: 'Perro' },
        { nombre: 'Conejo' },
        { nombre: 'Tortuga' }
    ];

    const frutas = [
        { nombre: 'Piña' },
        { nombre: 'Mango' },
        { nombre: 'Sandia' },
        { nombre: 'Cereza' },
        { nombre: 'Manzana' },
        { nombre: 'Naranja' }
    ];


    try {
        let solicitud = await Preguntaqsabe.findOne({ idusuario: idusuario });

        if (solicitud) {

            const preguntaExistente = solicitud.listpregunta.find(preg => preg.titulo === titulo);

            if (preguntaExistente) {
                return res.status(400).json({ error: 'Esta pregunta ya fue agregada previamente.' });
            }
            const nuevaPregunta = {
                titulo: titulo,
                pregunta: pregunta,
                grupo: grupo,
                lista: []
            };
            if (titulo === '¿Cuál es tu color favorito?') {
                nuevaPregunta.lista = color;
            } else if (titulo === '¿Cuál es el nombre de tu mascota favorita?') {
                nuevaPregunta.lista = animales;
            } else if (titulo === '¿Cuál es tu fruta favorita?') {
                nuevaPregunta.lista = frutas;
            }

            solicitud.listpregunta.push(nuevaPregunta);
            await solicitud.save();
            return res.status(200).json({ message: 'Pregunta agregada exitosamente.' });

        } else {
            let nuevaSolicitud = new Preguntaqsabe({
                idusuario: idusuario,
                listpregunta: [{
                    titulo: titulo,
                    pregunta: pregunta,
                    grupo: grupo,
                    lista: []
                }]
            });

            if (titulo === '¿Cuál es tu color favorito?') {
                nuevaSolicitud.listpregunta[0].lista = color;
            } else if (titulo === '¿Cuál es el nombre de tu mascota favorita?') {
                nuevaSolicitud.listpregunta[0].lista = animales;
            } else if (titulo === '¿Cuál es tu fruta favorita?') {
                nuevaSolicitud.listpregunta[0].lista = frutas;
            }
            await nuevaSolicitud.save();
            return res.status(201).json({ message: 'Nuevo registro creado exitosamente.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al guardar la pregunta.' });
    }
}




module.exports = {
    guardarPreguntaSabe,
    listarPreguntasPorUsuario,
    verifcarSiTienePregunta

}