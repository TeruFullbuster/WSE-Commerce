import { pool } from '../db.js'
import fetch from 'node-fetch';

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
        let query = 'UPDATE SesionesFantasma SET aseguradora = ?, precio_cotizacion = ?,  descripcion = ?, cevic = ?, paso = ?';
        const params = [aseguradora, precio_cotizacion, descripcion, cevic, paso];

        if (aseguradoracampana !== undefined) {
            query += ', aseguradoracampana = ?';
            params.push(aseguradoracampana);
        }
        if (leadidcpy !== undefined && leadidcpy !== '') {
            query += ', leadidcpy = ?';
            params.push(leadidcpy);
        }
        if(leadsource !== undefined){
            query += ', leadsource = ?';
            params.push(leadsource);
        }
        query += ' WHERE id = ?';
        params.push(id);

        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) return res.status(404).json({ message: 'Prospecto no encontrado' });

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
    const { leadsource, aseguradora, aseguradoracampana, descripcion, cvic  } = req.body;
    const paso = 2;

    try {
        let query = 'UPDATE SesionesFantasma SET paso = ?';
        const params = [paso];

        if (leadsource !== undefined && leadsource !== null && leadsource !== "null" && leadsource !== "") {
            query += ', leadsource = ?';
            params.push(leadsource);
        }
        if (aseguradora !== undefined && aseguradora !== null && aseguradora !== "null" && aseguradora !== "") {
            query += ', aseguradora = ?';
            params.push(aseguradora);
        }
        if (descripcion !== undefined && descripcion !== null && descripcion !== "null" && descripcion !== "") {
            query += ', descripcion = ?';
            params.push(descripcion);
        }
        if (cvic !== undefined && cvic !== null && cvic !== "null" && cvic !== "") {
            query += ', cvic = ?';
            params.push(cvic);
        }
        if (aseguradoracampana !== undefined && aseguradoracampana !== null && aseguradoracampana !== "null" && aseguradoracampana !== "") {
            query += ', aseguradoracampana = ?';
            params.push(aseguradoracampana);
        }

        query += ' WHERE id = ?';
        params.push(id);

        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Prospecto no encontrado' });
        }

        res.json({ message: 'Prospecto actualizado exitosamente' });
    } catch (error) {
        return res.status(500).json({ message: 'Algo está mal' });
    }
};


// Paso 2: Actualizar con Datos del Paso 2
export const updateProspectoPaso2 = async (req, res) => {
    const { id } = req.params;
    const { primer_nombre, segundo_nombre, apellido_paterno, apellido_materno, dia_nac, mes_nac, anio_nac, rfc, estado_residencia, municipio_residencia, colonia_residencia, calle_residencia, numero_ext_residencia, numero_int_residencia } = req.body;
    const paso = 2;

    try {
        const [result] = await pool.query('UPDATE SesionesFantasma SET primer_nombre = ?, segundo_nombre = ?, apellido_materno = ?, dia_nac = ?, mes_nac = ?, anio_nac = ?, rfc = ?, estado_residencia = ?, municipio_residencia = ?, colonia_residencia = ?, calle_residencia = ?, numero_ext_residencia = ?, numero_int_residencia = ?, paso = ? WHERE id = ?', [primer_nombre, segundo_nombre, apellido_paterno, apellido_materno, dia_nac, mes_nac, anio_nac, rfc, estado_residencia, municipio_residencia, colonia_residencia, calle_residencia, numero_ext_residencia, numero_int_residencia, paso, id]);
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
    console.log(token)
    const myHeaders = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
    console.log(prospect);
    const raw = JSON.stringify({
        "ProspectoZoho": {
            "email": prospect.correo,
            "ramo": "AUTOMOVILES",
            "zip_Code": prospect.codigo_postal,
            "firstPage": prospect.firstPage,
            "description": `El usuario selecciono un vehiculo con los siguiente datos Descripción: ${prospect.submarca} Marca: ${prospect.marca} Modelo: ${prospect.modelo} EDAD: ${calcularEdad(prospect.edad)} Genero: ${prospect.genero === 0 ? 'Masculino' : 'Femenino'} Y Codigo Postal: ${prospect.codigo_postal} Prima Total: ${prospect.precio_cotizacion}`,
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
            "mkT_Campaigns": prospect.utm && prospect.utm !== "N/A" ? prospect.utm : "",
            "GCLID": prospect.gclid && prospect.gclid !== "N/A" ? prospect.gclid : ""
        }
    });
    console.log(raw)
    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    try {
        const response = await fetch("https://wsservicios.gmag.com.mx/ZoohoTools/CRM/CrearProspectosSI", requestOptions);
        const result = await response.json();
        console.log(result);
        if (result && result.data && result.data[0] && result.data[0].details && result.data[0].details.id) {
            const newId = result.data[0].details.id;
            const updateResult = await ActualizaLeadIDCPY(prospect.id, newId);
            return { success: true, result: updateResult, respuesta: result };
        }
        return { success: true, result, respuesta: result };
    } catch (error) {
        return { success: false, error, respuesta: error };
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
            console.log(result.respuesta.data[0].status)

            if (result.success && result.respuesta.data[0].status != "error") {
                successCount++;
               
            } else {
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

