import { pool } from '../db.js'

export const cotizaciones  = async (req, res) => {
    console.log('Cotizaciones')
    const { token, datosPersonales , datosDomicilio  } = req.body;
    const hora = obtenerFechaHoraActual();
    console.log(token)
    try {
        // Ejecutar la petición HTTP utilizando fetch
        const response = await fetch('https://serviciosweb.axa.com.mx:9921/v1.0/cotizaciones/datosPlanmed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic c2VndXJvX2ludGVsaWdlbnRlX2tlcmFsdHk6Y2JiOWRhYzQ3MTc4NDY2MDhmMWQwODcyYmM2ZmRjYzc=, Bearer ' + token
            },
            body: JSON.stringify({
                "axaHeaderReq": {
                    "usuario": "MXS00101688A",
                    "sistemaId": "AQS",
                    "UUID": "f1a9f044-0a60-0030-0750-0a95f5580115",
                    "fechaHora": hora
                },
                "data": {
                    "persona": {
                        "primerNombre": datosPersonales.primerNombre,
                        "apellidoPaterno": datosPersonales.apellidoPaterno,
                        "apellidoMaterno": datosPersonales.apellidoMaterno,
                        "fechaNacimiento": datosPersonales.fechaNacimiento,
                        "genero": datosPersonales.genero,
                        "correoElectronico": datosPersonales.correoElectronico,
                        "telefonoContacto": datosPersonales.telefonoContacto,
                        "codigoPostal": datosPersonales.codigoPostal,
                        "nacionalidad": datosPersonales.nacionalidad,
                        "entidadNacimiento": datosPersonales.entidadNacimiento,
                        "numeroDocumento": datosPersonales.noDocumento,
                        "id": datosPersonales.id
                    },
                    "domicilio": {
                        "colonia": datosDomicilio.colonia,
                        "calle": datosDomicilio.calle,
                        "numeroExterior": datosDomicilio.numeroExterior,
                        "numeroInterior": datosDomicilio.numeroInterior,
                    },
                    "agente": {
                        "codigo": "300470-A"
                    },
                    "descuento": {
                        "codigo": "300470-A"
                    }
                }
            })
            
        });
    
        // Verificar el estado de la respuesta
        if (response.ok) {
            const data = await response.json();
            console.log(data); // Aquí está el cuerpo de la respuesta JSON
            // Puedes retornar los datos en tu respuesta HTTP
            res.status(200).json(data);
        } else {
            // Si la petición falla, devolver un mensaje de error
            throw new Error('Error en la petición HTTP');
        }
    } catch (error) {
        // Manejar los errores y devolver una respuesta de error HTTP
        console.error(error);
        res.status(500).json({ message: 'Algo salió mal' });
    }
}


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