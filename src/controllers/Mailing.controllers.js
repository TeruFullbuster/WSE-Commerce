import { pool } from '../db.js'

import nodemailer from 'nodemailer';

export const POSTSesion  = async (req, res) => {

        const { fullname, email, phone, requeriment } = req.body;

        try {
            enviarCorreo("carlos.mendoza@beenear.mx", ["addiel.mendoza@beenear.mx", "terufullbuster@icloud.com"], "Prospecto Registrado: " + fullname, "Nombre: " + fullname + "\n" + "Correo: " + email + "\n" + "Telefono: " + phone + "\n" + "Requerimiento: " + requeriment);

            // Si no se lanza una excepción, significa que el correo se envió correctamente
            return res.json({ message: "Correo enviado con éxito" });
        } catch (error) {
            console.error('Error al enviar el correo:', error);
            // En caso de error, puedes devolver un mensaje de error
            return res.status(500).json({ error: "Error al enviar el correo" });
        }
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
        console.log(mailOptions)

        // Envía el correo
        const info = await transporter.sendMail(mailOptions);
        console.log(info)
        console.log('Correo enviado:', info.response);        
    } catch (error) {
        console.error('Error al enviar el correo:', error);
    }
};
