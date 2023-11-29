import { pool } from '../db.js'

import nodemailer from 'nodemailer';

export const POSTSesion  = async (req, res) => {
    enviarCorreo("carlos.mendoza@beenear.mx",["terufullbuster@icloud.com", "addiel.mendoza@beenear.mx"], "Prueba Angel Ruiz", "Prueba Angel Ruiz")
    return res.json({ message: "POSTSesion Works" })
}


// Configura el transporte
const transporter = nodemailer.createTransport({
    host: 'mail.beenear.mx',
    port: 465,
    secure: true, // Utiliza SSL
    auth: {
        user: 'moreinfo@beenear.mx',
        pass: 'iGVy3JS9lc*#'
    }
});

// Función para enviar correo
const enviarCorreo = async (destinatario, cc, asunto, cuerpo) => {
    try {
        // Configura el contenido del correo
        const mailOptions = {
            from: 'moreinfo@beenear.mx',
            to: destinatario,
            cc: cc,
            subject: asunto,
            text: cuerpo
        };

        // Envía el correo
        const info = await transporter.sendMail(mailOptions);
        console.log(info)
        console.log('Correo enviado:', info.response);        
    } catch (error) {
        console.error('Error al enviar el correo:', error);
    }
};

// Ejemplo de uso

