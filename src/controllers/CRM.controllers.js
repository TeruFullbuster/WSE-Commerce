import { response } from 'express';
import fetch from 'node-fetch';
import https from 'https';
import nodemailer from 'nodemailer';
import moment from 'moment-timezone';

// Función para obtener el token de Zoho
const getTokenZoho = async () => {
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };
  
  try {
    const response = await fetch("https://wsgenerico.segurointeligente.mx/Zoho/GetTokenCRM", requestOptions);
    if (response.ok) {
      const result = await response.text();
      return result;
    } else {
      console.error("Error al obtener el token:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error en la solicitud del token:", error.message);
    return null;
  }
};

// Función para crear una Cotización Especial (CE) en Zoho
export const createCE = async (req, res) => {
  try {
    // Obtener el token de Zoho
    const oauthToken = await getTokenZoho();

    if (!oauthToken) {
      return res.status(500).json({ error: 'No se pudo obtener el token de Zoho' });
    }
    const tokenlibre = JSON.parse(oauthToken);
    // Extraer el JSON del body de la solicitud
    const clsJson = req.body;

    // Serializar el objeto JSON
    const strJson = JSON.stringify(clsJson);

    // Definir los encabezados y el cuerpo de la solicitud
    const headers = {
      'Authorization': `Zoho-oauthtoken ${tokenlibre.token}`, // Se añade el token al header
      'Content-Type': 'application/json'
    };
    console.log(JSON.parse(oauthToken))
    console.log(JSON.parse(oauthToken).token)
    // Hacer la solicitud POST a Zoho CRM
    const response = await fetch('https://www.zohoapis.com/crm/v2/Cotizaciones_Especiales', {
      method: 'POST',
      headers: headers,
      body: strJson
    });
    
    console.log(response)
    console.log(strJson)
    // Verificar el estado de la respuesta
    if (response.ok) {
      const jsonResponse = await response.json();
      
      // Si la inserción fue exitosa, devolver el ID del objeto creado
      const createdId = jsonResponse.data[0].details.id;
      return res.status(200).json({ message: 'Cotización Especial creada exitosamente', id: createdId });
    } else {
      console.error('Error en la solicitud a Zoho:', response.statusText);
      return res.status(500).json({ error: 'Error en la solicitud a Zoho', details: response.statusText });
    }
  } catch (error) {
    console.log(response)
    console.log('Error al realizar la solicitud:', error);
    return res.status(500).json({ error: 'Error al realizar la solicitud', details: error });
  }
};


console.log('Prueba')

console.log('otra vez')


// Notificación Diaria Leads Sin Tocar
export const NotificacionDiariaLeads = async (req, res) => {
  const token = "1000.4e583952317913bf362a9b12097bb073.ba2f2cb8e47ad548ddce16a9d1630d9b";  // Reemplaza con tu token real
  const fechasI = "2025-01-01T00:00:00+00:00";  // Fecha de inicio
  const fechasF = "2025-01-13T23:59:59+00:00";  // Fecha de fin

  try {
    // Llamada a la función getLeads para obtener los leads dentro de las fechas
    const informacion = await getLeads(token, fechasI, fechasF);
    const leads = informacion.detallesSinTocar || [];  // Leads con "Sin Tocar"

    // Inicializamos el objeto para agrupar por ramo
    const agrupadoPorRamos = {};

    // Iteramos por los leads para agruparlos por ramo y luego por fuente
    leads.forEach(lead => {
      const ramo = lead.Ramo || "Otros";  // Si no hay ramo, se asigna "Otros"
      const leadSource = lead.Lead_Source || "";  // Obtenemos el campo Lead_Source

      // Inicializamos la estructura del ramo si no existe
      if (!agrupadoPorRamos[ramo]) {
        agrupadoPorRamos[ramo] = {
          total: 0,
          SEM: 0,
          SEO: 0,
          FBK: 0,
          otros: 0,
          leads: []
        };
      }

      // Contabilizamos los leads por fuente
      agrupadoPorRamos[ramo].total++;
      if (leadSource.endsWith("SEM")) {
        agrupadoPorRamos[ramo].SEM++;
      } else if (leadSource.includes("SEO")) {
        agrupadoPorRamos[ramo].SEO++;
      } else if (leadSource.includes("FBK")) {
        agrupadoPorRamos[ramo].FBK++;
      } else {
        agrupadoPorRamos[ramo].otros++;
      }

      // Añadimos el lead a la lista del ramo correspondiente
      agrupadoPorRamos[ramo].leads.push({
        id: lead.id,
        Full_Name: lead.Full_Name,
        Estatus_Lead_Prospecto: lead.Estatus_Lead_Prospecto,
        Telefono: lead.Mobile,
        Created_Time: lead.Created_Time,
        Lead_Source: lead.Lead_Source || "N/A",
        MKT_Campaigns: lead.MKT_Campaigns || "N/A"
      });
    });

    // Crear el objeto de respuesta con la información organizada por ramos
    const response = {
      message: "Notificación enviada",
      total: leads.length,   // Total de registros encontrados
      agrupadoPorRamos: agrupadoPorRamos  // Ramo agrupado con leads y cantidades
    };

    // Llamada para enviar el correo con el cuerpo y los detalles
    await enviarCorreo(response);  // Enviar los detalles al correo

    // Retornamos la respuesta organizada
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Hubo un error al procesar la notificación",
      error: error.message
    });
  }
};

async function getLeads(token, fechasI, fechasF) {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Zoho-oauthtoken ${token}`);
  myHeaders.append("Accept", "application/json");  // Cambié a JSON, ya que estás trabajando con objetos en formato JSON
  myHeaders.append("Cookie", "_zcsr_tmp=5cd7c811-88f6-4f4e-8316-ff6df3d261c1; crmcsr=5cd7c811-88f6-4f4e-8316-ff6df3d261c1; group_name=usergroup2; zalb_1a99390653=47948cd9e3fe72a2701dbc53294d291e");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  try {
    // Crear la URL con las fechas dinámicamente
    const url = `https://www.zohoapis.com/crm/v7/Leads/search?criteria=Created_Time%3Abetween%3A${encodeURIComponent(fechasI)}%2C${encodeURIComponent(fechasF)}`;

    // Usamos await para esperar la respuesta de la API
    const response = await fetch(url, requestOptions);
    
    // Convertimos la respuesta a JSON
    const result = await response.json();

    // Filtramos y contamos los registros
    const leads = result.data || [];  // Suponiendo que la respuesta contiene los leads en 'data'

    // Filtrar y contar los "Sin Tocar"
    const sinTocar = leads.filter(lead => lead.Estatus_Lead_Prospecto === "Sin Tocar");
    const otrosStatus = leads.filter(lead => lead.Estatus_Lead_Prospecto !== "Sin Tocar");

    // Resultados que deseas retornar
    const responseJson = {
      message: "OK",
      cantidadSinTocar: sinTocar.length,
      cantidadOtros: otrosStatus.length,
      detallesSinTocar: sinTocar,
      detallesOtros: otrosStatus
    };

    return responseJson;  // O devolverlo como respuesta en la API

  } catch (error) {
    console.error(error);
    return {
      message: "Error",
      error: error.message
    };
  }
}

// Correo para notificación
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
const enviarCorreo = async (response) => {
  const currentTimeCDMX = moment().tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss');
  const subject = "Notificación de Leads Sin Tocar";  // Asunto del correo

  const { agrupadoPorRamos } = response;

  // Crear el contenido HTML del correo
  let htmlContent = `
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Notificación de Leads Sin Tocar</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
          .container { background-color: #ffffff; padding: 20px; }
          h1 { color: #3498db; text-align: center; }
          .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .table th, .table td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          .summary { font-size: 18px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Notificación de Leads Sin Tocar</h1>
          <p><strong>Fecha de Envío:</strong> ${currentTimeCDMX}</p>
          
          <!-- Resumen por Ramo -->
          <div class="summary">
            <p><strong>Total de Leads Sin Tocar:</strong> ${response.total}</p>
            <h3>Resumen por Ramo:</h3>
            <table class="table">
              <tr><th>Ramo</th><th>Total</th><th>SEM</th><th>SEO</th><th>FBK</th><th>Otros</th></tr>`;

  // Agregar los resúmenes por ramo
  for (const ramo in agrupadoPorRamos) {
    const ramoData = agrupadoPorRamos[ramo];
    htmlContent += `
      <tr>
        <td>${ramo}</td>
        <td>${ramoData.total}</td>
        <td>${ramoData.SEM}</td>
        <td>${ramoData.SEO}</td>
        <td>${ramoData.FBK}</td>
        <td>${ramoData.otros}</td>
      </tr>`;
  }

  htmlContent += `</table></div>`;  // Cerrar resumen por ramo

  // Desglose Completo de los Leads
  htmlContent += `<h3>Detalles de los Leads Sin Tocar:</h3>`;

  // Iteramos por cada ramo y mostramos los detalles de los leads
  for (const ramo in agrupadoPorRamos) {
    const ramoData = agrupadoPorRamos[ramo];
    htmlContent += `
      <h4>${ramo} (${ramoData.total} Leads)</h4>
      <table class="table">
        <tr><th>ID</th><th>Nombre</th><th>Teléfono</th><th>Lead Source</th><th>MKT Campaigns</th><th>Fecha de Creación</th></tr>`;

    // Añadir los leads del ramo
    ramoData.leads.forEach(lead => {
      htmlContent += `
        <tr>
          <td>${lead.id}</td>
          <td>${lead.Full_Name}</td>
          <td>${lead.Telefono}</td>
          <td>${lead.Lead_Source}</td>
          <td>${lead.MKT_Campaigns}</td>
          <td>${lead.Created_Time}</td>
        </tr>`;
    });

    htmlContent += `</table>`;  // Cerrar tabla de detalles por ramo
  }

  htmlContent += `</div></body></html>`;

  const mailOptions = {
    from: 'aruiz@segurointeligente.mx',
    to: 'aruiz@siaqs.com',  // Destinatarios del correo
    cc: ['eescoto@segurointeligente.mx', "ehernandez@segurointeligente.mx", 
         "aescamilla@segurointeligente.mx","mgarcia@segurointeligente.mx", 
         "lalonso@segurointeligente.mx", "cguzman@segurointeligente.mx"],
    subject: subject,
    html: htmlContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Correo enviado:", info.response);
  } catch (error) {
    console.error('Error al enviar el correo:', error);
  }
};
