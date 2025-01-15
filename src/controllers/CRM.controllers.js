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

// Notificación Diaria: Leads Sin Tocar
export const NotificacionDiariaLeads = async (req, res) => {
  const { TipoNotificacion, NotificarMail } = req.body;

  // Calcular las fechas según TipoNotificacion
  let fechaInicio, fechaFin;

  const currentDate = moment().tz('America/Mexico_City'); // Fecha y hora actual en CDMX
  const startOfMonth = currentDate.clone().startOf('month'); // Primer día del mes
  const endOfMonth = currentDate.clone().endOf('month'); // Último día del mes

  if (TipoNotificacion === "Inicial") {
    // TipoNotificacion "Inicial": 8:00 PM del día anterior hasta 8:00 AM de hoy
    fechaInicio = currentDate.clone().set({ hour: 20, minute: 0, second: 0, millisecond: 0 }).subtract(1, 'days');
    fechaFin = currentDate.clone().set({ hour: 8, minute: 0, second: 0, millisecond: 0 });
  } else if (TipoNotificacion === "Final") {
    // TipoNotificacion "Final": 8:00 AM de hoy hasta 8:00 PM de hoy
    fechaInicio = currentDate.clone().set({ hour: 8, minute: 0, second: 0, millisecond: 0 });
    fechaFin = currentDate.clone().set({ hour: 20, minute: 0, second: 0, millisecond: 0 });
  } else if (TipoNotificacion === "Historico") {
    // TipoNotificacion "Historico": Todos los leads desde el inicio del mes hasta el final del mes
    fechaInicio = startOfMonth;
    fechaFin = endOfMonth;
  } else {
    // Si el TipoNotificacion no es válido, retornamos un error
    return res.status(400).json({ message: "TipoNotificacion inválido" });
  }

  console.log(`Fechas calculadas: ${fechaInicio.format()} - ${fechaFin.format()}`);

  // Usar la función para obtener el token
  const token = await GetTokenZOHO();
  console.log(token); // Imprime el access_token

  try {
    // Llamada a la función getLeads para obtener los leads dentro de las fechas
    const informacion = await getLeads(token);
    const leads = informacion.detallesSinTocar || [];  // Leads con "Sin Tocar"
    console.log(leads[0].firstPage);  // Mostrar los leads obtenidos
    // Inicializamos el objeto para agrupar por ramo
    const agrupadoPorRamos = {};
    const historicoLeads = {};  // Para almacenar los leads históricos
    const leadsEcommerce = []; // Para almacenar los leads que han evolucionado a E-COMMERCE
    let totalGeneral = { total: 0, SEM: 0, SEO: 0, FBK: 0, otros: 0 };

    // Filtramos los leads según el rango de fechas
    const leadsFiltrados = leads.filter(lead => {
      const createdTime = moment(lead.Created_Time); // Convertir Created_Time a objeto moment
      return createdTime.isBetween(fechaInicio, fechaFin, null, '[]');  // Comparar si está entre las fechas
    });

    // Filtramos todos los leads del mes (históricos)
    const leadsHistoricos = leads.filter(lead => {
      const createdTime = moment(lead.Created_Time);
      return createdTime.isBetween(startOfMonth, endOfMonth, null, '[]');
    });

    // Llenamos los datos históricos
    historicoLeads.total = leadsHistoricos.length;
    historicoLeads.SEM = leadsHistoricos.filter(lead => lead.Lead_Source.endsWith("SEM")).length;
    historicoLeads.SEO = leadsHistoricos.filter(lead => lead.Lead_Source.includes("SEO")).length;
    historicoLeads.FBK = leadsHistoricos.filter(lead => lead.Lead_Source.includes("FBK")).length;
    historicoLeads.otros = leadsHistoricos.filter(lead => !lead.Lead_Source.includes("SEM") && !lead.Lead_Source.includes("SEO") && !lead.Lead_Source.includes("FBK")).length;

    // Iteramos por los leads filtrados para agruparlos por ramo y luego por fuente
    leadsFiltrados.forEach(lead => {
      let ramo = lead.Ramo || "Otros";  // Si no hay ramo, se asigna "Otros"
      let leadSource = lead.Lead_Source || "";  // Obtenemos el campo Lead_Source
      let estrategia = ""; // Campo estrategia que asignaremos según el caso

      // Verificamos si el lead pertenece a una URL de E-COMMERCE, para asociarlo con SEM, SEO o FBK
      if (landingPages.SEM.some(lp => lead.firstPage && lead.firstPage.includes(lp)) && leadSource.includes("E-COMMERCE")) {
        estrategia = "SEM";
        lead.estrategia = estrategia;  // Asignamos la estrategia al lead
        leadsEcommerce.push(lead);  // Agregamos a la lista de E-COMMERCE
      } else if (landingPages.SEO.some(lp => lead.firstPage && lead.firstPage.includes(lp)) && leadSource.includes("E-COMMERCE")) {
        estrategia = "SEO";
        lead.estrategia = estrategia;  // Asignamos la estrategia al lead
        leadsEcommerce.push(lead);  // Agregamos a la lista de E-COMMERCE
      } else if (landingPages.FBK.some(lp => lead.firstPage && lead.firstPage.includes(lp)) && leadSource.includes("E-COMMERCE")) {
        estrategia = "FBK";
        lead.estrategia = estrategia;  // Asignamos la estrategia al lead
        leadsEcommerce.push(lead);  // Agregamos a la lista de E-COMMERCE
      } else {
        // Si no es E-commerce, asignamos la estrategia normal según el Lead_Source
        if (leadSource.endsWith("SEM")) {
          estrategia = "SEM";
        } else if (leadSource.includes("SEO") || leadSource.includes("Blog")) {
          estrategia = "SEO";
        } else if (leadSource.includes("FBK")) {
          estrategia = "FBK";
        } else {
          estrategia = "Otros";
        }
        lead.estrategia = estrategia; // Asignamos la estrategia normal al lead
      }

      // Si el Lead_Source es "LP-GYA", lo agrupamos bajo Asociados
      if (leadSource === "LP-GYA") {
        ramo = "Asociados - Galindo";
      }

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
      totalGeneral.total++;  // Sumamos al total general
      if (estrategia === "SEM") {
        agrupadoPorRamos[ramo].SEM++;
        totalGeneral.SEM++;
      } else if (estrategia === "SEO") {
        agrupadoPorRamos[ramo].SEO++;
        totalGeneral.SEO++;
      } else if (estrategia === "FBK") {
        agrupadoPorRamos[ramo].FBK++;
        totalGeneral.FBK++;
      } else {
        agrupadoPorRamos[ramo].otros++;
        totalGeneral.otros++;
      }

      // Añadimos el lead a la lista del ramo correspondiente
      agrupadoPorRamos[ramo].leads.push({
        id: lead.id,
        Full_Name: lead.Full_Name,
        Estatus_Lead_Prospecto: lead.Estatus_Lead_Prospecto,
        Telefono: lead.Mobile,
        Created_Time: lead.Created_Time,
        Lead_Source: leadSource || "N/A",
        MKT_Campaigns: lead.MKT_Campaigns || "N/A",
        estrategia: lead.estrategia || "N/A", // Añadimos el campo de estrategia
        firstPage: lead.firstPage || "N/A"
      });
    });

    // Crear el objeto de respuesta con la información organizada por ramos
    const response = {
      message: "Notificación enviada",
      total: leadsFiltrados.length,   // Total de registros encontrados
      totalGeneral: totalGeneral,  // Agregar el total general
      agrupadoPorRamos: agrupadoPorRamos,  // Ramo agrupado con leads y cantidades
      historicoLeads: historicoLeads,  // Leads históricos
      leadsEcommerce: leadsEcommerce  // Leads de E-Commerce
    };
    console.log(leadsEcommerce);
    // Llamada para enviar el correo con el cuerpo y los detalles
    await enviarCorreo(response, NotificarMail, TipoNotificacion);  // Enviar los detalles al correo

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


const fetchAllLeads = async (url, myHeaders) => {
  let allLeads = [];
  let hasNextPage = true;
  let nextPageToken = '';

  // Mientras haya más páginas
  while (hasNextPage) {
    let requestUrl = url;
    if (nextPageToken) {
      requestUrl += `&page_token=${nextPageToken}`;  // Añadir el token de la siguiente página
    }

    try {
      const response = await fetch(requestUrl, {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
      });

      // Obtenemos la respuesta y la convertimos en JSON
      const result = await response.json();

      // Agregamos los leads a la lista total
      allLeads = allLeads.concat(result.data);

      // Verificamos si hay más registros
      hasNextPage = result.info.more_records;

      // Si hay más páginas, actualizamos el token para la siguiente solicitud
      nextPageToken = result.info.next_page_token;
    } catch (error) {
      console.error("Error en la solicitud de la API:", error);
      break;
    }
  }

  return allLeads;  // Regresamos todos los leads combinados
};

// Función para obtener leads
async function getLeads(token) {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Zoho-oauthtoken ${token}`);
  myHeaders.append("Accept", "application/json");  // Cambié a JSON, ya que estás trabajando con objetos en formato JSON
  myHeaders.append("Cookie", "_zcsr_tmp=5cd7c811-88f6-4f4e-8316-ff6df3d261c1; crmcsr=5cd7c811-88f6-4f4e-8316-ff6df3d261c1; group_name=usergroup2; zalb_1a99390653=47948cd9e3fe72a2701dbc53294d291e");

  // Crear la URL con las fechas dinámicamente
  const url = `https://www.zohoapis.com/crm/v7/Leads?cvid=2731176000504916665`;

  // Obtenemos todos los leads
  const leads = await fetchAllLeads(url, myHeaders);

  // Filtrar los leads "Sin Tocar"
  const sinTocar = leads.filter(lead => lead.Estatus_Lead_Prospecto === "Sin Tocar");
  const otrosStatus = leads.filter(lead => lead.Estatus_Lead_Prospecto !== "Sin Tocar");

  // Resultado final con los detalles
  const responseJson = {
    message: "OK",
    cantidadSinTocar: sinTocar.length,
    cantidadOtros: otrosStatus.length,
    detallesSinTocar: sinTocar,
    detallesOtros: otrosStatus
  };

  return responseJson;  // Regresar el JSON con los detalles
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
const enviarCorreo = async (response, NotificarMail, TipoNotificacion) => {
  // Convertir el valor de NotificarMail a booleano
  NotificarMail = NotificarMail === "True" || NotificarMail === true;

  const currentTimeCDMX = moment().tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss');
  // Asignar el asunto según el tipo de notificación
  let subject = "Notificación de Leads Sin Tocar";

  // Condicional para modificar el asunto según el tipo de notificación
  if (TipoNotificacion === "Inicial") {
    subject += " Apertura";  // Si es "Inicial", se agrega "Apertura"
  } else if (TipoNotificacion === "Final") {
    subject += " Cierre";  // Si es "Final", se agrega "Cierre"
  } else if (TipoNotificacion === "Historico") {
    subject += " Histórico";  // Si es "Historico", se agrega "Histórico"
  }
  console.log(NotificarMail);  // Verificar el valor booleano de NotificarMail

  const { agrupadoPorRamos, totalGeneral, historicoLeads, leadsEcommerce } = response;
  console.log(totalGeneral);  // Mostrar el total general de leads
  console.log(leadsEcommerce);  // Mostrar los leads leadsEcommerce
  console.log(leadsEcommerce.length);  // Mostrar la cantidad de leads E-COMMERCE
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
          .table th, .table td { padding: 8px; text-align: center; border: 1px solid #ddd; }
          .summary { font-size: 18px; margin-bottom: 20px; }
          .total { font-weight: bold; font-size: 24px; color: #e74c3c; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${subject}</h1>
          <p><strong>Fecha de Envío:</strong> ${currentTimeCDMX}</p>

          <!-- Resumen de Leads Sin Tocar del Día -->
          <h3>Total de Leads Sin Tocar (Día): <span class="total">${response.total}</span></h3>
          <table class="table">
            <tr><th>Ramo</th><th>Total</th><th>SEM</th><th>SEO</th><th>FBK</th><th>Otros</th></tr>`;

  // Agregar los resúmenes por ramo para el día
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
  
  htmlContent += `</table>`;

  // Resumen Histórico de Leads Sin Tocar
  htmlContent += `<h3>Total de Leads Sin Tocar Histórico (Mes): <span class="total">${historicoLeads.total}</span></h3>
    <table class="table">
      <tr><th>Ramo</th><th>Total</th><th>SEM</th><th>SEO</th><th>FBK</th><th>Otros</th></tr>`;

  // Agregar los resúmenes por ramo históricos
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

  htmlContent += `</table>`;

  // E-commerce: Resumen por Estrategia (Si existen Leads de E-commerce)
  if (leadsEcommerce.length > 0) {
    htmlContent += `<h3>Total de Leads E-commerce (Día): <span class="total">${leadsEcommerce.length}</span></h3>`;

    // E-commerce: Agrupar por Ramo y Estrategia (SEM, SEO, FBK)
    const agrupadoEcommerce = {};
    leadsEcommerce.forEach(lead => {
      let ramo = lead.Ramo || "Otros";  // Asignamos un ramo si no está definido
      let estrategia = lead.estrategia || "Otros";  // Usamos el campo 'estrategia' que definimos previamente

      if (!agrupadoEcommerce[ramo]) {
        agrupadoEcommerce[ramo] = {
          SEM: 0,
          SEO: 0,
          FBK: 0,
          otros: 0,
          leads: []
        };
      }

      // Contabilizamos los leads por estrategia
      if (estrategia === "SEM") agrupadoEcommerce[ramo].SEM++;
      if (estrategia === "SEO") agrupadoEcommerce[ramo].SEO++;
      if (estrategia === "FBK") agrupadoEcommerce[ramo].FBK++;
      if (estrategia === "Otros") agrupadoEcommerce[ramo].otros++;

      // Añadimos el lead al ramo correspondiente
      agrupadoEcommerce[ramo].leads.push(lead);
    });
    htmlContent += `<table class="table">
    <tr><th>Ramo</th><th>Total</th><th>SEM</th><th>SEO</th><th>FBK</th><th>Otros</th></tr>`;

    // Agregar los resúmenes por ramo y estrategia de E-commerce
    for (const ramo in agrupadoEcommerce) {
      const ramoData = agrupadoEcommerce[ramo];
      htmlContent += `
        <tr>
          <td>${ramo}</td>
          <td>${ramoData.SEM + ramoData.SEO + ramoData.FBK + ramoData.otros}</td>
          <td>${ramoData.SEM}</td>
          <td>${ramoData.SEO}</td>
          <td>${ramoData.FBK}</td>
          <td>${ramoData.otros}</td>
        </tr>`;
    }

    htmlContent += `</table>`;

    // Detalles de los leads E-commerce
    htmlContent += `<h3>Detalles de los Leads E-commerce (Día):</h3>`;
    htmlContent += `<table class="table">
      <tr><th>ID</th><th>Nombre</th><th>Lead Source</th><th>MKT Campaigns</th><th>Fecha de Creación</th></tr>`;

    // Iteramos por los leads de E-commerce
    leadsEcommerce.forEach(lead => {
      htmlContent += `
        <tr>
          <td>${lead.id}</td>
          <td>${lead.Full_Name}</td>
          <td>${lead.Lead_Source}</td>
          <td>${lead.MKT_Campaigns}</td>
          <td>${lead.Created_Time}</td>
        </tr>`;
    });

    htmlContent += `</table>`;
  } else {
    htmlContent += `<p>No hay datos de E-commerce para el Día.</p>`;
  }
    // Aquí finaliza E-Commerce
   // Detalles de los Leads del Día que no han sido tocados, por ramo y estrategia
  htmlContent += `<h3>Detalles de los Leads Sin Tocar (Día) por Ramo y Estrategia:</h3>`;

  // Iteramos por los ramos para mostrar los leads organizados por Estrategia
  for (const ramo in agrupadoPorRamos) {
    // Omitimos el ramo "Asociados - Galindo"
    if (ramo === "Asociados - Galindo") {
      continue;  // Skip this iteration and move to the next ramo
    }

    htmlContent += `<h4>Ramo: ${ramo}</h4>`; // Mostrar el ramo como título
    
    // Agregar cada estrategia como tabla dentro del ramo
    htmlContent += `<h5>SEM:</h5>`;
    htmlContent += `<table class="table">
        <tr><th>ID</th><th>Nombre</th><th>Lead Source</th><th>MKT Campaigns</th><th>Fecha de Creación</th></tr>`;
    agrupadoPorRamos[ramo].leads.filter(lead => lead.estrategia === 'SEM').forEach(lead => {
      htmlContent += `
        <tr>
          <td>${lead.id}</td>
          <td>${lead.Full_Name}</td>
          <td>${lead.Lead_Source}</td>
          <td>${lead.MKT_Campaigns}</td>
          <td>${lead.Created_Time}</td>
        </tr>`;
    });
    htmlContent += `</table>`;

    // SEO
    htmlContent += `<h5>SEO:</h5>`;
    htmlContent += `<table class="table">
        <tr><th>ID</th><th>Nombre</th><th>Lead Source</th><th>MKT Campaigns</th><th>Fecha de Creación</th></tr>`;
    agrupadoPorRamos[ramo].leads.filter(lead => lead.estrategia === 'SEO').forEach(lead => {
      htmlContent += `
        <tr>
          <td>${lead.id}</td>
          <td>${lead.Full_Name}</td>
          <td>${lead.Lead_Source}</td>
          <td>${lead.MKT_Campaigns}</td>
          <td>${lead.Created_Time}</td>
        </tr>`;
    });
    htmlContent += `</table>`;

    // FBK
    htmlContent += `<h5>FBK:</h5>`;
    htmlContent += `<table class="table">
        <tr><th>ID</th><th>Nombre</th><th>Lead Source</th><th>MKT Campaigns</th><th>Fecha de Creación</th></tr>`;
    agrupadoPorRamos[ramo].leads.filter(lead => lead.estrategia === 'FBK').forEach(lead => {
      htmlContent += `
        <tr>
          <td>${lead.id}</td>
          <td>${lead.Full_Name}</td>
          <td>${lead.Lead_Source}</td>
          <td>${lead.MKT_Campaigns}</td>
          <td>${lead.Created_Time}</td>
        </tr>`;
    });
    htmlContent += `</table>`;

    // Otros
    htmlContent += `<h5>Otros:</h5>`;
    htmlContent += `<table class="table">
        <tr><th>ID</th><th>Nombre</th><th>Lead Source</th><th>MKT Campaigns</th><th>Fecha de Creación</th></tr>`;
    agrupadoPorRamos[ramo].leads.filter(lead => lead.estrategia === 'Otros').forEach(lead => {
      htmlContent += `
        <tr>
          <td>${lead.id}</td>
          <td>${lead.Full_Name}</td>
          <td>${lead.Lead_Source}</td>
          <td>${lead.MKT_Campaigns}</td>
          <td>${lead.Created_Time}</td>
        </tr>`;
    });
    htmlContent += `</table>`;
  }

  htmlContent += `</table>`;

  

  // Si NotificarMail es false, no enviamos el correo, solo retornamos
  if (!NotificarMail) {
    console.log("Correo armado pero no enviado, NotificarMail es false.");
    return;  // Detener la ejecución aquí si No se requiere el envío de correo
  }

  // Si NotificarMail es true, enviamos el correo
  const mailOptions = {
    from: 'aruiz@segurointeligente.mx',
    to: 'aruiz@siaqs.com',  // Destinatarios del correo
    //cc: ['ehernandez@segurointeligente.mx','eescoto@segurointeligente.mx', 'cguzman@segurointeligente.mx', 'lalonso@segurointeligente.mx','mgarcia@segurointeligente.mx','aescamilla@segurointeligente.mx'],
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

const GetTokenZOHO = async () => {
  const myHeaders = new Headers();
  myHeaders.append("Cookie", "JSESSIONID=E919B1D5E331F0A1A5BD54CAB583863E; _zcsr_tmp=7fa9e2d1-1269-474d-8747-ca22d69ebac3; iamcsr=7fa9e2d1-1269-474d-8747-ca22d69ebac3; stk=799bb133510255490a1dd74e3c181b39; zalb_b266a5bf57=89d92f43aea9a45e372e725091716b73; zalb_e188bc05fe=174cb1181e0243f254fb6f0b5093b340");

  const formdata = new FormData();
  formdata.append("client_id", "1000.QJ6Y35YQES8I0OHI0Y6SOU1AX8M8NZ");
  formdata.append("client_secret", "538dce75db721631b19ea2f68a2b5d35f3d253490d");
  formdata.append("refresh_token", "1000.13cef90d982ab913fd0c1931306ffb3c.0f5ac8c9663de4a944e287f404e3aef1");
  formdata.append("grant_type", "refresh_token");

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: formdata,
    redirect: "follow"
  };

  try {
    const response = await fetch("https://accounts.zoho.com/oauth/v2/token", requestOptions);
    const result = await response.json();
    
    // Devuelves el objeto completo, o solo el `access_token` si lo necesitas
    return result.access_token; // Retorna solo el access_token si es lo que necesitas
  } catch (error) {
    console.error('Error al obtener el token:', error);
    throw error; // Lanza el error si algo falla
  }
};

// Definir las landing pages para SEM, SEO y FBK
const landingPages = {
  SEM: [
    "https://segurointeligente.mx/landingpages/QUALITAS/",
    "https://segurointeligente.mx/landingpages/AXA/",
    "https://segurointeligente.mx/seguro-autos/"
    // Puedes agregar más LPs aquí para SEM
  ],
  SEO: [
    "https://segurointeligente.mx/qualitas-seguros/", // Ejemplo de LP para SEO
    // Puedes agregar más LPs aquí para SEO
  ],
  FBK: [
    "https://segurointeligente.mx/qualitas-fbk/", // Ejemplo de LP para FBK
    // Puedes agregar más LPs aquí para FBK
  ]
};
