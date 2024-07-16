import { pool } from '../db.js';
import fetch from 'node-fetch';
import fs from 'fs';
import { parseStringPromise as parseString } from 'xml2js';
import https from 'https';
import nodemailer from 'nodemailer';
import moment from 'moment-timezone';

export const LogPMP = async (req, res) => {
    const { correo, LogsPMP } = req.body;
    console.log(correo, LogsPMP);
    try {
        const [rows] = await pool.query('INSERT INTO LogsPMP (correo, fechalogs) VALUES (?, ?)', [correo, LogsPMP]);
        console.log(rows);
        res.send({
            message: "Registro Exitoso"
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Algo esta mal'
        });
    }
};

// Función para validar URLs
const validateUrls = async (urls, emailList) => {
    let invalidUrls = [];

    for (let url of urls) {
        try {
            let response = await fetch(url, {
                agent: new https.Agent({
                    rejectUnauthorized: false  // Ignorar la verificación del certificado SSL
                })
            });
            if (response.status !== 200) {
                invalidUrls.push(url);
            }
        } catch (error) {
            invalidUrls.push(url);
        }
    }

    if (invalidUrls.length > 0) {
        var cuerpo = "Las siguientes URLs no son válidas:\n" + invalidUrls.join('\n');
        await enviarCorreo(cuerpo, emailList, false);
    } else {
        var cuerpo = `Todas las URLs del sitio se encuentran activas. Vuelva pronto.`;
        await enviarCorreo(cuerpo, emailList, true);
    }
};

// Función principal
const checkSitemap = async (sitemapUrl, emailList) => {
    try {
        let response = await fetch(sitemapUrl);
        console.log('Sitemap status:', response.status);
        let xmlData = await response.text();
        let result = await parseString(xmlData);
        let urls = result.urlset.url.map(entry => entry.loc[0]);

        await validateUrls(urls, emailList);
    } catch (error) {
        console.error('Error al procesar el sitemap:', error);
    }
};

// Definir el endpoint GET para ejecutar checkSitemap
export const getCheckSitemap = async (req, res) => {
    const { id } = req.params;
    let sitemapUrl = '';
    let emailList = [];

    if (id === '1') {
        sitemapUrl = 'http://segurointeligente.mx/sitemap.xml';
        emailList = ['aescamilla@segurointeligente.mx', 'eescoto@segurointeligente.mx', 'lalonso@segurointeligente.mx', 'cguzman@segurointeligente.mx', 'mgarcia@segurointeligente.mx']; // Lista de correos para el ID 1
    } else if (id === '2') {
        sitemapUrl = 'http://segurointeligente.mx/sitemap2.xml';
        emailList = ['aescamilla@segurointeligente.mx', 'eescoto@segurointeligente.mx', 'lalonso@segurointeligente.mx', 'cguzman@segurointeligente.mx', 'mgarcia@segurointeligente.mx']; // Lista de correos para el ID 2
    } else {
        return res.status(400).send('ID de sitemap no válido');
    }

    try {
        await checkSitemap(sitemapUrl, emailList);
        res.status(200).send('Sitemap check completed');
    } catch (error) {
        res.status(500).send('Error checking sitemap');
    }
};

// Configura el transporte
const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true, // Utiliza SSL
    auth: {
        user: 'aruiz@segurointeligente.mx',
        pass: 'ww38vQreprxV'
    }
});

// Función para enviar correo
const enviarCorreo = async (cuerpo, emailList, allValid) => {
    const currentTimeCDMX = moment().tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss');
    const subject = allValid ? 'Todas las URLs son válidas' : 'Enlaces no válidos en el sitemap';

    try {
        // Configura el contenido del correo
        const mailOptions = {
            from: 'aruiz@segurointeligente.mx',
            to: 'aruiz@siaqs.com',  // Convierte la lista de correos en una cadena separada por comas
            cc: emailList.join(', '),
            subject: subject,
            html: `<p>Escaneo a las: ${currentTimeCDMX}</p><p>${cuerpo}</p>` // Usar HTML en lugar de texto plano
        };
        console.log(mailOptions);

        // Envía el correo
        const info = await transporter.sendMail(mailOptions);
        console.log(info);
        console.log('Correo enviado:', info.response);
    } catch (error) {
        console.error('Error al enviar el correo:', error);
    }
};
