import { pool } from '../db.js'

import nodemailer from 'nodemailer';

export const POSTSesion  = async (req, res) => {
    enviarCorreo("terufullbustee@gmail.com", "Prueba", "Prueba")
    return res.json({ message: "POSTSesion Works" })
}


// Configura el transporte
const transporter = nodemailer.createTransport({
    host: 'mail.beenear.mx',
    port: 465,
    secure: true, // Utiliza SSL
    auth: {
        user: 'prueba@beenear.mx',
        pass: 'fG7IxBpDAvm4'
    }
});

// Función para enviar correo
const enviarCorreo = async (destinatario, asunto, cuerpo) => {
    try {
        // Configura el contenido del correo
        const mailOptions = {
            from: 'prueba@beenear.mx',
            to: destinatario,
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

