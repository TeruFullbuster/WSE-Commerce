import { pool } from '../db.js'

import fetch from 'node-fetch';

import axios from 'axios';

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

