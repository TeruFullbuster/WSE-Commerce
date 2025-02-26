import e from 'cors';
import { pool } from '../db.js'
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import moment from 'moment-timezone';
import crypto from 'crypto';

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

export const createProspecto = async (req, res) => {
    const { marca, modelo, submarca, descripcion, nombre, apellido_paterno, edad, genero, codigo_postal, telefono, correo, 
        gclid, utm, leadsource, aseguradoraCampana, firstPage, isComparator, idGrupo, IPSesion, cvic } = req.body;
    const fecha_creacion = new Date();
    const paso = 0;

    console.log(req.body);

    try {
        // Construir la consulta SQL dinámicamente
        let query = 'INSERT INTO SesionesFantasma (marca, modelo, submarca, nombre, apellido_paterno, edad, genero, codigo_postal, telefono, correo, gclid, utm, fecha_creacion, paso, leadsource, aseguradoracampana, firstPage' ;
        let values = [marca, modelo, submarca, nombre, apellido_paterno, edad, genero, codigo_postal, telefono, correo, gclid, utm, fecha_creacion, paso, leadsource, aseguradoraCampana || '', firstPage];

        // Solo agregar descripcion si está presente y no es vacía
        if (descripcion && descripcion.trim() !== '') {
            query += ', descripcion'; // Añadir descripcion al query
            values.push(descripcion);  // Añadir descripcion al array de valores
        }

        // Solo agregar cvic si está presente y no es vacía
        if (cvic && cvic.trim() !== '') {
            query += ', cevic'; // Añadir descripcion al query
            values.push(cvic);  // Añadir descripcion al array de valores
        }

        // Solo agregar isComparator si está presente y no es vacía
        if (isComparator && isComparator.trim() !== '') {
            query += ', isComparator'; // Añadir isComparator al query
            values.push(isComparator);  // Añadir isComparator al array de valores
        }

        // Solo agregar idGrupo si está presente y no es vacía
        if (idGrupo && idGrupo.trim() !== '') {
            query += ', idGrupo'; // Añadir idGrupo al query
            values.push(idGrupo);  // Añadir idGrupo al array de valores
        }

        // Solo agregar IPSesion si está presente y no es vacía
        if (IPSesion && IPSesion.trim() !== '') {
            query += ', ipSesion'; // Añadir IPSesion al query
            values.push(IPSesion);  // Añadir IPSesion al array de valores
        }

        // Cerrar la parte de columnas y añadir los placeholders para los valores
        query += ') VALUES (' + values.map(() => '?').join(', ') + ')';

        // Ejecutar la consulta
        const [rows] = await pool.query(query, values);

        // Generar un hash del ID recién insertado
        const hashedID = generarHash(rows.insertId); // Hasheamos el ID recién insertado
        // Insertamos el hash y el ID original en la nueva tabla
        await pool.query('INSERT INTO HashToID (original_id, hashed_id) VALUES (?, ?)', [rows.insertId, hashedID]);
        
        // Respuesta exitosa
        res.send({
            message: "Registro Exitoso",
            id: hashedID, // ID real insertado en la base de datos
            hashId: hashedID, // ID hasheado para la URL
            idPasado: rows.insertId,
            marca,
            modelo,
            submarca,
            aseguradoracampana: rows.aseguradoracampana || ''
        });
    } catch (error) {
        // Manejo de errores
        return res.status(500).json({
            message: 'Algo está mal',
            respuesta: error
        });
    }
};


// Paso 1: Actualizar con Datos del Paso 1
export const updateProspectoPaso1 = async (req, res) => {
    const { id } = req.params; // Este es el hash que recibimos
    const { aseguradora, precio_cotizacion, cevic, leadidcpy, descripcion, aseguradoracampana, leadsource } = req.body;
    const paso = 1;

    console.log(req.body);

    try {
        // Usamos la función getOriginalIdFromHash para obtener el ID original
        const originalId = await getOriginalIdFromHash(id);  // Usamos el hash para obtener el ID original

        // Construir la consulta SQL dinámicamente
        let query = 'UPDATE SesionesFantasma SET aseguradora = ?, precio_cotizacion = ?, cevic = ?, paso = ?';
        const params = [aseguradora, precio_cotizacion, cevic, paso];

        // Validar aseguradoracampana
        if (aseguradoracampana !== undefined) {
            query += ', aseguradoracampana = ?';
            params.push(aseguradoracampana);
        }

        // Validar leadidcpy
        if (leadidcpy !== undefined && leadidcpy !== '') {
            query += ', leadidcpy = ?';
            params.push(leadidcpy);
        }

        // Validar leadsource
        if (leadsource !== undefined) {
            query += ', leadsource = ?';
            params.push(leadsource);
        }

        // Validar descripción
        if (descripcion !== undefined && descripcion !== '') {
            query += ', descripcion = ?';
            params.push(descripcion);
        }

        // WHERE clause
        query += ' WHERE id = ?';
        params.push(originalId); // Usamos el ID original aquí

        // Ejecutar la consulta
        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Prospecto no encontrado' });
        }

        res.json({ message: 'Prospecto actualizado exitosamente' });
    } catch (error) {
        return res.status(500).json({
            message: 'Algo está mal',
            error: error.message
        });
    }
};

// Paso 2: Actualizar con Datos del Paso 2
export const updateProspectoEcommerce = async (req, res) => {
    const { id } = req.params; // Este es el hash que recibimos
    const { leadsource, aseguradora, aseguradoracampana, descripcion, cvic, idCotMAG } = req.body;
    const paso = 2;
    console.log(req.body);

    try {
        // Usamos la función getOriginalIdFromHash para obtener el ID original
        const originalId = await getOriginalIdFromHash(id);  // Usamos el hash para obtener el ID original

        let queryfirst = 'SELECT * FROM SesionesFantasma WHERE id = ?';
        const [data] = await pool.query(queryfirst, [originalId]);  // Usamos el originalId en la consulta
        console.log(data[0]);

        let cotizacionId = idCotMAG; // Valor inicial de idCotMAG
        let precioCotizacion = null;
        let descripcionCompleta = descripcion; // Inicialmente usando el valor de descripcion del body

        // Si idCotMAG es inválido, obtener una nueva cotización
        if (cotizacionId === 1 || cotizacionId === "1" || cotizacionId === "null" || cotizacionId === null || cotizacionId === "") {
            console.log("No se actualiza el idCotMAG, obteniendo nuevo idCotMAG");
            const Token = await GetTokenMAG();
            console.log("Token obtenido:", Token);

            const Cotizacion = await GetCotiAseg(Token.token, data);

            console.log("Datos de cotización obtenidos:", Cotizacion.response.cotizacionInfo[0]);
            precioCotizacion = Cotizacion.response.cotizacionInfo[0].primaTotal; // Asignar el valor de primaTotal a precioCotizacion
            descripcionCompleta = Cotizacion.response.cotizacionInfo[0].descripcion; // Asignar el valor de descripcion a descripcionCompleta

            cotizacionId = Cotizacion.response.cotizacionInfo[0].id; // Asignar el nuevo idCotMAG de la cotización
            console.log("Nuevo idCotMAG:", cotizacionId);
        } else {
            // Si idCotMAG es válido, simplemente asignamos el precio y descripción desde el body
            precioCotizacion = precioCotizacion || 0; // Valor por defecto si no se obtiene un precio
        }

        let query = 'UPDATE SesionesFantasma SET paso = ?';
        const params = [paso];

        // Agregar campos dinámicamente si están disponibles
        const fieldsToUpdate = [
            { field: 'leadsource', value: leadsource },
            { field: 'aseguradora', value: aseguradora },
            { field: 'descripcioncompleta', value: descripcionCompleta }, // Asignar descripcion a descripcioncompleta
            { field: 'cevic', value: cvic }, // Mapear 'cvic' a 'cevic' en la base de datos
            { field: 'aseguradoracampana', value: aseguradoracampana },
            { field: 'idCotMAG', value: cotizacionId }, // Usar el idCotMAG que ya puede ser el proporcionado o el obtenido
            { field: 'precio_cotizacion', value: precioCotizacion } // Asignar primaTotal a precio_cotizacion
        ];

        fieldsToUpdate.forEach(({ field, value }) => {
            if (value !== undefined && value !== null && value !== "null" && value !== "") {
                query += `, ${field} = ?`;
                params.push(value);
            }
        });

        query += ' WHERE id = ?';
        params.push(originalId); // Usamos el ID original aquí

        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Prospecto no encontrado' });
        }

        res.json({ message: 'Prospecto actualizado exitosamente' });
    } catch (error) {
        return res.status(500).json({ message: 'Algo está mal', error: error.message });
    }
};

export const updateProspectoPaso2 = async (req, res) => {
    console.log("Datos recibidos:", req.body);
    const { id } = req.params; // Este es el hash que recibimos
    const {
        primer_nombre = null,
        segundo_nombre = null,
        apellido_paterno = null,
        apellido_materno = null,
        dia_nac = null,
        mes_nac = null,
        anio_nac = null,
        rfc = null,
        estado_residencia = null,
        municipio_residencia = null,
        colonia_residencia = null,
        calle_residencia = null,
        numero_ext_residencia = null,
        numero_int_residencia = null,
        leadsource = null,
    } = req.body;

    const paso = 3;

    try {
        // Usamos la función getOriginalIdFromHash para obtener el original_id
        const originalId = await getOriginalIdFromHash(id);  // Obtenemos el original_id a partir del hash

        // Ejecutar el UPDATE con el original_id
        const [result] = await pool.query(
            `UPDATE SesionesFantasma 
             SET primer_nombre = ?, 
                 segundo_nombre = ?, 
                 apellido_paterno = ?, 
                 apellido_materno = ?, 
                 dia_nac = ?, 
                 mes_nac = ?, 
                 anio_nac = ?, 
                 rfc = ?, 
                 estado_residencia = ?, 
                 municipio_residencia = ?, 
                 colonia_residencia = ?, 
                 calle_residencia = ?, 
                 numero_ext_residencia = ?, 
                 numero_int_residencia = ?, 
                 paso = ?,
                 leadsource = ? 
             WHERE id = ?`, 
            [
                primer_nombre, 
                segundo_nombre, 
                apellido_paterno, 
                apellido_materno, 
                dia_nac, 
                mes_nac, 
                anio_nac, 
                rfc, 
                estado_residencia, 
                municipio_residencia, 
                colonia_residencia, 
                calle_residencia, 
                numero_ext_residencia, 
                numero_int_residencia, 
                paso, 
                leadsource,
                originalId  // Usamos el original_id aquí
            ]
        );

        console.log("Resultado del UPDATE:", result);

        // Validar resultado del UPDATE
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Prospecto no encontrado o datos no modificados' });
        }

        if (result.changedRows === 0) {
            return res.status(200).json({ 
                message: 'Datos idénticos, no se realizaron cambios',
                info: result.info 
            });
        }

        res.json({ message: 'Prospecto actualizado exitosamente' });
    } catch (error) {
        console.error("Error en el UPDATE:", error);
        return res.status(500).json({
            message: 'Algo está mal',
            error: error.message
        });
    }
};

// Paso 3: Actualizar con Datos del Paso 3
export const updateProspectoPaso3 = async (req, res) => {
    const { id } = req.params; // Este es el hash que recibimos
    const { leadsource, niv, no_motor, placa } = req.body;
    const paso = 3;
    console.log(req.body);
    console.log(id);    

    try {
        // Usamos la función getOriginalIdFromHash para obtener el original_id
        const originalId = await getOriginalIdFromHash(id);  // Obtenemos el original_id a partir del hash

        // Ejecutamos la consulta UPDATE usando el original_id
        const [result] = await pool.query(
            'UPDATE SesionesFantasma SET niv = ?, num_motor = ?, placa = ?, paso = ?, leadsource = ? WHERE id = ?',
            [niv, no_motor, placa, paso, leadsource, originalId]  // Usamos el original_id aquí
        );

        // Verificamos si la actualización fue exitosa
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Prospecto no encontrado' });
        }

        res.json({ message: 'Prospecto actualizado exitosamente' });
    } catch (error) {
        console.error("Error en el UPDATE:", error);
        return res.status(500).json({
            message: 'Algo está mal',
            error: error.message
        });
    }
};

// Paso 4: Actualizar Lead ID CPY y los nuevos campos
export const updateProspectoPaso4 = async (req, res) => {
    const { id } = req.params; // Este es el hash que recibimos
    const { leadidcpy, leadsource, Comentario, Banco, tTarjeta, ResponseMAGAPI } = req.body;
    const Paso = 4;
    // Verificar si leadidcpy está vacío o no está presente
    const leadidcpyValue = leadidcpy ? leadidcpy : null; // Si no viene, asigna null

    try {
        // Usamos la función getOriginalIdFromHash para obtener el original_id
        const originalId = await getOriginalIdFromHash(id);  // Obtener el original_id a partir del hash

        // Actualizamos los datos del prospecto, considerando que leadidcpy puede ser null
        const [result] = await pool.query(
            `UPDATE SesionesFantasma 
            SET 
                LeadidCPY = ?, 
                leadsource = ?, 
                Comentario = ?, 
                Banco = ?, 
                tTarjeta = ?, 
                iddocto = ?, 
                documento = ?, 
                urlDocto = ?, 
                isPoliza = ?, 
                isCobro = ?, 
                isError = ?, 
                error = ?, 
                isURLCOBRO  = ?, 
                URLCobro = ?,
                paso = ?
            WHERE id = ?`, 
            [
                leadidcpyValue,  // Usamos leadidcpyValue, que será null si no se pasa
                leadsource,
                Comentario,
                Banco,
                tTarjeta,
                ResponseMAGAPI.iddocto, 
                ResponseMAGAPI.documento, 
                ResponseMAGAPI.url, 
                ResponseMAGAPI.isPoliza, 
                ResponseMAGAPI.isCobro, 
                ResponseMAGAPI.isError, 
                ResponseMAGAPI.error, 
                ResponseMAGAPI.isUrlCobro, 
                ResponseMAGAPI.urlCobro,
                Paso,
                originalId  // Usamos el original_id aquí
            ]
        );

        // Verificamos si la actualización fue exitosa
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Prospecto no encontrado' });
        }

        res.json({ message: 'Prospecto actualizado exitosamente' });
    } catch (error) {
        console.error("Error en el UPDATE:", error);
        return res.status(500).json({
            message: 'Algo está mal',
            error: error.message
        });
    }
};

// Paso 4: Actualizar Lead ID CPY y los nuevos campos
export const updateProspectoRecotiza = async (req, res) => {
    const { id } = req.params; // Este es el hash que recibimos
    const { cevic, edad, idCotMAG, precio_cotizacion, descripcion } = req.body;

    try {
        // Usamos la función getOriginalIdFromHash para obtener el original_id
        const originalId = await getOriginalIdFromHash(id);  // Obtener el original_id a partir del hash

        // Actualizamos los datos del prospecto
        const [result] = await pool.query(
            `UPDATE SesionesFantasma 
            SET 
                cevic = ?, 
                edad = ?, 
                idCotMAG = ?, 
                precio_cotizacion = ?, 
                descripcion = ?
            WHERE id = ?`, 
            [   
                cevic,
                edad,
                idCotMAG,
                precio_cotizacion,
                descripcion,
                originalId  // Usamos el original_id aquí
            ]
        );

        // Validamos si la actualización fue exitosa
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Prospecto no encontrado' });
        }

        res.json({ message: 'Prospecto actualizado exitosamente' });
    } catch (error) {
        console.error("Error en el UPDATE:", error);
        return res.status(500).json({
            message: 'Algo está mal',
            error: error.message
        });
    }
};

// Función para actualizar el LeadidCPY utilizando el hash
export const ActualizaLeadIDCPY = async (id, leadidcpy) => {
    try {
        // Obtener el original_id a partir del hash
        const originalId = id;  // Usamos el hash para obtener el ID original

        // Ejecutar el UPDATE con el original_id
        const [result] = await pool.query('UPDATE SesionesFantasma SET LeadidCPY = ? WHERE id = ?', [leadidcpy, originalId]);

        if (result.affectedRows === 0) {
            return { message: 'Prospecto no encontrado' };
        }

        return { message: 'Prospecto actualizado exitosamente' };
    } catch (error) {
        return {
            message: 'Algo está mal',
            error: error.message
        };
    }
};
// Función para actualizar el LeadidCPY utilizando el hash
export const ActualizaIDDESK = async (id, idDesk) => {
    try {
        // Obtener el original_id a partir del hash
        const originalId = id;  // Usamos el hash para obtener el ID original

        // Ejecutar el UPDATE con el original_id
        const [result] = await pool.query('UPDATE SesionesFantasma SET idDesk = ? WHERE id = ?', [idDesk, originalId]);

        if (result.affectedRows === 0) {
            return { message: 'Prospecto no encontrado' };
        }

        return { message: 'Prospecto actualizado exitosamente' };
    } catch (error) {
        return {
            message: 'Algo está mal',
            error: error.message
        };
    }
};

// Función para actualizar el UpdateDescCot utilizando el hash
export const UpdateDescCot = async (req, res) => {
    try {
        // Obtener el original_id a partir del hash
        const id = req.params;  // Usamos el hash para obtener el ID original
        console.log("Original ID:", id.id);
        const originalId = await getOriginalIdFromHash(id.id);  // Obtener el original_id a partir del hash
        console.log("Original ID:", originalId);
        const data = req.body;
        const { descripcion, precio_cotizacion, idCotMAG, idCIA, idProdCR, aseguradora } = data;
        // Ejecutar el UPDATE con el original_id
        const [result] = await pool.query('UPDATE SesionesFantasma SET descripcion = ?, precio_cotizacion = ?, idCotMAG = ?, idCIA = ?, idProdCR = ?, aseguradora = ? WHERE id = ?', [descripcion, precio_cotizacion, idCotMAG, idCIA, idProdCR, aseguradora, originalId]);

        if (result.affectedRows === 0) {
            return { message: 'Prospecto no encontrado' };
        }

        res.json({ message: 'Prospecto actualizado exitosamente' });
    } catch (error) {
        console.error("Error en el UPDATE:", error);
        return res.status(500).json({
            message: 'Algo está mal',
            error: error.message
        });
    }
};

async function obtenerToken() {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        "API_USUARIO": {
            "USUARIO": "ADMIN",
            "CONTRASENIA": "Hola123"
        }
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    try {
        const response = await fetch("https://wsservicios.gmag.com.mx/System/WsController/GenerarToken", requestOptions);
        const result = await response.json();
        console.log(result);
        if (result && result.Token) {
            return result.Token;
        } else {
            throw new Error("No se pudo obtener el token");
        }
    } catch (error) {
        console.error('Error obteniendo el token:', error);
        throw error;
    }
}

// Fetch prospects without a specific field
async function fetchProspects() {
    console.log("Fetching prospects without specific field");
    const [rows] = await pool.query('CALL FetchProspectsWithoutField()');
    return rows[0];
}
// Fetch prospects without a specific field
async function fetchProspectsEcommerce() {
    console.log("Fetching prospects without specific field");
    const [rows] = await pool.query('CALL FetchProspectsWithoutFieldEcommerce()');
    return rows[0];
}

async function postProspect(prospect, token) {
    try {
        let response, result;

        switch (true) {
            case (prospect.paso === 5):
                // Enviar en paralelo a Zoho CRM y Zoho Desk
                [response] = await Promise.all([
                    sendCRM(token, prospect),
                    sendDESK(token, prospect)
                ]);
                console.log("Respuesta CRM y Desk:", response);
                break;

            case (prospect.paso === 6):
                // Enviar solo a Zoho Desk
                response = await sendCRM(token, prospect);
                console.log("Respuesta CRM:", response);
                break;

            case (prospect.paso <= 4):
                // Enviar solo a Zoho CRM
                response = await sendCRM(token, prospect);
                console.log("Respuesta CRM:", response);
                break;

            default:
                throw new Error("Paso no válido. No se envió ni a CRM ni a Desk.");
        }
        console.log(response)
        // Verificar si la respuesta es un JSON válido y contiene "success"
        if (!response || response.success !== true) {
            throw new Error(`Error en la respuesta de CRM: ${response?.error || "Desconocido"}`);
        }

        // Extraer datos de la respuesta
        result = response.data.data[0];
        console.log(result)
        // Validar si la respuesta contiene "data" y el status es "success"
        const success = result?.status === "success";
        const newId = result?.details?.id;

        if (!success || !newId) {
            throw new Error("No se recibió un ID válido de Zoho CRM.");
        }

        console.log(`✅ Lead registrado correctamente con ID: ${newId}`);

        // Si el lead fue enviado a Zoho CRM / DESK y tiene ID, actualizarlo
        if (prospect.paso === 5) {
            console.log("Paso 5 - Actualizando IDs en CRM y DESK...");
            const updateResult = await ActualizaLeadIDCPY(prospect.id, newId);
            const updateResultDESK = await ActualizaIDDESK(prospect.id, newId);
            console.log("Actualización DESK:", updateResultDESK);
            return { success: true, result: updateResult, respuesta: result };
        } else if (prospect.paso === 6) {
            console.log("Paso 6 - Actualizando ID en CRM...");
            const updateResult = await ActualizaLeadIDCPY(prospect.id, newId);
            return { success: true, result: updateResult, respuesta: result };
        } else {
            console.log("Paso 4 o menos - Actualizando ID en CRM...");
            const updateResult = await ActualizaLeadIDCPY(prospect.id, newId);
            return { success: true, result: updateResult, respuesta: result };
        }
    } catch (error) {
        console.error("❌ Error en postProspect:", error);
        return { success: false, error: error.message, respuesta: error };
    }
}

export async function RecuperaProspectos(req, res) {
    try {
        const token = await obtenerToken();
        const prospects = await fetchProspects();

        if (prospects.length === 0) {
            return res.json({ message: "No se encontraron registros" });
        }

        let successCount = 0;
        let errorCount = 0;
        let enviados = [];  // Array para almacenar los IDs de los prospectos enviados

        // Función para agregar un delay
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        const respuesta = await LogsWS("RecuperaProspectos", "WS")
        console.log(respuesta.id)
        
        for (const prospect of prospects) {
            const result = await postProspect(prospect, token);            
            console.log(result.respuesta.Status)
            if(result.respuesta.Status === "500"){
                if (result.success &&  result.respuesta.data[0].status != "error") {
                    console.log(result.respuesta.data[0].status)
                    successCount++;
                   
                } else {
                    errorCount++;
                    if (result.error?.response && result.error.response.status === 401) {
                        return res.status(401).json({ message: "No autorizado" });
                    }
                }
            }else{
                errorCount++;
                    if (result.error?.response && result.error.response.status === 401) {
                        return res.status(401).json({ message: "No autorizado" });
                    }
            }
           
            // Agregar un delay de 10 segundos entre cada iteración
             // Guardar el ID del prospecto enviado exitosamente
             enviados.push("Data: " + prospect.id);  // Asegúrate de que `prospect.id` es el campo correcto
             console.log("Enviados " + enviados)
            await delay(5000);
        }

        // Pasar los IDs al actualizar los logs
        const Logs = await ActualizaLogsWS(respuesta.id, successCount, errorCount, enviados);
        res.json({
            message: "Ejecución completada",
            successCount,
            errorCount,
            Logs
        });
        
    } catch (error) {
        console.error('Error en RecuperaProspectos:', error);
        res.status(500).json({ message: 'Error en la ejecución', error });
    }
}


function calcularEdad(fechaNacimiento) {
    // Crear un objeto Date a partir de la fecha de nacimiento
    const fechaNac = new Date(fechaNacimiento);
    
    // Obtener la fecha actual
    const hoy = new Date();
    
    // Calcular la diferencia en años
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    
    // Ajustar la edad si el cumpleaños no ha ocurrido este año
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--;
    }
    
    return edad;
}

export const TraemelosEcommerce = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, marca,modelo, submarca, descripcion, aseguradoracampana,firstPage, leadsource, cevic, nombre, apellido_paterno, edad, genero, codigo_postal, utm, gclid, paso, leadidCPY FROM SesionesFantasma WHERE LeadidCPY = 555');
        if (rows.length > 0) {
            res.status(200).json({
                rows
            });
        } else {
            res.status(404).send('Sin prospectos en Cola');
        }
    } catch (error) {
        console.error('Error al recuperar la imagen:', error);
        res.status(500).json({ message: 'Error interno del servidor', error });
    }
}

export async function RecuperaProspectosEcommerce(req, res) {
    try {
        const token = await obtenerToken();
        const prospects = await fetchProspectsEcommerce();

        if (prospects.length === 0) {
            return res.json({ message: "No se encontraron registros" });
        }

        let successCount = 0;
        let errorCount = 0;
        let enviados = [];  // Array para almacenar los IDs de los prospectos enviados

        // Función para agregar un delay
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        const respuesta = await LogsWS("RecuperaProspectosEcommerce", "WS")
        console.log(respuesta.id)
        for (const prospect of prospects) {
            const result = await postProspect(prospect, token);
            if (result.success) {
                successCount++;
            } else {
                errorCount++;
                if (result.error.response && result.error.response.status === 401) {
                    return res.status(401).json({ message: "No autorizado" });
                }
            }
            enviados.push(prospect.id);  // Asegúrate de que `prospect.id` es el campo correcto
            console.log("Enviados " + enviados)
            // Agregar un delay de 10 segundos entre cada iteración
            await delay(5000);
        }
        const Logs = await ActualizaLogsWS(respuesta.id, successCount, errorCount, enviados)
        res.json({
            message: "Ejecución completada",
            successCount,
            errorCount,
            Logs
        });

    } catch (error) {
        console.error('Error en RecuperaProspectos:', error);
        res.status(500).json({ message: 'Error en la ejecución', error });
    }
}

export const LogsWS = async (servicio, origen) => {
    console.log(servicio, origen);

    try {
        // Obtener la fecha y hora actual del servidor en UTC
        const serverDate = new Date();

        // Definir la diferencia horaria de México respecto a UTC
        const mexicoOffset = -6; // UTC-6 durante horario estándar

        // Determinar si actualmente es horario de verano en México
        const isDST = (date) => {
            const january = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
            const july = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
            return Math.max(january, july) !== date.getTimezoneOffset();
        };

        // Ajuste de horario de verano (si aplica)
        const dstOffset = isDST(serverDate) ? 1 : 0;

        // Calcular la fecha y hora en México ajustando la diferencia horaria
        const mexicoDate = new Date(serverDate.getTime() + (mexicoOffset + dstOffset) * 60 * 60 * 1000);

        // Convertir la fecha y hora a un formato MySQL adecuado
        const fechaMexico = mexicoDate.toISOString().slice(0, 19).replace('T', ' ');

        const [rows] = await pool.query('INSERT INTO LogsWSE (Fecha, Servicio, Origen) VALUES (?, ?, ?)', [fechaMexico, servicio, origen]);

        return {
            message: "Registro Exitoso",
            id: rows.insertId,
            Fecha: fechaMexico,  // Aquí te devolvemos la fecha en hora de México
            Servicio: servicio,
            Origen: origen,
            aseguradoracampana: rows.aseguradoracampana
        };

    } catch (error) {
        return {
            message: 'Algo está mal',
            respuesta: error
        };
    }
}

export const ActualizaLogsWS = async (id, successCount, errorCount, enviados) => {
    try {
        // Convertir el array de IDs en una cadena de texto separada por comas
        const idsCadena = enviados.join(',');

        console.log(id, successCount, errorCount, idsCadena);

        // Ejecutar la consulta SQL con la cadena de IDs
        const [result] = await pool.query(
            'UPDATE LogsWSE SET successCount = ?, errorCount = ?, PaqueteMarcado = ? WHERE id = ?',
            [successCount, errorCount, idsCadena, id]
        );

        // Verificar si el registro fue actualizado
        if (result.affectedRows === 0) {
            return { message: 'Registro no encontrado' };
        }

        return { message: 'Logs actualizados exitosamente' };
    } catch (error) {
        return {
            message: 'Algo está mal',
            error
        };
    }
}

export const GetCotID = async (req, res) => {
    const { id } = req.params;  // Extraer el id de la solicitud

    // Obtener la cabecera Authorization y extraer el token
    const authorization = req.headers.authorization;
    
    // Verificar si el token está presente en la cabecera
    if (!authorization) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const token = authorization.split(' ')[1]; // Obtener el token después de 'Bearer'
   
    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    try {
        console.log("Fetching prospect using provided idCot");

        // Validar el token usando la función validateToken
        const isValid = await validateToken(token);  // Usamos await para esperar la validación del token

        if (!isValid) {
            return res.status(401).json({ message: 'Token inválido o expirado' });
        }

        // Usamos la función getOriginalIdFromHash para obtener el original_id
        const originalId = await getOriginalIdFromHash(id);  // Obtener el original_id a partir del hash

        // Llamar al procedimiento almacenado pasando el original_id como parámetro
        const [rows] = await pool.query('CALL FetchProspectID(?)', [originalId]);
 
         // Verificar si rows tiene datos y si el primer registro tiene información válida
         if (rows.length === 0 || !rows[0][0]) {
             return res.status(404).json({ message: "El ID proporcionado no existe" });
         }

            const data = rows[0][0];  // Acceder al primer resultado del procedimiento
            let cotizacionId = data.idCotMAG; // Valor inicial de idCotMAG
            let precioCotizacion = null;
            let descripcionCompleta = data.descripcion; // Inicialmente usando el valor de descripcion del body
            let idProdCR = data.idProdCR; // Valor inicial de idProdCR

            console.log(cotizacionId)
             // Si el campo descripcion está vacío y cvic tiene valor, obtenemos la descripción desde la API
             let finalDescripcion = data.descripcion;
             let idCIA = data.idCIA;  // Aquí guardamos idCIA desde la base de datos al principio
             console.log("IDCIA:", idCIA);
             if (idCIA === null || idCIA === "null" || idCIA === "" || idCIA === 0 || idCIA === "0" || idCIA === " ") {
                // Obtener el token y buscar la aseguradora para obtener el idCIA
                const tokenResponse = await GetTokenMAG();  // Llamada para obtener el token
                const token = tokenResponse.token;  // Asumiendo que el token está en la propiedad 'token'
                
                // Llamar a la API para obtener las aseguradoras
                const aseguradorasgenerales = await GetAseg(token);
                
                // Parsear la respuesta y buscar la aseguradora
                const aseguradorasresponse = JSON.parse(aseguradorasgenerales).response;
                
                // Buscar la aseguradora en la respuesta usando el nombre de la aseguradora
                const aseguradora = aseguradorasresponse.find(aseguradora => aseguradora.nombre === data.aseguradoracampana);
                
                // Verificar la aseguradora y asignar el idCIA
                if (aseguradora) {
                    idCIA = aseguradora.id;  // Asignamos el id de la aseguradora
                } else {
                    idCIA = "Aseguradora no encontrada";  // Si no se encuentra la aseguradora
                }

                // Actualizar la base de datos con el idCIA obtenido
                await pool.query('UPDATE SesionesFantasma SET idCIA = ? WHERE id = ?', [idCIA, originalId]);

            }
            console.log("IDCIA:", idCIA);
            // Si idCotMAG es inválido, obtener una nueva cotización
            if (cotizacionId === 1 || cotizacionId === "1" || cotizacionId === "null" || cotizacionId === null || cotizacionId === "") {
                console.log("No se actualiza el idCotMAG, obteniendo nuevo idCotMAG");
                const Token = await GetTokenMAG();
                console.log("Token obtenido:", Token);

                const Cotizacion = await GetCotiAseg2(Token.token, data, idCIA)

                precioCotizacion = Cotizacion.response.cotizacionInfo[0].primaTotal; // Asignar el valor de primaTotal a precioCotizacion
                cotizacionId = Cotizacion.response.cotizacionInfo[0].id; // Asignar el nuevo idCotMAG de la cotización
                precioCotizacion = Cotizacion.response.cotizacionInfo[0].primaTotal; // Asignar el nuevo idCotMAG de la cotización
                finalDescripcion = Cotizacion.response.cotizacionInfo[0].descripcion; // Asignar el nuevo idCotMAG de la cotización

                console.log("Nuevo idCotMAG:", cotizacionId);
                // Actualizar la base de datos con el idCIA obtenido
                await pool.query('UPDATE SesionesFantasma SET idCotMAG = ?, precio_cotizacion = ?, descripcion = ? WHERE id = ?', [cotizacionId, precioCotizacion, finalDescripcion, originalId]);

            } else {
                // Si idCotMAG es válido, simplemente asignamos el precio y descripción desde el body
                precioCotizacion = precioCotizacion || 0; // Valor por defecto si no se obtiene un precio
            }        

            if (!data.descripcion && data.cevic) {
                // Obtener el token y buscar la descripción a través de la API
                const tokenResponse = await GetTokenMAG();  // Llamada para obtener el token
                const token = tokenResponse.token;  // Asumiendo que el token está en la propiedad 'token'

                // Consultar la descripción utilizando la marca, modelo, submarca y aseguradora
                const descriptionResponse = await GetDescription(token, data.marca, data.modelo, data.submarca, data.aseguradora);
    
                const descriptions = JSON.parse(descriptionResponse).response;
                // Iterar por las aseguradoras
                for (const aseguradoraData of descriptions) {
                    // Verificamos si la aseguradora coincide con la que tenemos
                    if (aseguradoraData.aseguradora === data.aseguradora) {
                        // Filtramos las descripciones que tengan el mismo 'cevic'
                        const matchedDescription = aseguradoraData.descipciones.find(desc => desc.cevic === data.cevic);
                        
                        if (matchedDescription) {
                            finalDescripcion = matchedDescription.descripcion;  // Asignamos la descripción correspondiente
                            break;  // Si encontramos la descripción, no necesitamos seguir buscando
                        }
                    }
                }

                // Actualizar la base de datos con la descripción obtenida
                await pool.query('UPDATE SesionesFantasma SET descripcion = ? WHERE id = ?', [finalDescripcion, originalId]);
            }
            console.log("IDCIA:", idCIA);

            //Armamos datos para recotizacion
            let Descriptiones = [];
            if (data.isComparator === "1") {
                console.log("Recotizando");
                // Obtener el token y buscar la descripción a través de la API
                const tokenResponse = await GetTokenMAG();  // Llamada para obtener el token
                const tokenMAG = tokenResponse.token;  // Asumiendo que el token está en la propiedad 'token'

                // Consultar la descripción utilizando la marca, modelo, submarca y aseguradora
                const descriptionResponse = await GetDescription(tokenMAG, data.marca, data.modelo, data.submarca, data.aseguradora);

                // Parsear la respuesta para acceder a las descripciones
                const descriptions = JSON.parse(descriptionResponse).response;

                // Filtrar las descripciones por aseguradora
                const filteredDescriptions = descriptions.filter(aseguradoraData => aseguradoraData.aseguradora === data.aseguradora);
                Descriptiones = filteredDescriptions;
            }
            console.log("idProdCR:", idProdCR);
            console.log("idCotMAG:", cotizacionId);
            if ( idProdCR === null || idProdCR === "null" || idProdCR === "" || idProdCR === 0 || idProdCR === "0" || idProdCR === " ") {
                if(cotizacionId != null || cotizacionId != "null" || cotizacionId != "" || cotizacionId != 0 || cotizacionId != "0" || cotizacionId != " "){
                    const Token = await GetTokenMAG();
                    console.log("Token obtenido:", Token);
                    const getIDProdCR = await GetInfoCotizacionID(Token.token, cotizacionId);
                     console.log(getIDProdCR)
                     console.log(getIDProdCR.response)
                    idProdCR = getIDProdCR.response.idProdCR;
                     // Actualizar la base de datos con el idCIA obtenido
                await pool.query('UPDATE SesionesFantasma SET idProdCR = ? WHERE id = ?', [idProdCR, originalId]);
                }else{
                    console.log("idProdCR Existente, no se actualiza");
                }
                
            }else{
                console.log("No se actualiza el idProdCR, obteniendo nuevo idProdCR");
            }
            // Organizar los datos en diferentes secciones
            const response = {
                message: "OK",
                contacto: {
                    nombre: data.nombre,
                    primer_nombre: data.primer_nombre,
                    segundo_nombre: data.segundo_nombre,
                    apellido_paterno: data.apellido_paterno,
                    apellido_materno: data.apellido_materno,
                    genero: data.genero,
                    telefono: data.telefono,
                    correo: data.correo,
                    edad: data.edad ? new Date(data.edad).toLocaleDateString() : null,
                    rfc: data.rfc,
                },
                vehiculo: {
                    marca: data.marca,
                    modelo: data.modelo,
                    submarca: data.submarca,
                    cevic: data.cevic,
                    descripcion: finalDescripcion,  // Aquí usamos la descripcion final que puede ser obtenida o no desde la API
                    Prima_Total: data.precio_cotizacion,
                    placa: data.placa,
                    num_motor: data.num_motor,
                    Cotizacion_ID: cotizacionId
                },
                Aseguradora:{
                    Aseguradora: data.aseguradoracampana,
                    idCia: idCIA,
                    idProdCR: idProdCR,
                    isComparator: data.isComparator,
                    Grupo: data.idGrupo,
                    Versiones: Descriptiones
                },
                domicilio: {
                    codigo_postal: data.codigo_postal,
                    estado_residencia: data.estado_residencia,
                    municipio_residencia: data.municipio_residencia,
                    colonia_residencia: data.colonia_residencia,
                    calle_residencia: data.calle_residencia,
                    numero_ext_residencia: data.numero_ext_residencia,
                    numero_int_residencia: data.numero_int_residencia,
                },
                adicional: {                    
                    comentario: data.Comentario,
                    gclid: data.gclid,
                    utm: data.utm,
                    creacionMexico: data.creacionMexico ? new Date(data.creacionMexico).toLocaleString() : null,
                    ultima_actualizacionMexico: data.ultima_actualizacionMexico ? new Date(data.ultima_actualizacionMexico).toLocaleString() : null,
                }
            };

            res.json(response);
    
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error",
            error: error.message
        });
    }
};

/// Solicitudes Viraal

// Fetch prospects without a specific field
async function fetchProspectsViraal() {
console.log("Fetching prospects without specific field");
const [rows] = await pool.query('CALL FetchProspectsViraal()');
return rows[0];
}

// Ejecutar la obtención y envío de prospectos
fetchProspectsViraal()
.then((prospects) => {
if (prospects && prospects.length > 0) {
    console.log('Prospectos encontrados:', prospects.length);
    sendProspectsToAPI(prospects);
} else {
    console.log('No se encontraron prospectos para enviar.');
}
})
.catch((error) => {
console.error('Error al obtener los prospectos:', error);
});

// Función para enviar los prospectos
async function sendProspectsToAPI(prospects) {
// Filtrar y formatear los prospectos
const formattedProspects = prospects.map(formatProspect);

// Configuración de los headers
const myHeaders = new Headers();
myHeaders.append("User", "seguros_int");
myHeaders.append("Password", "kj$7ga@_47ha");
myHeaders.append("Token", "AIzaSyDFnRNVfvZM7ibHSMLi6FYnZ56H9MTQ02s");
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Cookie", "PHPSESSID=hp3senuc4q46rsgb8i81qcaq9a");

// Configuración de la solicitud
const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(formattedProspects),
    redirect: "follow"
};
/* try {
    const response = await fetch("https://credifintech.com.mx/sistema/webservice/si_services.php", requestOptions);
    const result = await response.json();
    console.log('Respuesta de la API:', result);
} catch (error) {
    console.error('Error al enviar los prospectos:', error);
} */
}

// Función para limpiar y formatear un prospecto
function formatProspect(prospect) {

return {
    marca: prospect.marca || '',
    modelo: prospect.modelo || '',
    submarca: prospect.submarca || '',
    descripcion: prospect.descripcion || '',
    aseguradora: prospect.aseguradora || '',
    firstpage: prospect.firstPage || '',
    leadsource: prospect.leadsource || '',
    precio_cotizacion: prospect.precio_cotizacion ? prospect.precio_cotizacion.toString() : '',
    nombre: prospect.nombre || '',
    apellido_paterno: prospect.apellido_paterno || '',
    edad: prospect.edad ? formatDate(prospect.edad) : '',
    genero: prospect.genero ? prospect.genero.toString() : '',
    codigo_postal: prospect.codigo_postal || '',
    telefono: prospect.telefono || '',
    correo: prospect.correo || '',
    utm: prospect.utm || '',
    fechaCreacionMex: prospect.creacionMexico,
    leadidcpy: prospect.LeadidCPY ? prospect.LeadidCPY.toString() : ''
};
}

// Función para formatear la fecha al formato dd/mm/yyyy
function formatDate(date) {
const d = new Date(date);
const day = String(d.getUTCDate()).padStart(2, '0');
const month = String(d.getUTCMonth() + 1).padStart(2, '0'); // Los meses son 0-indexados
const year = d.getUTCFullYear();
return `${day}/${month}/${year}`;
}

// Tokens

const secretKey = 'rT6#uY@eF2!kH9mP3$w8jN4bL1VxKqZp0Tz';  // Cambia esto por una clave secreta fuerte

// Función para crear un token
async function createToken(userId, username) {
    const expiresIn = 30 * 60; // 30 minutos en segundos
    const token = jwt.sign({ userId }, secretKey, { expiresIn });

    // Obtener la hora actual de México (zona horaria CST/CDT)
    const expiresAt = moment().tz('America/Mexico_City').add(30, 'minutes').format('YYYY-MM-DD HH:mm:ss');  // Agregar 30 minutos y formatear como cadena

    // Guardar el token en la base de datos
    await pool.query('INSERT INTO tokens (token, expires_at, users) VALUES (?, ?, ?)', [token, expiresAt, username]);

    console.log('Token generado:', token);
    console.log('Fecha de expiración:', expiresAt);

    return { token, expiresAt };  // Retornamos tanto el token como su fecha de expiración
}

async function validateToken(token) {
    // Verifica si el token existe en la base de datos y no ha expirado
    const [rows] = await pool.query(
        'SELECT * FROM tokens WHERE token = ? AND expires_at > CONVERT_TZ(NOW(), @@global.time_zone, "America/Mexico_City")',
        [token]
    );

    if (rows.length === 0) {
        return false;  // El token no es válido o ha expirado
    }

    return true;  // El token es válido
}

export const GetToken = async (req, res) => {
    const { username, password } = req.body;  // Obtener usuario y contraseña del body

    try {
        // Validar las credenciales del usuario con la base de datos
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

        // Si no se encuentra el usuario
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        const user = rows[0];  // El primer usuario encontrado

        // Comparar la contraseña proporcionada con la almacenada en la base de datos
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        // Si las credenciales son válidas, generar el token
        const { token, expiresAt } = await createToken(user.id, user.username);  // Asegúrate de que createToken sea asíncrono si es necesario

        // Respondemos con el token y la fecha de expiración
        res.json({
            message: 'Autenticación exitosa',
            token,         // Token generado
            expires_at: expiresAt, // Fecha de expiración del token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

async function hashPassword() {
    const password = '&wN-xJJ3$4XXpKC';  // La contraseña que deseas cifrar
    const saltRounds = 10;  // El número de rondas de sal (puedes ajustarlo si lo deseas)

    // Cifrar la contraseña
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log('Hashed Password:', hashedPassword);
}

//hashPassword();  // Llama a la función para cifrar la contraseña

// Get Description => Cevic

export const GetDescription = (token, marca, modelo, submarca, aseguradora ) => {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + token);
    console.log(marca, modelo, submarca, aseguradora);
    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    return fetch(`https://apis.segurointeligente.mx/api/Catalogos/GetCevic?Marca=${marca}&Modelo=${modelo}&Des=${submarca}`, requestOptions)
        .then((response) => response.text())
        .then((result) => {
            // Puedes retornar el resultado si deseas usarlo en el .then() posterior
            return result;
        })
        .catch((error) => {
            console.error(error);
            throw error;  // Lanza el error para manejarlo fuera de la función si es necesario
        });
};

export const GetTokenMAG = () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        "usuario": "RPA",
        "contrasena": "Gmag2023*"
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    return fetch("https://apis.segurointeligente.mx/api/Autenticacion/GetToken", requestOptions)
        .then((response) => response.json())
        .then((result) => {
            // Puedes retornar el resultado si deseas usarlo en el .then() posterior
            return result;
        })
        .catch((error) => {
            console.error(error);
            throw error;  // Lanza el error para manejarlo fuera de la función si es necesario
        });
};

export const GetAseg = (token) => {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + token);
    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    return fetch(`https://apis.segurointeligente.mx/api/OTGenerica/CIA`, requestOptions)
        .then((response) => response.text())
        .then((result) => {
            // Puedes retornar el resultado si deseas usarlo en el .then() posterior
            return result;
        })
        .catch((error) => {
            console.error(error);
            throw error;  // Lanza el error para manejarlo fuera de la función si es necesario
        });
};

export const GetCotiAseg = async (token, informacion) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);  // Usamos el token dinámicamente
    console.log(token);
    console.log(informacion);
    const data = informacion[0]
    console.log
    const raw = JSON.stringify({
        "marca": data.marca, // SI
        "modelo": data.modelo, // SI
        "subMarca": data.submarca, // SI
        "cPostal": data.codigo_postal, // SI
        "idGrupo": data.idGrupo, // SI
        "emailVendedor": "e-commerce@segurointeligente.mx", // SI
        "formaPago": "CONTADO", // SI
        "fechaNacimiento": data.edad, // SI
        "cobertura": "AMPLIA",
        "genero": String(data.genero), // Convertir a string
        "rfc": "XAXX010101000", 
        "idcia": data.idCIA, // SI
        "cevic": data.cevic // SI
      });
      
    console.log(raw)
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };
  
    try {
      // Esperamos la respuesta de la API con `await`
      const response = await fetch("https://apis.segurointeligente.mx/api/Cotizacion/GetCotizacionAseg", requestOptions);
      // Convertimos la respuesta a JSON
      console.log(response)
      const result = await response.json();
      console.log(result);
      return result;  // Retornamos el resultado
    } catch (error) {
      console.error("Error al obtener cotización:", error);
      return error;  // Lanzamos el error si algo falla
    }
  };
  
export const GetCotiAseg2 = async (token, informacion, idCIA) => {
const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Authorization", `Bearer ${token}`);  // Usamos el token dinámicamente
console.log(token);
console.log(informacion);
const data = informacion
console.log
const raw = JSON.stringify({
    "marca": data.marca, // SI
    "modelo": data.modelo, // SI
    "subMarca": data.submarca, // SI
    "cPostal": data.codigo_postal, // SI
    "idGrupo": data.idGrupo, // SI
    "emailVendedor": "e-commerce@segurointeligente.mx", // SI
    "formaPago": "CONTADO", // SI
    "fechaNacimiento": data.edad, // SI
    "cobertura": "AMPLIA",
    "genero": String(data.genero), // Convertir a string
    "rfc": "XAXX010101000", 
    "idcia": idCIA, // SI
    "cevic": data.cevic // SI
    });
    
console.log(raw)
const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
};

try {
    // Esperamos la respuesta de la API con `await`
    const response = await fetch("https://apis.segurointeligente.mx/api/Cotizacion/GetCotizacionAseg", requestOptions);
    // Convertimos la respuesta a JSON
    const result = await response.json();
    
    return result;  // Retornamos el resultado
} catch (error) {
    console.error("Error al obtener cotización:", error);
    return error;  // Lanzamos el error si algo falla
}
};

const GetBancosRel = async (token, idCia) => {
const myHeaders = new Headers();
myHeaders.append("Authorization", `Bearer ${token}`);
console.log(token);
console.log(idCia);
const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
};

try {
    // Utilizamos await para esperar la respuesta de la solicitud fetch
    const response = await fetch(`https://apis.segurointeligente.mx/api/Catalogos/BancosRel/${idCia}`, requestOptions);
    console.log(response)
    // Verificamos si la respuesta es exitosa
    if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parseamos la respuesta a JSON
    const result = await response.json();
    
    // Mostramos el resultado
    console.log(result);
    return result; // Opcional, si necesitas retornar el resultado

} catch (error) {
    console.error('Error en la solicitud:', error);
}
};

export const GetMSIxBanco = async (req, res) => {
const { idCIa } = req.params;
console.log("idCIa:", idCIa);

try {
    // Paso 1: Obtener el token
    const token = await GetTokenMAG();

    // Paso 2: Obtener los bancos de la API
    const resultadobancos = await GetBancosRel(token.token, idCIa);

    // Paso 3: Obtener los MSI de la base de datos usando el SP
    const msiData = await getMSIDataFromDB(idCIa);

    // Paso 4: Convertir todos los bancos y los MSI a mayúsculas antes de comparar
    const response = resultadobancos.response.map((banco) => {
        // Verificamos que el nombre del banco esté definido antes de intentar convertirlo
        const bancoNombreUpper = banco.banco.nombre ? banco.banco.nombre.toUpperCase() : "";
        
        // Verificamos si la aseguradora de este banco coincide con el idCIa
        if (banco.aseguradora.id === parseInt(idCIa)) {
            // Añadimos el campo MSI si se encuentra información de MSI
            let msi = "SN MSI"; // Por defecto, si no hay MSI
            
            // Aseguramos que 'bancos_participantes' sea una cadena
            const bancosParticipantes = msiData.bancos_participantes || "";
            
            // Convertir bancos participantes a mayúsculas y hacer la comparación
            const bancosParticipantesUpper = bancosParticipantes.toUpperCase();
            
            // Limpiar y dividir la cadena de MSI y bancos
            const matchingMSI = bancosParticipantesUpper.split(',').map(item => item.trim()).filter(msiValue => bancoNombreUpper.includes(msiValue));
            
            if (matchingMSI.length > 0) {
                // Si hay MSI, los unimos en un string
                msi = msiData.msiList.join(', ') || "SN MSI"; // Usamos la lista de MSI de la base de datos
            }
            
            return {
                ...banco,
                MSI: msi // Añadimos el campo MSI con los valores obtenidos
            };
        }
        return banco;
    });

    // Paso 5: Devolver la respuesta combinada
    res.json({
        message: "Ok",
        response
    });

} catch (error) {
    console.error("Error al obtener la información:", error);
    res.status(500).json({ message: "Hubo un error al procesar la solicitud", error: error.message });
}
};

// Función para obtener los MSI desde la base de datos
const getMSIDataFromDB = async (idCIa) => {
    try {
        const [rows] = await pool.query(`
            CALL GetAseguradorasConMSI(${idCIa});
        `);
            
        // Verificamos que rows tenga datos
        if (rows.length > 0) {
            const row = rows[0];  // Accedemos al primer registro
            console.log(row);
            // Extraemos solo el campo MSI y lo convertimos a mayúsculas
            const msiList = row[0].msi ? row[0].msi.toUpperCase().split(',').map(msi => msi.trim()) : [];
            console.log(msiList)
            // Extraemos los bancos participantes y los convertimos en mayúsculas
            const bancosParticipantes = row[0].bancos_participantes ? row[0].bancos_participantes.toUpperCase() : "";
            
            return { msiList, bancos_participantes: bancosParticipantes };
        } else {
            
            return { msiList: [], bancos_participantes: "" };
        }
    } catch (error) {
        console.error("Error al consultar la base de datos:", error);
        throw error;
    }
};

export const GetInfoCotizacionID = (token, idCotMAG) => {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + token);
    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    return fetch(`https://apis.segurointeligente.mx/api/Cotizacion/CotizacionWs/${idCotMAG}`, requestOptions)
        .then((response) => response.json())
        .then((result) => {
            // Puedes retornar el resultado si deseas usarlo en el .then() posterior
            return result;
        })
        .catch((error) => {
            console.error(error);
            throw error;  // Lanza el error para manejarlo fuera de la función si es necesario
        });
};

// Función para generar el hash
const generarHash = (input) => {
    const hash = crypto.createHash('sha256'); // Usamos SHA-256
    hash.update(input.toString()); // Añadimos el valor que deseamos hashear
    return hash.digest('hex'); // Retorna el hash en formato hexadecimal
};

// Función para obtener el original_id a partir del hash
const getOriginalIdFromHash = async (hash) => {
    const [rows] = await pool.query('SELECT original_id FROM HashToID WHERE hashed_id = ?', [hash]);
    if (rows.length === 0) {
        throw new Error('Hash no válido o no encontrado');
    }
    return rows[0].original_id;  // Devolver el ID original
};


async function sendCRM(token, prospect) {
    console.log(prospect)
    // Procesar el campo gclid para manejar múltiples valores separados por coma
    if (prospect.gclid && prospect.gclid.includes(",")) {
        prospect.gclid = prospect.gclid.split(",")[0].trim();
    }

    // Reconstruir valores si el paso es 3 o 4
    if (prospect.paso === 3 || prospect.paso === 4) {
        // Reconstruir fecha de nacimiento
        if (prospect.dia_nac && prospect.mes_nac && prospect.anio_nac) {
            prospect.edad = `${prospect.anio_nac}-${prospect.mes_nac}-${prospect.dia_nac}`;
        }

        // Agregar RFC si está disponible
        if (prospect.rfc) {
            prospect.RFC = prospect.rfc;
        }

        // Agregar dirección completa
        prospect.direccion_completa = `${prospect.calle_residencia} ${prospect.numero_ext_residencia || ""}${prospect.numero_int_residencia ? " Int. " + prospect.numero_int_residencia : ""}, ${prospect.colonia_residencia}, ${prospect.municipio_residencia}, ${prospect.estado_residencia}, México, ${prospect.codigo_postal}`;

        // Reconstruir descripción con datos adicionales
        prospect.descripcion = `El usuario seleccionó un vehículo con los siguientes datos: Descripción: ${prospect.submarca} Marca: ${prospect.marca} Modelo: ${prospect.modelo} Edad: ${prospect.edad} Género: ${prospect.genero === 0 ? "Masculino" : "Femenino"} Código Postal: ${prospect.codigo_postal} ${prospect.descripcion ? `Descripción vehicular: ${prospect.descripcion}` : ""} RFC: ${prospect.RFC || "N/A"} Dirección: ${prospect.direccion_completa || "N/A"} Prima Total: ${prospect.precio_cotizacion}`;

        // Si el paso es 4, agregar placas, NIV y número de motor
        if (prospect.paso === 4) {
            prospect.descripcion += ` Placas: ${prospect.placas || "N/A"} NIV: ${prospect.niv || "N/A"} Número de Motor: ${prospect.num_motor || "N/A"}`;
        }
    } else {
        // Descripción para otros pasos
        prospect.descripcion = `El usuario seleccionó un vehículo con los siguientes datos: Descripción: ${prospect.submarca} Marca: ${prospect.marca} Modelo: ${prospect.modelo} Edad: ${calcularEdad(prospect.edad)} Género: ${prospect.genero === 0 ? "Masculino" : "Femenino"} Código Postal: ${prospect.codigo_postal} ${prospect.descripcion ? `, Descripción vehicular: ${prospect.descripcion}` : ""} Prima Total: ${prospect.precio_cotizacion}`;
    }

    console.log(prospect);

    // Construir el cuerpo de la petición
    const raw = JSON.stringify({
        "ProspectoZoho": {
            "email": prospect.correo,
            "ramo": "AUTOMOVILES",
            "zip_Code": prospect.codigo_postal,
            "firstPage": prospect.firstPage,
            "description": prospect.descripcion,
            "first_Name": prospect.nombre,
            "Last_Name": prospect.apellido_paterno,
            "full_Name": `${prospect.nombre} ${prospect.apellido_paterno}`,
            "genero": prospect.genero === 0 ? 'Masculino' : 'Femenino',
            "phone": "+521" + prospect.telefono,
            "mobile": "+521" + prospect.telefono,
            "lead_Source": prospect.leadsource,
            "aseguradora_Campana": prospect.aseguradoracampana || "COMPARADOR",
            "Marca": prospect.marca,
            "Modelo": prospect.modelo,
            "RFC": prospect.RFC || "N/A",
            "direccion": prospect.direccion_completa || "N/A",
            "mkT_Campaigns": prospect.utm && prospect.utm !== "N/A" ? prospect.utm : "",
            "GCLID": prospect.gclid && prospect.gclid !== "N/A" ? prospect.gclid : "",
            "IPSesion": prospect.ipSesion || ""
        }
    });

    console.log(raw);

    // Crear los headers de la petición
    const myHeaders = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };

    // Configuración de la petición
    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    try {
        const response = await fetch("https://wsservicios.gmag.com.mx/ZoohoTools/CRM/CrearProspectosSI", requestOptions);
        
        // Verificar si la respuesta es exitosa (código 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data)
        return { success: true, data };
        
    } catch (error) {
        console.error("❌ Error en sendCRM:", error);
        return { success: false, error: error.message };
    }
}


async function sendDESK (token, data) {

    // Construir el cuerpo de la petición
    const raw = JSON.stringify({
            "DeskService": {
                "TicketInfo": {
                    "category": "E-COMMERCE",
                    "subCategory": "E-COMMERCE",
                    "statusType": "Open",
                    "subject": "Póliza sin cobro - E-commerce",
                    "departmentId": "212945000303532029",
                    "channel": "WS",
                    "resolution": "Urgente",
                    "closedTime": "null",
                    "approvalCount": "0",
                    "timeEntryCount": "0",
                    "email": "aruiz@segurointeligente.mx",
                    "contactId": "212945000225587005",
                    "assigneeId": "",
                    "description": `Fallo en cobro, hay poliza, pero no hay cobro`,
                    "status": "Nuevo",
                    "customFields": {
                        "Cobranza": "--Ninguna--",
                        "Aseguradora": data.aseguradoraCampana,
                        "ID_CRM": "",
                        "Medio_de_pago": "--Ninguna--",
                        "Numero_de_poliza": "EK42001740",
                        "Origen_de_Contacto": "--Ninguna--",
                        "inciso": 0,
                        "Aplicar_forma_de_pago": "--Ninguna--",
                        "Opcion_de_pago": "--Ninguna--",
                        "Oportunidad": "",
                        "Estatus_de_Solicitud": "--Ninguna--",
                        "Resultado_de_Reclutamiento": null,
                        "Resultado_Cobranza": "",
                        "Despacho": "--Ninguna--",
                        "Movimiento_a_realizar": "--Ninguna--",
                        "Actividad_Servicio_al_Cliente": "--Ninguna--",
                        "Ramo": null,
                        "Sub_Ramo": null
                    }
                }
            }
    });

    console.log(raw);

    // Crear los headers de la petición
    const myHeaders = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
    // Configuración de la petición
    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };
    try {
        const response = await fetch("https://wsservicios.gmag.com.mx/ZoohoTools/DeskServices/CrearTicket", requestOptions);
        
        // Verificar si la respuesta es exitosa (código 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, data };
        
    } catch (error) {
        console.error("❌ Error en sendCRM:", error);
        return { success: false, error: error.message };
    }
}

