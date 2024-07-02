import { pool } from '../db.js'

export const POSTSesion  = async (req, res) => {
    const {URL,FechaDCreacion,IP,primaTotal} = req.body
    try {
    const [rows] = await pool.query('INSERT INTO Sesiones (URL,FechaDCreacion,IP,primaTotal) VALUES (?,?,?,?)', [URL,FechaDCreacion,IP,primaTotal])
    //console.log(rows) 
    res.send({
        message: "Registro Exitoso",
        id: rows.insertId,
        URL,
        FechaDCreacion,
        IP,
        primaTotal
    })
    } catch (error) {
        return res.status(500).json({
            message: ' Algo esta mal'
        })
    }
}

export const PutSesion = async(req, res) => {
    const {leadidcpy,id} = req.body
    try {    
    const [result] = await pool.query('UPDATE Sesiones SET LeadidCPY = ? WHERE id = ?', [leadidcpy,id])
    console.log(result)

    if (result.affectedRows === 0) return res.status(404).json({
        message: 'Empleado no encontrado'
    })
    res.send({
        message: "Actualización Exitoso"    
    })

    } catch (error) {
        return res.status(500).json({
            message: ' Algo esta mal'
        })
    }
}

export const PutPass = async(req, res) => {
    const {Paso,id} = req.body
    try {    
    const [result] = await pool.query('UPDATE Sesiones SET Paso = ? WHERE id = ?', [Paso,id])
    console.log(result)

    if (result.affectedRows === 0) return res.status(404).json({
        message: 'Empleado no encontrado'
    })
    res.send({
        message: "Actualización Exitoso"    
    })

    } catch (error) {
        return res.status(500).json({
            message: ' Algo esta mal'
        })
    }
}

export const POSTFormulario  = async (req, res) => {
    
    try {
        const {Nombre,Apellidos,Correo,Telefono, Origen} = req.body
        const HoradeRegistro = new Date();                
        const [result] = await pool.query(
            'INSERT INTO FormulariosLinkedIN (Nombre,Apellidos,Correo,Telefono,Origen,HoredeRegistro) VALUES (?,?,?,?,?,?)',
            [Nombre,Apellidos,Correo,Telefono,Origen,HoradeRegistro]
        );
      
        // Verifica si la inserción fue exitosa
        if (result.affectedRows > 0) {
            // Obtén los datos insertados
            console.log(result.insertId)
            const id = result.insertId
            const insertedData = {            
            Nombre,
            Apellidos,
            Correo,
            Telefono,
            Origen,
            HoradeRegistro
            // Agrega más columnas según sea necesario
            };
            EnviarMail(Correo , Origen)
            return res.status(200).json({
            message: 'Inserción exitosa',
            response: insertedData
            });
        } else {
            return res.status(500).json({
            message: 'No se pudo realizar la inserción'
            });
        }
        } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Error en el servidor'
        });
      }
}

function EnviarMail(Email , Origen) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const Resource = ObtenerResource(Origen)
    const raw = JSON.stringify({
    "DATOSHERRAMIENTAS": {
        "Destinatario": Email,
        "MensajeCorreo": `<html lang=\"es\"><head><meta charset=\"utf-8\"><meta http-equiv=\"X-UA-Compatible\" 
        content=\"IE=edge\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"></head>
        <body style=\"width: 600px; text-align: center; margin: 25px auto; font-family: sans-serif;\">
        <div style=\"padding: 0 0 25px;\"><img src=\" ${Resource}\" alt=\"Gabriel Landero\" width=\"210px\">
        </div><h1 style=\"font-size: 25pt; color: #009BDD; font-weight: 900; padding: 15px; margin-bottom: 0;\">¡Registro Exitoso!</h1>
        <p style=\"font-size: 14pt; padding: 15px; margin-top: 0;\">Preparate para disfrutar de este experiencia, 
        a continuación esta el link para que puedas acceder a la conferencia el dia 6 de Mayo </p>
        <p style=\"font-size: 14pt; padding: 0px; margin-top: 0;\"><br> Empodera Training le está invitando a una
         reunión de Zoom programada.Tema: <br> Estrategias de prospección . SI AQS Hora: 6 may 2024 11:00 a. m. Ciudad de 
         México <br> Entrar Zoom Reunión <br> https://us06web.zoom.us/j/86398060240?pwd=HSNqYTX4razlquhakW7j359D0GKf4n.1 <br> 
         ID de reunión: 863 9806 0240 <br> Código de acceso: 320053 </p><p style=\"font-size: 14pt; padding: 0px; margin-top: 0;\">
         </p></body></html>`,
        "PerfilCorreo": "Invitacion SI",
        "AsuntoCorreo": "Gracias por tu registro!",
        "CopyEmail": ""
    }
    });

    const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
    };

    fetch("https://wsservicios.gmag.com.mx/HerramientasDesarrollo/EnviarCorreo", requestOptions)
    .then((response) => response.json())
    .then((result) => {
        console.log(result)
    })
    .catch((error) => console.error(error));
}

const ObtenerResource = (Origen) =>{
    let Resource = ""
    switch (Origen) {
        case "DoraLuz":
            Resource = "https://siaqs.com/Eventos/DoraLuz/img/Landero.png"
            break;
        case "SIAQS":
            Resource = "https://siaqs.com/Eventos/SIAQS/img/Landero.png"
            break;
        case "VisionSeguro":
            Resource = "https://siaqs.com/Eventos/VisionSeguro/img/Landero.png"
            break;
        case "RoqueAlonso":
            Resource = "https://siaqs.com/Eventos/RoqueAlonso/img/Landero.png"
            break;
        default:
            Resource = "https://siaqs.com/Eventos/SIAQS/img/Landero.png"
            break;
    }
    return Resource
}

// Paso 0: Crear Prospecto Base
export const createProspecto = async (req, res) => {
    const { marca, modelo, submarca, nombre, apellido_paterno, edad, genero, codigo_postal, telefono, correo, gclid, utm } = req.body;
    const fecha_creacion = new Date();
    const paso = 0;
    console.log(req.body);
    try {
        const [rows] = await pool.query('INSERT INTO SesionesFantasma (marca, modelo, submarca, nombre, apellido_paterno, edad, genero, codigo_postal, telefono, correo, gclid, utm, fecha_creacion, paso) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [marca, modelo, submarca, descripcion, nombre, apellido_paterno, edad, genero, codigo_postal, telefono, correo, gclid, utm, fecha_creacion, paso]);
        res.send({
            message: "Registro Exitoso",
            id: rows.insertId,
            marca,
            modelo,
            submarca,
            nombre,
            apellido_paterno,
            edad,
            genero,
            codigo_postal,
            telefono,
            correo,
            gclid,
            utm,
            fecha_creacion,
            paso
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Algo está mal'
        });
    }
};

// Paso 1: Actualizar con Datos del Paso 1
export const updateProspectoPaso1 = async (req, res) => {
    const { id } = req.params;
    const { aseguradora, precio_cotizacion, cevic } = req.body;
    const paso = 1;

    try {
        const [result] = await pool.query('UPDATE Sesiones SET aseguradora = ?, precio_cotizacion = ?, cevic = ?, paso = ? WHERE id = ?', [aseguradora, precio_cotizacion, cevic, paso, id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Prospecto no encontrado' });

        res.json({ message: 'Prospecto actualizado exitosamente' });
    } catch (error) {
        return res.status(500).json({
            message: 'Algo está mal'
        });
    }
};

// Paso 2: Actualizar con Datos del Paso 2
export const updateProspectoPaso2 = async (req, res) => {
    const { id } = req.params;
    const { primer_nombre, segundo_nombre, apellido_paterno, apellido_materno, dia_nac, mes_nac, anio_nac, rfc, estado_residencia, municipio_residencia, colonia_residencia, calle_residencia, numero_ext_residencia, numero_int_residencia } = req.body;
    const paso = 2;

    try {
        const [result] = await pool.query('UPDATE Sesiones SET primer_nombre = ?, segundo_nombre = ?, apellido_materno = ?, dia_nac = ?, mes_nac = ?, anio_nac = ?, rfc = ?, estado_residencia = ?, municipio_residencia = ?, colonia_residencia = ?, calle_residencia = ?, numero_ext_residencia = ?, numero_int_residencia = ?, paso = ? WHERE id = ?', [primer_nombre, segundo_nombre, apellido_paterno, apellido_materno, dia_nac, mes_nac, anio_nac, rfc, estado_residencia, municipio_residencia, colonia_residencia, calle_residencia, numero_ext_residencia, numero_int_residencia, paso, id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Prospecto no encontrado' });

        res.json({ message: 'Prospecto actualizado exitosamente' });
    } catch (error) {
        return res.status(500).json({
            message: 'Algo está mal'
        });
    }
};

// Paso 3: Actualizar con Datos del Paso 3
export const updateProspectoPaso3 = async (req, res) => {
    const { id } = req.params;
    const { niv, no_motor, placa } = req.body;
    const paso = 3;

    try {
        const [result] = await pool.query('UPDATE Sesiones SET niv = ?, no_motor = ?, placa = ?, paso = ? WHERE id = ?', [niv, no_motor, placa, paso, id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Prospecto no encontrado' });

        res.json({ message: 'Prospecto actualizado exitosamente' });
    } catch (error) {
        return res.status(500).json({
            message: 'Algo está mal'
        });
    }
};