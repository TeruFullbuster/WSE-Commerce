import e from 'cors';
import { pool } from '../db.js'
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import moment from 'moment-timezone';

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
    const { marca, modelo, submarca, descripcion, nombre, apellido_paterno, edad, genero, codigo_postal, telefono, correo, gclid, utm, leadsource, aseguradoraCampana, firstPage } = req.body;
    const fecha_creacion = new Date();
    const paso = 0;

    console.log(req.body);

    try {
        // Construir la consulta SQL dinámicamente
        let query = 'INSERT INTO SesionesFantasma (marca, modelo, submarca, nombre, apellido_paterno, edad, genero, codigo_postal, telefono, correo, gclid, utm, fecha_creacion, paso, leadsource, aseguradoracampana, firstPage';
        let values = [marca, modelo, submarca, nombre, apellido_paterno, edad, genero, codigo_postal, telefono, correo, gclid, utm, fecha_creacion, paso, leadsource, aseguradoraCampana || '', firstPage];

        // Solo agregar descripcion si está presente y no es vacía
        if (descripcion && descripcion.trim() !== '') {
            query += ', descripcion'; // Añadir descripcion al query
            values.push(descripcion);  // Añadir descripcion al array de valores
        }

        // Cerrar la parte de columnas y añadir los placeholders para los valores
        query += ') VALUES (' + values.map(() => '?').join(', ') + ')';

        // Ejecutar la consulta
        const [rows] = await pool.query(query, values);

        // Respuesta exitosa
        res.send({
            message: "Registro Exitoso",
            id: rows.insertId,
            marca,
            modelo,
            submarca,
            aseguradoracampana: rows.aseguradoracampana || '' // Proveer un valor seguro
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
    const { id } = req.params;
    const { aseguradora, precio_cotizacion, cevic, leadidcpy, descripcion, aseguradoracampana, leadsource } = req.body;
    const paso = 1;
    console.log(req.body);

    try {
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
        params.push(id);

        // Ejecutar la consulta
        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Prospecto no encontrado' });
        }

        res.json({ message: 'Prospecto actualizado exitosamente' });
    } catch (error) {
        return res.status(500).json({
            message: 'Algo está mal'
        });
    }
};

// Paso 2: Actualizar con Datos del Paso 2
export const updateProspectoEcommerce = async (req, res) => {
    const { id } = req.params;
    const { leadsource, aseguradora, aseguradoracampana, descripcion, cvic, idCotMAG } = req.body;
    const paso = 2;

    try {
        let query = 'UPDATE SesionesFantasma SET paso = ?';
        const params = [paso];

        // Agregar campos dinámicamente si están disponibles
        const fieldsToUpdate = [
            { field: 'leadsource', value: leadsource },
            { field: 'aseguradora', value: aseguradora },
            { field: 'descripcion', value: descripcion },
            { field: 'cevic', value: cvic }, // Mapear 'cvic' a 'cevic' en la base de datos
            { field: 'aseguradoracampana', value: aseguradoracampana },
            { field: 'idCotMAG', value: idCotMAG }
        ];

        fieldsToUpdate.forEach(({ field, value }) => {
            if (value !== undefined && value !== null && value !== "null" && value !== "") {
                query += `, ${field} = ?`;
                params.push(value);
            }
        });

        query += ' WHERE id = ?';
        params.push(id);

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
    const { id } = req.params;
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
        // Ejecutar el UPDATE
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
                id
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
    const { id } = req.params;
    const { niv, no_motor, placa } = req.body;
    const paso = 4;
    console.log(req.body);
    try {
        const [result] = await pool.query('UPDATE SesionesFantasma SET niv = ?, no_motor = ?, placa = ?, paso = ? WHERE id = ?', [niv, no_motor, placa, paso, id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Prospecto no encontrado' });

        res.json({ message: 'Prospecto actualizado exitosamente' });
    } catch (error) {
        return res.status(500).json({
            message: 'Algo está mal'
        });
    }
};

// Paso 4: Actualizar Lead ID CPY
export const updateProspectoPaso4 = async (req, res) => {
    const { id } = req.params;
    const { leadidcpy } = req.body;
    try {
        const [result] = await pool.query('UPDATE SesionesFantasma SET LeadidCPY = ? WHERE id = ?', [leadidcpy, id]);
        if (result.affectedRows === 0) return { message: 'Prospecto no encontrado' };

        return { message: 'Prospecto actualizado exitosamente' };
    } catch (error) {
        return {
            message: 'Algo está mal',
            error
        };
    }
};

export const ActualizaLeadIDCPY = async (id, leadidcpy) => {
    try {
        const [result] = await pool.query('UPDATE SesionesFantasma SET LeadidCPY = ? WHERE id = ?', [leadidcpy, id]);
        if (result.affectedRows === 0) return { message: 'Prospecto no encontrado' };

        return { message: 'Prospecto actualizado exitosamente' };
    } catch (error) {
        return {
            message: 'Algo está mal',
            error
        };
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
    console.log(token);
    console.log(prospect);

    // Crear los headers de la petición
    const myHeaders = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };

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
            "GCLID": prospect.gclid && prospect.gclid !== "N/A" ? prospect.gclid : ""
        }
    });

    console.log(raw);

    // Configuración de la petición
    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    try {
        const response = await fetch("https://wsservicios.gmag.com.mx/ZoohoTools/CRM/CrearProspectosSI", requestOptions);
        console.log(response);

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log(result);

        if (result && result.data && result.data[0] && result.data[0].details && result.data[0].details.id) {
            const newId = result.data[0].details.id;
            const updateResult = await ActualizaLeadIDCPY(prospect.id, newId);
            return { success: true, result: updateResult, respuesta: result };
        }

        return { success: true, result, respuesta: result };
    } catch (error) {
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
             enviados.push(prospect.id);  // Asegúrate de que `prospect.id` es el campo correcto
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

export async function GetCotID(req, res) {
    const { id } = req.params;  // Extraer el id de la solicitud

    // Obtener la cabecera Authorization y extraer el token
    const authorization = req.headers.authorization;
    
    // Verificar si el token está presente en la cabecera
    if (!authorization) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    // El token viene en formato 'Bearer <token>', lo extraemos
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

        // Llamar al procedimiento almacenado pasando el id como parámetro
        const [rows] = await pool.query('CALL FetchProspectID(?)', [id]);
 
         // Verificar si rows tiene datos y si el primer registro tiene información válida
         if (rows.length === 0 || !rows[0][0]) {
             return res.status(404).json({ message: "El ID proporcionado no existe" });
         }
            const data = rows[0][0];  // Acceder al primer resultado del procedimiento

            // Organizar los datos en diferentes secciones
            const response = {
                message: "OK",
                contacto: {
                    nombre: data.nombre,
                    primer_nombre: data.primer_nombre,
                    segundo_nombre: data.segundo_nombre,
                    apellido_paterno: data.apellido_paterno,
                    apellido_materno: data.apellido_materno,
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
                    Prima_Total: data.precio_cotizacion,
                    num_cotizacion: data.num_cotizacion,
                    placa: data.placa,
                    num_motor: data.num_motor,
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
}


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