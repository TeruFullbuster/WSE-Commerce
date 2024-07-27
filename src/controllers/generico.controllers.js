import { pool } from '../db.js'

import fetch from 'node-fetch';

import axios from 'axios';

import moment from 'moment-timezone';

import archiver from 'archiver';

import sharp from 'sharp';

export const TokenCondusef = async (req, res) => {
    const { users, pass } = req.query;

    const myHeaders = {
        "Content-Type": "application/json",
        "Cookie": "cookiesession1=678B289B16F3C60FC56F5DD5F13E6DB8"
    };

    const raw = JSON.stringify({
        "username": users,
        "password": pass
    });

    console.log(raw);

    try {
        const response = await axios({
            method: 'GET',
            url: 'https://api.condusef.gob.mx/auth/users/token/',
            headers: myHeaders,
            data: raw // axios permite data en GET requests
        });

        const result = response.data;
        console.log(result);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en la solicitud' });
    }
};

// Obtener la hora actual en el formato deseado
const obtenerFechaHoraActual = () => {
    const fechaActual = new Date();
    const year = fechaActual.getFullYear();
    const month = String(fechaActual.getMonth() + 1).padStart(2, '0');
    const day = String(fechaActual.getDate()).padStart(2, '0');
    const hours = String(fechaActual.getHours()).padStart(2, '0');
    const minutes = String(fechaActual.getMinutes()).padStart(2, '0');
    const seconds = String(fechaActual.getSeconds()).padStart(2, '0');
    const timezoneOffset = -fechaActual.getTimezoneOffset() / 60;
    const timezoneOffsetSign = timezoneOffset >= 0 ? '+' : '-';
    const timezoneOffsetHours = String(Math.abs(Math.floor(timezoneOffset))).padStart(2, '0');
    const timezoneOffsetMinutes = String(Math.abs((timezoneOffset % 1) * 60)).padStart(2, '0');
    const timezone = `${timezoneOffsetSign}${timezoneOffsetHours}:${timezoneOffsetMinutes}`;

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${timezone}`;
};

export const createImageEntry = async (req, res) => {
    const { base64String, ip } = req.body;
    const date = moment().tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss');

    try {
        // Extrae la parte base64 del string recibido
        const base64Image = base64String.replace(/^data:image\/png;base64,/, ''); // Ajusta según el tipo de imagen
        
        const [result] = await pool.query(
            'INSERT INTO Imagenes (fecha, imagen, ip) VALUES (?, ?, ?)',
            [date, base64Image, ip]
        );

        res.status(201).json({
            message: 'Imagen guardada con éxito',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error al guardar la imagen:', error);
        res.status(500).json({ message: 'Error interno del servidor', error });
    }
};

export const getImageEntry = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT imagen FROM Imagenes WHERE id = ?', [id]);
        if (rows.length > 0) {
            const base64Image = rows[0].imagen;

            // Añade el prefijo adecuado para la imagen en base64
            const dataUri = `data:image/png;base64,${base64Image}`; // Cambia según el tipo de imagen

            res.status(200).json({
                base64: dataUri
            });
        } else {
            res.status(404).send('Imagen no encontrada');
        }
    } catch (error) {
        console.error('Error al recuperar la imagen:', error);
        res.status(500).json({ message: 'Error interno del servidor', error });
    }
};



export const getImagesAsZip = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, imagen FROM Imagenes');
        if (rows.length > 0) {
            const archive = archiver('zip', {
                zlib: { level: 9 } // Nivel de compresión
            });

            // Configura la respuesta HTTP para la descarga del archivo ZIP
            res.attachment('images.zip');
            archive.pipe(res);

            for (const row of rows) {
                try {
                    const base64Image = row.imagen;
                    const imageBuffer = Buffer.from(base64Image, 'base64');

                    // Asegura que la imagen sea PNG utilizando sharp
                    const pngBuffer = await sharp(imageBuffer).png().toBuffer();
                    archive.append(pngBuffer, { name: `image_${row.id}.png` });
                } catch (imageError) {
                    console.error(`Error procesando la imagen con id ${row.id}:`, imageError);
                    // Omite esta imagen y continúa con las demás
                }
            }

            await archive.finalize();
        } else {
            res.status(404).send('No se encontraron imágenes');
        }
    } catch (error) {
        console.error('Error al recuperar las imágenes:', error);
        res.status(500).json({ message: 'Error interno del servidor', error });
    }
};