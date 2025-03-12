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

  let fechaInicio, fechaFin;

  const currentDate = moment().tz('America/Mexico_City'); // Fecha y hora actual en CDMX
  const startOfMonth = currentDate.clone().startOf('month'); // Primer día del mes
  const endOfMonth = currentDate.clone().endOf('month'); // Último día del mes
  
  if (TipoNotificacion === "Inicial") {
   // Configuramos fechaInicio para las 00:00 del día vigente en la zona horaria de CDMX
    fechaInicio = currentDate.clone().startOf('day'); // 00:00:00
    fechaInicio = fechaInicio.format('YYYY-MM-DDTHH:mm:ss.SSSZ')
  // Configuramos fechaFin para las 23:59 del día vigente en la zona horaria de CDMX
    fechaFin = currentDate.clone().endOf('day'); // 23:59:59
    fechaFin = fechaFin.format('YYYY-MM-DDTHH:mm:ss.SSSZ');
  } else if (TipoNotificacion === "Final") {
    // Configuramos fechaInicio para las 00:00 del día actual
    fechaInicio = currentDate.clone().startOf('day');
    // Configuramos fechaFin para las 23:59 del día actual
    fechaFin = currentDate.clone().endOf('day');
  } else if (TipoNotificacion === "Historico") {
    fechaInicio = startOfMonth;
    fechaFin = endOfMonth;
  } else {
    return res.status(400).json({ message: "TipoNotificacion inválido" });
  }

  const token = await GetTokenZOHO();
  const Vista = "2731176000504916665";

  try {
    const informacion = await getLeads(token, Vista);
    const leads = informacion.detallesSinTocar || [];

    const agrupadoPorRamos = {};
    const historicoLeads = { SEM: 0, SEO: 0, FBK: 0, otros: 0 }; // Inicializar el objeto historicoLeads
    const leadsEcommerce = [];
    let totalGeneral = { total: 0, SEM: 0, SEO: 0, FBK: 0, otros: 0 };

    const leadsFiltrados = leads.filter(lead => {
      const createdTime = moment(lead.Created_Time);
      return createdTime.isBetween(fechaInicio, fechaFin, null, '[]');
    });

    // Filtramos todos los leads del mes (históricos)
    const leadsHistoricos = leads.filter(lead => {
      const createdTime = moment(lead.Created_Time);
      return createdTime.isBetween(startOfMonth, endOfMonth, null, '[]');
    });

    // Llenamos los datos históricos
    historicoLeads.total = leadsHistoricos.length;
    historicoLeads.SEM = leadsHistoricos.filter(lead => lead.Lead_Source.includes("SEM")).length;
    historicoLeads.SEO = leadsHistoricos.filter(lead => lead.Lead_Source.includes("SEO")).length;
    historicoLeads.FBK = leadsHistoricos.filter(lead => lead.Lead_Source.includes("FBK")).length;
    historicoLeads.otros = leadsHistoricos.filter(lead => !lead.Lead_Source.includes("SEM") && !lead.Lead_Source.includes("SEO") && !lead.Lead_Source.includes("FBK")).length;

    leadsFiltrados.forEach(lead => {
      let ramo = lead.Ramo || "Otros";
      let leadSource = lead.Lead_Source || "";
      let estrategia = "";

      if (landingPages.SEM.some(lp => lead.firstPage && lead.firstPage.includes(lp)) && leadSource.includes("E-COMMERCE")) {
        estrategia = "SEM";
        lead.estrategia = estrategia;
        leadsEcommerce.push(lead);
      } else if (landingPages.SEO.some(lp => lead.firstPage && lead.firstPage.includes(lp)) && leadSource.includes("E-COMMERCE")) {
        estrategia = "SEO";
        lead.estrategia = estrategia;
        leadsEcommerce.push(lead);
      } else if (landingPages.FBK.some(lp => lead.firstPage && lead.firstPage.includes(lp)) && leadSource.includes("E-COMMERCE")) {
        estrategia = "FBK";
        lead.estrategia = estrategia;
        leadsEcommerce.push(lead);
      } else {
        if (leadSource.endsWith("SEM")) {
          estrategia = "SEM";
        } else if (leadSource.includes("SEO") || leadSource.includes("Blog")) {
          estrategia = "SEO";
        } else if (leadSource.includes("FBK")) {
          estrategia = "FBK";
        } else {
          estrategia = "Otros";
        }
        lead.estrategia = estrategia;
      }

      if (leadSource === "LP-GYA") {
        ramo = "Asociados - Galindo";
      }

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

      agrupadoPorRamos[ramo].total++;
      totalGeneral.total++;
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

      agrupadoPorRamos[ramo].leads.push({
        id: lead.id,
        Full_Name: lead.Full_Name,
        Estatus_Lead_Prospecto: lead.Estatus_Lead_Prospecto,
        Telefono: lead.Mobile,
        Created_Time: lead.Created_Time,
        Lead_Source: leadSource || "N/A",
        MKT_Campaigns: lead.MKT_Campaigns || "N/A",
        estrategia: lead.estrategia || "N/A",
        firstPage: lead.firstPage || "N/A"
      });
    });

    // Estructura de historicoLeads ajustada para ser agrupada por ramo y estrategia
    const agrupadoHistorico = {};  // Nueva estructura para leads históricos

    // Llenamos los datos históricos (por ramo y estrategia)
    leadsHistoricos.forEach(lead => {
      let ramo = lead.Ramo || "Otros";  // Asignar un ramo si no está definido
      let estrategia = ""; // Campo estrategia que asignaremos según el caso

      // Asignamos la estrategia dependiendo del Lead_Source
      if (lead.Lead_Source.endsWith("SEM")) {
        estrategia = "SEM";
      } else if (lead.Lead_Source.includes("SEO")) {
        estrategia = "SEO";
      } else if (lead.Lead_Source.includes("FBK")) {
        estrategia = "FBK";
      } else {
        estrategia = "Otros";
      }

      // Inicializamos la estructura del ramo si no existe
      if (!agrupadoHistorico[ramo]) {
        agrupadoHistorico[ramo] = {
          SEM: 0,
          SEO: 0,
          FBK: 0,
          otros: 0,
          total: lead.length,
          leads: []
        };
      }

      // Contabilizamos los leads por estrategia
      if (estrategia === "SEM") agrupadoHistorico[ramo].SEM++;
      if (estrategia === "SEO") agrupadoHistorico[ramo].SEO++;
      if (estrategia === "FBK") agrupadoHistorico[ramo].FBK++;
      if (estrategia === "Otros") agrupadoHistorico[ramo].otros++;

      // Añadimos el lead al ramo correspondiente
      agrupadoHistorico[ramo].leads.push(lead);
    });
    console.log(agrupadoHistorico)
    // Ahora agrupadoHistorico contiene los datos agrupados por ramo y estrategia

    const response = {
      message: "Notificación enviada",
      rango: { fechaInicio , fechaFin },
      total: leadsFiltrados.length,
      totalGeneral: totalGeneral,
      historicoLeads: historicoLeads,  // Aseguramos que historicoLeads está correctamente poblado
      agrupadoPorRamos: agrupadoPorRamos,
      leadsEcommerce: leadsEcommerce,
      agrupadoHistorico: agrupadoHistorico
    };

    await enviarCorreo(response, NotificarMail, TipoNotificacion);

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Hubo un error al procesar la notificación",
      error: error.message
    });
  }
};

// Notificación Diaria: Leads Sin Tocar
export const NotificacionDiariaLeadsSimple = async (req, res) => {
  const { TipoNotificacion, NotificarMail } = req.params;

  let fechaInicio, fechaFin;

  const currentDate = moment().tz('America/Mexico_City'); // Fecha y hora actual en CDMX
  const startOfMonth = currentDate.clone().startOf('month'); // Primer día del mes
  const endOfMonth = currentDate.clone().endOf('month'); // Último día del mes
  
  if (TipoNotificacion === "Inicial") {
    // Configuramos fechaInicio para las 00:00 del día vigente en la zona horaria de CDMX
    fechaInicio = currentDate.clone().startOf('day'); // 00:00:00
    fechaInicio = fechaInicio.format('YYYY-MM-DDTHH:mm:ss.SSSZ')
    // Configuramos fechaFin para las 23:59 del día vigente en la zona horaria de CDMX
    fechaFin = currentDate.clone().endOf('day'); // 23:59:59
    fechaFin = fechaFin.format('YYYY-MM-DDTHH:mm:ss.SSSZ');
  } else if (TipoNotificacion === "Final") {
    // Configuramos fechaInicio para las 00:00 del día actual
    fechaInicio = currentDate.clone().startOf('day');
    // Configuramos fechaFin para las 23:59 del día actual
    fechaFin = currentDate.clone().endOf('day');
  } else if (TipoNotificacion === "Historico") {
    fechaInicio = startOfMonth;
    fechaFin = endOfMonth;
  } else {
    return res.status(400).json({ message: "TipoNotificacion inválido" });
  }

  const token = await GetTokenZOHO();
  const Vista = "2731176000504916665";

  try {
    const informacion = await getLeads(token, Vista);
    const leads = informacion.detallesSinTocar || [];

    const agrupadoPorRamos = {};
    const historicoLeads = { SEM: 0, SEO: 0, FBK: 0, otros: 0 }; // Inicializar el objeto historicoLeads
    const leadsEcommerce = [];
    let totalGeneral = { total: 0, SEM: 0, SEO: 0, FBK: 0, otros: 0 };

    const leadsFiltrados = leads.filter(lead => {
      const createdTime = moment(lead.Created_Time);
      return createdTime.isBetween(fechaInicio, fechaFin, null, '[]');
    });

    // Filtramos todos los leads del mes (históricos)
    const leadsHistoricos = leads.filter(lead => {
      const createdTime = moment(lead.Created_Time);
      return createdTime.isBetween(startOfMonth, endOfMonth, null, '[]');
    });

    // Llenamos los datos históricos
    historicoLeads.total = leadsHistoricos.length;
    historicoLeads.SEM = leadsHistoricos.filter(lead => lead.Lead_Source.includes("SEM")).length;
    historicoLeads.SEO = leadsHistoricos.filter(lead => lead.Lead_Source.includes("SEO")).length;
    historicoLeads.FBK = leadsHistoricos.filter(lead => lead.Lead_Source.includes("FBK")).length;
    historicoLeads.otros = leadsHistoricos.filter(lead => !lead.Lead_Source.includes("SEM") && !lead.Lead_Source.includes("SEO") && !lead.Lead_Source.includes("FBK")).length;

    // Agregar los leads agrupados por "Agente" y "Ventas" para el día
    const leadsAgentes = {}; // Agrupado por Ramo y Estrategia
    const leadsVentas = {}; // Agrupado por Ramo y Estrategia

    // Agregar los leads agrupados por "Agente" y "Ventas" para el histórico
    const leadsAgentesHistoricos = {}; // Agrupado por Ramo y Estrategia
    const leadsVentasHistoricos = {}; // Agrupado por Ramo y Estrategia

    
    const agregarLeadAlGrupo = (grupo, ramo, estrategia, lead) => {
      console.log(lead);
      
      // Si no existe el ramo en el grupo, inicializamos su estructura.
      if (!grupo[ramo]) {
        grupo[ramo] = {
          SEM: 0,
          SEO: 0,
          FBK: 0,
          otros: 0,
          total: 0, // Inicializamos el total como número
          leads: []  // Para almacenar los leads asociados a este ramo
        };
      }
    
      // Incrementamos el contador según la estrategia.
      if (estrategia === "SEM") grupo[ramo].SEM++;
      if (estrategia === "SEO") grupo[ramo].SEO++;
      if (estrategia === "FBK") grupo[ramo].FBK++;
      if (estrategia === "Otros") grupo[ramo].otros++;
    
      // Incrementamos el total de leads para este ramo.
      grupo[ramo].total++; // Incrementa el total por cada lead agregado.
    
      // Agregamos el lead a la lista de leads para este ramo.
      grupo[ramo].leads.push(lead);
    };
    

    leadsFiltrados.forEach(lead => {
      let ramo = lead.Ramo || "Otros";
      let leadSource = lead.Lead_Source || "";
      let estrategia = "";

      if (landingPages.SEM.some(lp => lead.firstPage && lead.firstPage.includes(lp)) && leadSource.includes("E-COMMERCE")) {
        estrategia = "SEM";
        lead.estrategia = estrategia;
        leadsEcommerce.push(lead);
      } else if (landingPages.SEO.some(lp => lead.firstPage && lead.firstPage.includes(lp)) && leadSource.includes("E-COMMERCE")) {
        estrategia = "SEO";
        lead.estrategia = estrategia;
        leadsEcommerce.push(lead);
      } else if (landingPages.FBK.some(lp => lead.firstPage && lead.firstPage.includes(lp)) && leadSource.includes("E-COMMERCE")) {
        estrategia = "FBK";
        lead.estrategia = estrategia;
        leadsEcommerce.push(lead);
      } else {
        if (leadSource.endsWith("SEM")) {
          estrategia = "SEM";
        } else if (leadSource.includes("SEO") || leadSource.includes("Blog")) {
          estrategia = "SEO";
        } else if (leadSource.includes("FBK")) {
          estrategia = "FBK";
        } else {
          estrategia = "Otros";
        }
        lead.estrategia = estrategia;
      }

      if (leadSource === "LP-GYA") {
        ramo = "Asociados - Galindo";
      }

      // Agrupamos los leads en el agrupadoPorRamos
      agregarLeadAlGrupo(agrupadoPorRamos, ramo, estrategia, lead);

      // Agrupamos los leads para Agentes y Ventas
      if (lead.GRUPO === "Agente") {
        agregarLeadAlGrupo(leadsAgentes, ramo, estrategia, lead);
      } else if (lead.GRUPO === "Ventas") {
        agregarLeadAlGrupo(leadsVentas, ramo, estrategia, lead);
      }
    });

    // Ahora procesamos los leads históricos de Agentes y Ventas
    leadsHistoricos.forEach(lead => {
      let ramo = lead.Ramo || "Otros";
      let leadSource = lead.Lead_Source || "";
      let estrategia = "";

      if (landingPages.SEM.some(lp => lead.firstPage && lead.firstPage.includes(lp)) && leadSource.includes("E-COMMERCE")) {
        estrategia = "SEM";
      } else if (landingPages.SEO.some(lp => lead.firstPage && lead.firstPage.includes(lp)) && leadSource.includes("E-COMMERCE")) {
        estrategia = "SEO";
      } else if (landingPages.FBK.some(lp => lead.firstPage && lead.firstPage.includes(lp)) && leadSource.includes("E-COMMERCE")) {
        estrategia = "FBK";
      } else {
        if (leadSource.endsWith("SEM")) {
          estrategia = "SEM";
        } else if (leadSource.includes("SEO") || leadSource.includes("Blog")) {
          estrategia = "SEO";
        } else if (leadSource.includes("FBK")) {
          estrategia = "FBK";
        } else {
          estrategia = "Otros";
        }
      }

      if (leadSource === "LP-GYA") {
        ramo = "Asociados - Galindo";
      }

      // Agrupamos los leads históricos en Agentes y Ventas
      if (lead.GRUPO === "Agente") {
        agregarLeadAlGrupo(leadsAgentesHistoricos, ramo, estrategia, lead);
      } else if (lead.GRUPO === "Ventas") {
        agregarLeadAlGrupo(leadsVentasHistoricos, ramo, estrategia, lead);
      }
    });

    // Actualizar totalGeneral con los totales del día
    totalGeneral.total = leadsFiltrados.length;
    totalGeneral.SEM = leadsFiltrados.filter(lead => lead.Lead_Source.includes("SEM")).length;
    totalGeneral.SEO = leadsFiltrados.filter(lead => lead.Lead_Source.includes("SEO")).length;
    totalGeneral.FBK = leadsFiltrados.filter(lead => lead.Lead_Source.includes("FBK")).length;
    totalGeneral.otros = leadsFiltrados.filter(lead => !lead.Lead_Source.includes("SEM") && !lead.Lead_Source.includes("SEO") && !lead.Lead_Source.includes("FBK")).length;
    // Estructura de historicoLeads ajustada para ser agrupada por ramo y estrategia
    const agrupadoHistorico = {};  // Nueva estructura para leads históricos

    // Llenamos los datos históricos (por ramo y estrategia)
    leadsHistoricos.forEach(lead => {
      let ramo = lead.Ramo || "Otros";  // Asignar un ramo si no está definido
      let estrategia = ""; // Campo estrategia que asignaremos según el caso

      // Asignamos la estrategia dependiendo del Lead_Source
      if (lead.Lead_Source.endsWith("SEM")) {
        estrategia = "SEM";
      } else if (lead.Lead_Source.includes("SEO")) {
        estrategia = "SEO";
      } else if (lead.Lead_Source.includes("FBK")) {
        estrategia = "FBK";
      } else {
        estrategia = "Otros";
      }

      // Inicializamos la estructura del ramo si no existe
      if (!agrupadoHistorico[ramo]) {
        agrupadoHistorico[ramo] = {
          SEM: 0,
          SEO: 0,
          FBK: 0,
          otros: 0,
          total: lead.length,
          leads: []
        };
      }

      // Contabilizamos los leads por estrategia
      if (estrategia === "SEM") agrupadoHistorico[ramo].SEM++;
      if (estrategia === "SEO") agrupadoHistorico[ramo].SEO++;
      if (estrategia === "FBK") agrupadoHistorico[ramo].FBK++;
      if (estrategia === "Otros") agrupadoHistorico[ramo].otros++;

      // Añadimos el lead al ramo correspondiente
      agrupadoHistorico[ramo].leads.push(lead);
    });

    const response = {
      message: "Notificación enviada",
      rango: { fechaInicio , fechaFin },
      total: leadsFiltrados.length,
      totalGeneral: totalGeneral,
      historicoLeads: historicoLeads,  // Aseguramos que historicoLeads está correctamente poblado
      agrupadoPorRamos: agrupadoPorRamos,
      agrupadoHistorico:agrupadoHistorico,
      leadsEcommerce: leadsEcommerce,
      leadsAgentes: leadsAgentes,  // Ahora los leads de Agentes agrupados por Ramo y Estrategia
      leadsVentas: leadsVentas,   // Ahora los leads de Ventas agrupados por Ramo y Estrategia
      leadsHistoricosAgentes: leadsAgentesHistoricos, // Nuevos leads históricos de Agentes
      leadsHistoricosVentas: leadsVentasHistoricos // Nuevos leads históricos de Ventas
    };

    await enviarCorreo(response, NotificarMail, TipoNotificacion);

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Hubo un error al procesar la notificación",
      error: error.message
    });
  }
};


// Notificación Diaria: Leads Sin Tocar
export const NotificacionDiariaLeadsLC = async (req, res) => {
  const { TipoNotificacion, NotificarMail } = req.body;

  let fechaInicio, fechaFin;

  const currentDate = moment().tz('America/Mexico_City'); // Fecha y hora actual en CDMX
  const startOfDay = currentDate.clone().startOf('day'); // Inicio del día (00:00)
  const endOfDay = currentDate.clone().endOf('day'); // Fin del día (23:59:59)

  // Establecer el rango de fechas según el tipo de notificación
  if (TipoNotificacion === "Inicial") {
    // Filtro para el inicio del día (00:00 - 08:00)
    fechaInicio = startOfDay.clone();
    fechaFin = endOfDay.clone();
  } else if (TipoNotificacion === "Final") {
    // Filtro para el resto del día (08:00 - 23:59)
    fechaInicio = startOfDay.clone();
    fechaFin = endOfDay.clone();
  } else if (TipoNotificacion === "Historico") {
    // Si es histórico, no filtramos por fecha, tomamos todo el mes
    fechaInicio = startOfDay.clone();
    fechaFin = endOfDay.clone();
  } else {
    return res.status(400).json({ message: "TipoNotificacion inválido" });
  }

  const token = await GetTokenZOHO();
  const Vista = "2731176000506201024";
  try {
    const informacion = await getLeadsLC(token, Vista);
    const leads = informacion.Totales || [];

    // Variables para organizar y clasificar los leads
    const agrupadoPorRamos = {};
    let historicoLeads = { SEM: 0, SEO: 0, FBK: 0, otros: 0 };
    let leadsFiltrados = {};
    let totalGeneral = { total: 0, SEM: 0, SEO: 0, FBK: 0, otros: 0 };

    const filteredLeads = leads.filter(lead => {
      const leadDate = moment(lead.Created_Time).tz('America/Mexico_City');
      return leadDate.isBetween(fechaInicio, fechaFin, null, '[]'); // Filtra por fecha solo si no es historico
    });
  
    // Llenamos los datos históricos de leads filtrados (todos los leads si es histórico)
    historicoLeads.total = leads.length;
    historicoLeads.SEM = leads.filter(lead => lead.Lead_Source.endsWith("SEM")).length;
    historicoLeads.SEO = leads.filter(lead => lead.Lead_Source.includes("SEO")).length;
    historicoLeads.FBK = leads.filter(lead => lead.Lead_Source.includes("FBK")).length;
    historicoLeads.otros = leads.filter(lead => !lead.Lead_Source.includes("SEM") && !lead.Lead_Source.includes("SEO") && !lead.Lead_Source.includes("FBK")).length;

    // Agrupar los leads filtrados por ramo
    const ramosDetectados = filteredLeads.reduce((acc, lead) => {
      const ramo = lead.Ramo || 'otros';
      if (!acc[ramo]) acc[ramo] = 0;
      acc[ramo]++;
      return acc;
    }, {});

    // Agrupar los leads detallados por ramo
    const leadsPorRamo = filteredLeads.reduce((acc, lead) => {
      const ramo = lead.Ramo || 'otros';
      if (!acc[ramo]) acc[ramo] = [];
      acc[ramo].push(lead);
      return acc;
    }, {});

    // Los datos por Ramo con total dinámico para el día
    leadsFiltrados = {
      total: filteredLeads.length,
      ...ramosDetectados
    };

    // Agregar el total de leads por ramo para el día
    const totalLeadsPorRamo = Object.keys(leadsPorRamo).reduce((acc, ramo) => {
      acc[ramo] = leadsPorRamo[ramo].length; // Total de leads por ramo
      return acc;
    }, {});

    // Crear el campo `leadsxdia` que contiene los leads organizados por Ramo y Estrategia
    const leadsxdia = Object.keys(leadsPorRamo).reduce((acc, ramo) => {
      acc[ramo] = {
        SEM: [],
        SEO: [],
        FBK: [],
        otros: []
      };
      // Clasificar los leads de cada ramo por estrategia
      leadsPorRamo[ramo].forEach(lead => {
        if (lead.Lead_Source.includes("SEM")) {
          acc[ramo].SEM.push(lead);
        } else if (lead.Lead_Source.includes("SEO")) {
          acc[ramo].SEO.push(lead);
        } else if (lead.Lead_Source.includes("FBK")) {
          acc[ramo].FBK.push(lead);
        } else {
          acc[ramo].otros.push(lead);
        }
      });
      return acc;
    }, {});

    // Actualizar totalGeneral con los totales del día
    totalGeneral.total = filteredLeads.length;
    totalGeneral.SEM = filteredLeads.filter(lead => lead.Lead_Source.includes("SEM")).length;
    totalGeneral.SEO = filteredLeads.filter(lead => lead.Lead_Source.includes("SEO")).length;
    totalGeneral.FBK = filteredLeads.filter(lead => lead.Lead_Source.includes("FBK")).length;
    totalGeneral.otros = filteredLeads.filter(lead => !lead.Lead_Source.includes("SEM") && !lead.Lead_Source.includes("SEO") && !lead.Lead_Source.includes("FBK")).length;
    console.log(totalGeneral)
    // Preparamos la respuesta para ser enviada al correo
    const response = {
      message: "Notificación enviada",
      totalGeneral: totalGeneral,  // Nuevo campo con los totales del día
      historicoLeads: historicoLeads,  // Datos históricos (si se aplica)
      LeadsxRamo: leadsFiltrados,
      totalLeadsPorRamo: totalLeadsPorRamo, // Total de leads por ramo
      leadsPorRamo: leadsPorRamo, // Desglose por ramo
      leadsxdia: leadsxdia, // Nuevos datos que incluyen leads por estrategia y ramo
      data: informacion
    };

    // Enviar el correo con la respuesta
    await enviarCorreoLC(response, NotificarMail, TipoNotificacion);
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

// Función para obtener leads Sin Tocar
async function getLeads(token, vista) {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Zoho-oauthtoken ${token}`);
  myHeaders.append("Accept", "application/json");  // Cambié a JSON, ya que estás trabajando con objetos en formato JSON
  myHeaders.append("Cookie", "_zcsr_tmp=5cd7c811-88f6-4f4e-8316-ff6df3d261c1; crmcsr=5cd7c811-88f6-4f4e-8316-ff6df3d261c1; group_name=usergroup2; zalb_1a99390653=47948cd9e3fe72a2701dbc53294d291e");

  // Crear la URL con las fechas dinámicamente
  const url = `https://www.zohoapis.com/crm/v7/Leads?cvid=${vista}`;

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

// Función para obtener leads
async function getLeadsLC(token, vista) {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Zoho-oauthtoken ${token}`);
  myHeaders.append("Accept", "application/json");  // Cambié a JSON, ya que estás trabajando con objetos en formato JSON
  myHeaders.append("Cookie", "_zcsr_tmp=5cd7c811-88f6-4f4e-8316-ff6df3d261c1; crmcsr=5cd7c811-88f6-4f4e-8316-ff6df3d261c1; group_name=usergroup2; zalb_1a99390653=47948cd9e3fe72a2701dbc53294d291e");

  // Crear la URL con las fechas dinámicamente
  const url = `https://www.zohoapis.com/crm/v7/Leads?cvid=${vista}`;
  
  // Obtenemos todos los leads
  const leads = await fetchAllLeads(url, myHeaders);

  // Filtrar los leads "Sin Tocar"
  const sinTocar = leads.filter(lead => lead.Estatus_Lead_Prospecto === "Sin Tocar");
  const ContactoEfectivo = leads.filter(lead => lead.Estatus_Lead_Prospecto === "Contacto Efectivo");
  const SinContactoefectivo = leads.filter(lead => lead.Estatus_Lead_Prospecto === "Sin Contacto efectivo");
  const Otros = leads.filter(lead => lead.Estatus_Lead_Prospecto !== "Sin Tocar" && lead.Estatus_Lead_Prospecto !== "Contacto Efectivo" && lead.Estatus_Lead_Prospecto !== "Sin Contacto efectivo");
  // Resultado final con los detalles
  const responseJson = {
    message: "OK",
    ContactoEfectivo: ContactoEfectivo.length,
    SinTocar: sinTocar.length,
    SinContactoefectivo: SinContactoefectivo.length,
    Otros : Otros.length,
    Totales : leads
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

  const { agrupadoPorRamos, agrupadoHistorico, totalGeneral, historicoLeads, leadsEcommerce, leadsAgentes, leadsVentas, leadsHistoricosAgentes,leadsHistoricosVentas } = response;
  
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

  // Agregar los resúmenes por ramo históricos desde agrupadoHistorico
  for (const ramo in agrupadoHistorico) {
    const ramoData = agrupadoHistorico[ramo];
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
  if (leadsEcommerce.length > 0) {
    htmlContent += `<h3>Total de Leads E-commerce (Día): <span class="total">${leadsEcommerce.length}</span></h3>`;
    
    // E-commerce: Agrupar por Ramo y Estrategia
    const agrupadoEcommerce = {};
    leadsEcommerce.forEach(lead => {
      let ramo = lead.Ramo || "Otros"; 
      let estrategia = lead.estrategia || "Otros";

      if (!agrupadoEcommerce[ramo]) {
        agrupadoEcommerce[ramo] = {
          SEM: 0,
          SEO: 0,
          FBK: 0,
          otros: 0,
          leads: []
        };
      }

      if (estrategia === "SEM") agrupadoEcommerce[ramo].SEM++;
      if (estrategia === "SEO") agrupadoEcommerce[ramo].SEO++;
      if (estrategia === "FBK") agrupadoEcommerce[ramo].FBK++;
      if (estrategia === "Otros") agrupadoEcommerce[ramo].otros++;

      agrupadoEcommerce[ramo].leads.push(lead);
    });

    htmlContent += `<table class="table">
    <tr><th>Ramo</th><th>Total</th><th>SEM</th><th>SEO</th><th>FBK</th><th>Otros</th></tr>`;

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
    htmlContent += `<table class="table">
        <tr><th>ID</th><th>Nombre</th><th>Lead Source</th><th>MKT Campaigns</th><th>Fecha de Creación</th></tr>`;

    console.log(agrupadoEcommerce.AUTOMOVILES.leads);
    agrupadoEcommerce.AUTOMOVILES.leads.forEach(lead => {
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

  // Agregar tabla de Agentes (por Estrategia)
  htmlContent += `<h3>Resumen de Leads Agentes (Día) por Estrategia:</h3>`;
  htmlContent += `<table class="table">
    <tr><th>Ramo</th><th>SEM</th><th>SEO</th><th>FBK</th><th>Otros</th></tr>`;

  // Resumen de leadsAgentes por Ramo y Estrategia
  for (const ramo in leadsAgentes) {
    const ramoData = leadsAgentes[ramo];
    htmlContent += `
      <tr>
        <td>${ramo}</td>
        <td>${ramoData.SEM}</td>
        <td>${ramoData.SEO}</td>
        <td>${ramoData.FBK}</td>
        <td>${ramoData.otros}</td>
      </tr>`;
  }

  htmlContent += `</table>`;

  // Agregar tabla de Agentes (por Estrategia)
  htmlContent += `<h3>Resumen de Leads Agentes (Mes) por Estrategia:</h3>`;
  htmlContent += `<table class="table">
    <tr><th>Ramo</th><th>SEM</th><th>SEO</th><th>FBK</th><th>Otros</th></tr>`;

  // Resumen de leadsAgentes por Ramo y Estrategia
  for (const ramo in leadsHistoricosAgentes) {
    const ramoData = leadsHistoricosAgentes[ramo];
    htmlContent += `
      <tr>
        <td>${ramo}</td>
        <td>${ramoData.SEM}</td>
        <td>${ramoData.SEO}</td>
        <td>${ramoData.FBK}</td>
        <td>${ramoData.otros}</td>
      </tr>`;
  }

  htmlContent += `</table>`;

  // Agregar tabla de Ventas (por Estrategia)
  htmlContent += `<h3>Resumen de Leads Ventas (Día) por Estrategia:</h3>`;
  htmlContent += `<table class="table">
    <tr><th>Ramo</th><th>SEM</th><th>SEO</th><th>FBK</th><th>Otros</th></tr>`;

  // Resumen de leadsVentas por Ramo y Estrategia
  for (const ramo in leadsVentas) {
    const ramoData = leadsVentas[ramo];
    htmlContent += `
      <tr>
        <td>${ramo}</td>
        <td>${ramoData.SEM}</td>
        <td>${ramoData.SEO}</td>
        <td>${ramoData.FBK}</td>
        <td>${ramoData.otros}</td>
      </tr>`;
  }

  htmlContent += `</table>`;

  // Agregar tabla de Ventas (por Estrategia)
  htmlContent += `<h3>Resumen de Leads Ventas (Mes) por Estrategia:</h3>`;
  htmlContent += `<table class="table">
    <tr><th>Ramo</th><th>SEM</th><th>SEO</th><th>FBK</th><th>Otros</th></tr>`;

  // Resumen de leadsVentas por Ramo y Estrategia
  for (const ramo in leadsHistoricosVentas) {
    const ramoData = leadsHistoricosVentas[ramo];
    htmlContent += `
      <tr>
        <td>${ramo}</td>
        <td>${ramoData.SEM}</td>
        <td>${ramoData.SEO}</td>
        <td>${ramoData.FBK}</td>
        <td>${ramoData.otros}</td>
      </tr>`;
  }

  htmlContent += `</table>`;
  

  // Detalle de los Leads del Día por Estrategia y Ramo (Después de las tablas de Agentes y Ventas)
  htmlContent += `<h3>Detalles de los Leads del Día por Ramo y Estrategia:</h3>`;


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
    to: ['aruiz@siaqs.com'],  // Destinatarios del correo
    cc: ['ehernandez@segurointeligente.mx','eescoto@segurointeligente.mx', 'cguzman@segurointeligente.mx', 
      'lalonso@segurointeligente.mx','mgarcia@segurointeligente.mx','aescamilla@segurointeligente.mx',
      'ygarcia@segurointeligente.mx', 'lleon@segurointeligente.mx', 'ilince@segurointeligente.mx',
      'ahernandez@gmag.com.mx', 'jgarma@segurointeligente.mx','vhernandez@segurointeligente.mx',
      'blloret@segurointeligente.mx','mperez@segurointeligente.mx'],
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

const enviarCorreoLC = async (response, NotificarMail, TipoNotificacion) => {
  NotificarMail = NotificarMail === "True" || NotificarMail === true;
  const currentTimeCDMX = moment().tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss');
  let subject = "Notificación de Leads Lineas Comerciales";

  // Modificar el asunto según el tipo de notificación
  if (TipoNotificacion === "Inicial") {
    subject += " Apertura";
  } else if (TipoNotificacion === "Final") {
    subject += " Cierre";
  } else if (TipoNotificacion === "Historico") {
    subject += " Histórico";
  }

  const { totalGeneral, historicoLeads, leadsxdia, LeadsxRamo, totalLeadsPorRamo, leadsPorRamo, data } = response;

  let htmlContent = `
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
          .container { background-color: #ffffff; padding: 20px; }
          h1 { color: #3498db; text-align: center; }
          .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .table th, .table td { padding: 8px; text-align: center; border: 1px solid #ddd; }
          .total { font-weight: bold; font-size: 24px; color: #e74c3c; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${subject}</h1>
          <p><strong>Fecha de Envío:</strong> ${currentTimeCDMX}</p>`;

  // ** Total de Leads del Día Vigente (Día Actual) **
  if (totalGeneral.total > 0) {
    htmlContent += `<h3>Total de Leads (Día Vigente): <span class="total">${totalGeneral.total}</span></h3>
      <table class="table">
        <tr><th>Ramo</th><th>Total</th><th>SEM</th><th>SEO</th><th>FBK</th><th>Otros</th></tr>`;

    for (const ramo in totalLeadsPorRamo) {
      htmlContent += `
        <tr>
          <td>${ramo}</td>
          <td>${totalLeadsPorRamo[ramo]}</td>
          <td>${leadsxdia[ramo]?.SEM.length || 0}</td>
          <td>${leadsxdia[ramo]?.SEO.length || 0}</td>
          <td>${leadsxdia[ramo]?.FBK.length || 0}</td>
          <td>${leadsxdia[ramo]?.otros.length || 0}</td>
        </tr>`;
    }
    htmlContent += `</table>`;
  }

  // ** Leads Históricos (Total de Todos los Leads) **
  if (historicoLeads.total > 0) {
    htmlContent += `<h3>Total de Leads (Histórico): <span class="total">${historicoLeads.total}</span></h3>
    <table class="table">
      <tr><th>Ramo</th><th>Total</th><th>SEM</th><th>SEO</th><th>FBK</th><th>Otros</th></tr>`;

    // Recorrer los leads en `data.Totales` y organizarlos por ramo
    for (const ramo in LeadsxRamo) {
      if (LeadsxRamo.hasOwnProperty(ramo)) {
        // Buscar la cantidad total de leads por ramo
        const leads = data.Totales.filter(lead => lead.Ramo === ramo);
        const totalLeads = leads.length;
        const semCount = leads.filter(lead => lead.Lead_Source === 'LP-LC-GMM-SEM').length;
        const seoCount = leads.filter(lead => lead.Lead_Source === 'LP-LC-GMM-SEO').length;
        const fbkCount = leads.filter(lead => lead.Lead_Source === 'LP-LC-GMM-FBK').length;
        const otrosCount = leads.filter(lead => lead.Lead_Source === 'LP-LC-GMM-otros').length;

        htmlContent += `
          <tr>
            <td>${ramo}</td>
            <td>${totalLeads}</td>
            <td>${semCount}</td>
            <td>${seoCount}</td>
            <td>${fbkCount}</td>
            <td>${otrosCount}</td>
          </tr>`;
      }
    }

    htmlContent += `</table>`;
  }

   // ** Leads por Ramo y Estatus **
   if (Object.keys(LeadsxRamo).length > 0) {
    htmlContent += `<h3>Leads por Ramo y Estatus:</h3>`;
    htmlContent += `<table class="table">
      <tr>
        <th>Ramo</th>
        <th>Sin Tocar</th>
        <th>Sin Contacto Efectivo</th>
        <th>Contacto Efectivo</th>
        <th>Otros</th>
      </tr>`;

    for (const ramo in LeadsxRamo) {
      let sinTocar = 0, sinContactoEfectivo = 0, contactoEfectivo = 0, otros = 0;

      if (Array.isArray(leadsPorRamo[ramo])) {
        leadsPorRamo[ramo].forEach(lead => {
          switch (lead.Estatus_Lead_Prospecto) {
            case 'Sin Tocar': sinTocar++; break;
            case 'Sin Contacto efectivo': sinContactoEfectivo++; break;
            case 'Contacto Efectivo': contactoEfectivo++; break;
            case 'Otros': otros++; break;
          }
        });
      }

      if (sinTocar || sinContactoEfectivo || contactoEfectivo || otros) {
        htmlContent += `
          <tr>
            <td>${ramo}</td>
            <td>${sinTocar}</td>
            <td>${sinContactoEfectivo}</td>
            <td>${contactoEfectivo}</td>
            <td>${otros}</td>
          </tr>`;
      }
    }
    htmlContent += `</table>`;
  }
  // ** Detalles de los Leads por Estrategia y Ramo **
  if (Object.keys(leadsxdia).length > 0) {
    htmlContent += `<h3>Detalles de los Leads (Día Vigente) por Ramo y Estrategia:</h3>`;
    for (const ramo in leadsxdia) {
      htmlContent += `<h4>Ramo: ${ramo}</h4>`;

      const estrategias = ['SEM', 'SEO', 'FBK', 'otros'];
      estrategias.forEach(estrategia => {
        if (leadsxdia[ramo][estrategia]?.length > 0) {
          htmlContent += `<h5>${estrategia}:</h5>`;
          htmlContent += `<table class="table">
            <tr><th>ID</th><th>Nombre</th><th>Lead Source</th><th>Fecha de Creación</th><th>Propietario</th></tr>`;

          leadsxdia[ramo][estrategia].forEach(lead => {
            htmlContent += `
              <tr>
                <td>${lead.id}</td>
                <td>${lead.First_Name} ${lead.Last_Name}</td>
                <td>${lead.Lead_Source}</td>
                <td>${lead.Created_Time}</td>
                <td>${lead.Owner.name}</td>
              </tr>`;
          });
          htmlContent += `</table>`;
        }
      });
    }
  }

 

  htmlContent += `</div></body></html>`;

  // Si NotificarMail es false, no enviamos el correo, solo retornamos
  if (!NotificarMail) {
    console.log("Correo armado pero no enviado, NotificarMail es false.");
    return;
  }

  // Enviar el correo
  const mailOptions = {
    from: 'aruiz@segurointeligente.mx',
    to: 'aruiz@siaqs.com',  // Destinatarios del correo
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
    "https://segurointeligente.mx/seguro-autos/",
    "https://segurointeligente.mx/landingpages/GNP/"
    // Puedes agregar más LPs aquí para SEM
  ],
  SEO: [
    "https://segurointeligente.mx/qualitas-seguros/",
    "https://segurointeligente.mx/chubb-seguros/"
    // Puedes agregar más LPs aquí para SEO
  ],
  FBK: [
    "https://segurointeligente.mx/qualitas-fbk/", // Ejemplo de LP para FBK
    // Puedes agregar más LPs aquí para FBK
  ]
};

const MandarCampaignFake = async () => {
  let htmlContent = `<tbody>
    <tr>
        <td height="570"
            style="border-collapse:collapse; mso-table-lspace:0pt; font-size:12px;font-family:Arial, Helvetica, sans-serif; mso-table-rspace:0pt;font-size:12px;border:0px;padding:0px;"
            valign="top">
            <a name="Top" style="text-decoration:underline;"></a>
            <div class="zpcontent-wrapper" id="page-container">
                <table border="0" cellpadding="0" cellspacing="0" id="page-container"
                    style="border-collapse:collapse;border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;font-size:12px;border: 0px; padding: 0px; border-collapse: collapse; text-decoration: none !important;"
                    width="100%">
                    <tbody>
                        <tr>
                            <td class="txtsize" id="elm_1519753653393"
                                style="border-collapse:collapse; mso-table-lspace:0pt; font-size:12px;font-family:Arial, Helvetica, sans-serif; mso-table-rspace:0pt;font-size:12px;padding:7px;border: 0px; padding: 0px 0px; border-collapse: collapse;"
                                valign="top">
                                <table bgcolor="transparent" border="0" cellpadding="0" cellspacing="0"
                                    style="border-collapse:collapse;border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;font-size:12px;border: 0px; padding: 0px; width: 100%; border-collapse: collapse; background-color: transparent;">
                                    <tbody>
                                        <tr>
                                            <td class="txtsize"
                                                style="border-collapse:collapse; mso-table-lspace:0pt; font-size:12px;font-family:Arial, Helvetica, sans-serif; mso-table-rspace:0pt;font-size:12px;padding:7px;border: 0px; padding: 0px 0px; border-top: none none none; border-bottom: none none none;">
                                                <div class="zpelement-wrapper image" id="elm_1519753653393"
                                                    style="padding: 0px; background-color: transparent">
                                                    <div>
                                                        <table align="left" border="0" cellpadding="0" cellspacing="0"
                                                            class="zpAlignPos"
                                                            style=" border:0px;border-collapse:collapse;border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;font-size:12px;text-align: left; width: 100%; padding: 0px; border: 0px; border-collapse: collapse; width: 100%; text-align: left;">
                                                            <tbody>
                                                                <tr>
                                                                    <td class="paddingcomp"
                                                                        style="border-collapse:collapse; mso-table-lspace:0pt; font-size:12px;font-family:Arial, Helvetica, sans-serif; mso-table-rspace:0pt;font-size:12px;padding:7px;border: 0px; padding: 7px 15px; text-align: center; padding-top: 7px; padding-bottom: 7px; padding-right: 15px; padding-left: 15px;">
                                                                        <a href="https://workdrive.zoho.com/file/2h9xpe546298dfc834fd1904cd3dc5dd8be79"
                                                                            rel="noopener noreferrer"
                                                                            style="text-decoration:underline;border: 0px;"
                                                                            target="_blank"> <img align="left"
                                                                                alt="VA Arrenadmiento Crédito"
                                                                                class="zpImage" height="auto" hspace="0"
                                                                                size="F"
                                                                                src="https://stratus.campaign-image.com/images/324744000211949011_1_1729625016540_(2).png"
                                                                                style="border:0 solid;width: 570px; max-width: 570px !important; border: 0px; text-align: left;"
                                                                                title="https://segurointeligente.mx/"
                                                                                vspace="0" width="570"> </a> </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td class="txtsize" id="elm_1584476816631"
                                style="border-collapse:collapse; mso-table-lspace:0pt; font-size:12px;font-family:Arial, Helvetica, sans-serif; mso-table-rspace:0pt;font-size:12px;padding:7px;border: 0px; padding: 0px 0px; border-collapse: collapse;"
                                valign="top">
                                <table bgcolor="transparent" border="0" cellpadding="0" cellspacing="0"
                                    style="border-collapse:collapse;border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;font-size:12px;border: 0px; padding: 0px; width: 100%; border-collapse: collapse; background-color: transparent;">
                                    <tbody>
                                        <tr>
                                            <td class="txtsize"
                                                style="border-collapse:collapse; mso-table-lspace:0pt; font-size:12px;font-family:Arial, Helvetica, sans-serif; mso-table-rspace:0pt;font-size:12px;padding:7px;border: 0px; padding: 0px 0px; border-top: none none none; border-bottom: none none none;">
                                                <div class="zpelement-wrapper image" id="elm_1584476816631"
                                                    style="padding: 0px; background-color: transparent">
                                                    <div>
                                                        <table align="left" border="0" cellpadding="0" cellspacing="0"
                                                            class="zpAlignPos"
                                                            style=" border:0px;border-collapse:collapse;border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;font-size:12px;text-align: left; width: 100%; padding: 0px; border: 0px; border-collapse: collapse; width: 100%; text-align: left;">
                                                            <tbody>
                                                                <tr>
                                                                    <td class="paddingcomp"
                                                                        style="border-collapse:collapse; mso-table-lspace:0pt; font-size:12px;font-family:Arial, Helvetica, sans-serif; mso-table-rspace:0pt;font-size:12px;padding:7px;border: 0px; padding: 7px 15px; text-align: center; padding-top: 7px; padding-bottom: 7px; padding-right: 15px; padding-left: 15px;">
                                                                        <img align="left" class="zpImage" height="auto"
                                                                            hspace="0" size="F"
                                                                            src="https://stratus.campaign-image.com/images/324744000211949011_zc_v1_1740434487992_manual_de_cumplimiento_2025.jpg"
                                                                            style="width: 570px; max-width: 570px !important; border: 0px; text-align: left"
                                                                            title="ENR 2020" vspace="0" width="570">
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td class="txtsize" id="elm_1607025925791"
                                style="border-collapse:collapse; mso-table-lspace:0pt; font-size:12px;font-family:Arial, Helvetica, sans-serif; mso-table-rspace:0pt;font-size:12px;padding:7px;border: 0px; padding: 0px 0px; border-collapse: collapse;"
                                valign="top">
                                <div class="zpelement-wrapper" id="elm_1607025925791" style="padding-right: 0px">
                                    <table border="0" cellpadding="0" cellspacing="0" class="zpAlignPos"
                                        style=" border:0px;border-collapse:collapse;border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;font-size:12px;padding: 0px; border: 0px; border-collapse: collapse;"
                                        width="100%">
                                        <tbody>
                                            <tr>
                                                <td class="paddingcomp"
                                                    style="border-collapse:collapse; mso-table-lspace:0pt; font-size:12px;font-family:Arial, Helvetica, sans-serif; mso-table-rspace:0pt;font-size:12px;padding:7px;border: 0px; padding: 7px 15px; font-size: 12pt; font-family: Arial, Helvetica; line-height: 19pt; border-top: 0px none; border-bottom: 0px none; padding-top: 20px; padding-bottom: 10px; padding-right: 15px; padding-left: 15px;">
                                                    <div style="">
                                                        <p align="center"
                                                            style="font-family:Arial,verdana;font-size:12pt; color:#000000;padding:0px;margin: 0;line-height: 19pt; text-align: center;">
                                                            <span
                                                                style="font-family: Tahoma, Geneva, sans-serif; background-color: transparent; color: rgb(0, 52, 95)">
                                                                <font style="font-size: 14pt"></font>
                                                            </span><span> </span></p>
                                                        <p align="center"
                                                            style="font-family:Arial,verdana;font-size:12pt; color:#000000;padding:0px;margin: 0;line-height: 19pt; text-align: center;">
                                                            <font color="#004ab5" face="Arial, Helvetica"
                                                                style="font-size: 14pt"><b style=""><span> </span></b>
                                                            </font>
                                                        </p>
                                                        <p align="center"
                                                            style="font-family:Arial,verdana;font-size:12pt; color:#000000;padding:0px;margin: 0;line-height: 19pt; text-align: center;">
                                                            <font face="Arial, Helvetica" style=""><b style="">
                                                                    <font color="#2828da" face="Arial, Helvetica"
                                                                        style="font-size: 14pt"><b style=""><span>
                                                                                <b><span>Recordatorio Manual de
                                                                                        Cumplimiento 2025</span></b>
                                                                            </span></b></font>
                                                                </b></font>
                                                        </p>
                                                        <font color="#004ab5" face="Arial, Helvetica"
                                                            style="font-size: 14pt"><b style=""> </b></font>
                                                        <p
                                                            style="margin: 0;padding: 0px;font-family:Arial, Helvetica, sans-serif; color:#000000;line-height:1.7;font-family:Arial,verdana;font-size:12pt;padding:0px;">
                                                        </p> <span
                                                            style="font-size: 14pt; color: rgb(0, 52, 95); font-family: Tahoma, Geneva, sans-serif; background-color: transparent"></span>
                                                        <p
                                                            style="margin: 0;padding: 0px;font-family:Arial, Helvetica, sans-serif; color:#000000;line-height:1.7;font-family:Arial,verdana;font-size:12pt;padding:0px;">
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td class="txtsize" id="elm_1610563420028"
                                style="border-collapse:collapse; mso-table-lspace:0pt; font-size:12px;font-family:Arial, Helvetica, sans-serif; mso-table-rspace:0pt;font-size:12px;padding:7px;border: 0px; padding: 0px 0px; border-collapse: collapse;"
                                valign="top">
                                <div class="zpelement-wrapper" id="elm_1610563420028" style="padding-right: 0px">
                                    <table border="0" cellpadding="0" cellspacing="0" class="zpAlignPos"
                                        style=" border:0px;border-collapse:collapse;border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;font-size:12px;padding: 0px; border: 0px; border-collapse: collapse;"
                                        width="100%">
                                        <tbody>
                                            <tr>
                                                <td class="paddingcomp"
                                                    style="border-collapse:collapse; mso-table-lspace:0pt; font-size:12px;font-family:Arial, Helvetica, sans-serif; mso-table-rspace:0pt;font-size:12px;padding:7px;border: 0px; padding: 7px 15px; font-size: 12pt; font-family: Arial, Helvetica; line-height: 19pt; border-top: 0px none; border-bottom: 0px none; padding-top: 7px; padding-bottom: 7px; padding-right: 25px; padding-left: 25px;">
                                                    <div style="">
                                                        <p align="justify"
                                                            style="font-family:Arial,verdana;font-size:12pt; color:#000000;padding:0px;margin: 0;line-height: 19pt; text-align: justify;">
                                                            <font color="#333333" face="Arial, Helvetica"
                                                                style="color: rgb(51, 51, 51)">
                                                                <font style="font-size: 11pt"></font>
                                                            </font>
                                                        </p>
                                                        <div align="justify" style="text-align: justify"><span
                                                                style="font-size: 11pt; background-color: transparent"></span>
                                                            <p align="justify"
                                                                style="font-family:Arial,verdana;font-size:12pt; color:#000000;padding:0px;margin: 0;line-height: 19pt; text-align: justify;">
                                                                <font face="Arial, Helvetica" style="font-size: 12pt">
                                                                </font>
                                                            </p>
                                                        </div>
                                                        <p align="justify"
                                                            style="line-height:1.7;font-family:Arial,verdana;font-size:12pt; color:#000000;padding:0px;margin: 0;text-align: justify; line-height: 19pt;">
                                                            <font color="#000000" face="Arial, Helvetica"
                                                                style="font-size: 12pt; color: rgb(0, 0, 0)">En esta
                                                                ocasión te compartimos un ejemplar del </font>
                                                            <font color="#2828da" face="Arial, Helvetica"
                                                                style="font-size: 12pt"><b>MC actualizado</b></font>
                                                            <font color="#000000" face="Arial, Helvetica"
                                                                style="font-size: 12pt; color: rgb(0, 0, 0)">, el cual
                                                                contempla diversas modificaciones legales que ha dado a
                                                                conocer la autoridad. El Manual contiene también la
                                                                versión actualizada de la </font>
                                                            <font color="#2828da" face="Arial, Helvetica"
                                                                style="font-size: 12pt"><b>Metodología de Gestión de
                                                                    Riesgos</b></font>
                                                            <font color="#000000" face="Arial, Helvetica"
                                                                style="font-size: 12pt; color: rgb(0, 0, 0)"> de </font>
                                                            <font color="#2828da" face="Arial, Helvetica"
                                                                style="font-size: 12pt"><b>VA FINANCIERA</b></font>
                                                            <font color="#000000" face="Arial, Helvetica"
                                                                style="font-size: 12pt; color: rgb(0, 0, 0)">. </font>
                                                        </p>
                                                        <p align="justify"
                                                            style="line-height:1.7;font-family:Arial,verdana;font-size:12pt; color:#000000;padding:0px;margin: 0;text-align: justify; line-height: 19pt;">
                                                            <br></p>
                                                        <div align="justify" style="text-align: justify"><span>
                                                                <font style="font-size: 11pt"><span><span>
                                                                            <p
                                                                                style="font-family:Arial,verdana;font-size:12pt; color:#000000;padding:0px;margin: 0;line-height: 19pt; text-align: left;">
                                                                                <font color="#000000"
                                                                                    face="Arial, Helvetica"
                                                                                    style="font-size: 12pt; color: rgb(0, 0, 0)">
                                                                                    Puedes descargar el documento en el
                                                                                    botón que aparece más abajo.</font>
                                                                            </p>
                                                                        </span></span></font>
                                                            </span></div>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td class="txtsize" id="elm_1607026098701"
                                style="border-collapse:collapse; mso-table-lspace:0pt; font-size:12px;font-family:Arial, Helvetica, sans-serif; mso-table-rspace:0pt;font-size:12px;padding:7px;border: 0px; padding: 0px 0px; border-collapse: collapse;"
                                valign="top">
                                <div class="zpelement-wrapper" id="elm_1607026098701" style="padding-right: 0px">
                                    <table border="0" cellpadding="0" cellspacing="0" class="zpAlignPos"
                                        style=" border:0px;border-collapse:collapse;border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;font-size:12px;padding: 0px; border: 0px; border-collapse: collapse;"
                                        width="100%">
                                        <tbody>
                                            <tr>
                                                <td class="paddingcomp"
                                                    style="border-collapse:collapse; mso-table-lspace:0pt; font-size:12px;font-family:Arial, Helvetica, sans-serif; mso-table-rspace:0pt;font-size:12px;padding:7px;border: 0px; padding: 7px 15px; font-size: 12pt; font-family: Arial, Helvetica; line-height: 19pt; border-top: 0px none; border-bottom: 0px none; padding-top: 7px; padding-bottom: 7px; padding-right: 15px; padding-left: 15px;">
                                                    <div style="">
                                                        <p align="center"
                                                            style="font-family:Arial,verdana;font-size:12pt; color:#000000;padding:0px;margin: 0;line-height: 19pt; text-align: center;">
                                                            <b><span
                                                                    style="font-size: 11pt; font-family: Arial, Helvetica">Verónica
                                                                    Castañeda</span><br></b></p>
                                                        <p align="center"
                                                            style="font-family:Arial,verdana;font-size:12pt; color:#000000;padding:0px;margin: 0;line-height: 19pt; text-align: center;">
                                                            <font face="Arial, Helvetica" style="">
                                                                <font style="font-size: 11pt"><b>Oficial de
                                                                        Cumplimiento</b></font>
                                                            </font>
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td class="txtsize" id="elm_1588098567671"
                                style="border-collapse:collapse; mso-table-lspace:0pt; font-size:12px;font-family:Arial, Helvetica, sans-serif; mso-table-rspace:0pt;font-size:12px;padding:7px;border: 0px; padding: 0px 0px; border-collapse: collapse;"
                                valign="top">
                                <div class="zpelement-wrapper spacebar" id="elm_1588098567671"
                                    style="background-color: transparent">
                                    <table bgcolor="transparent" border="0" cellpadding="0" cellspacing="0"
                                        class="zpAlignPos"
                                        style=" border:0px;border-collapse:collapse;border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;font-size:12px;padding: 0px; border: 0px; border-collapse: collapse; font-size: 5px; height: 20px;"
                                        width="100%">
                                        <tbody>
                                            <tr>
                                                <td
                                                    style="border-collapse:collapse; mso-table-lspace:0pt; font-size:12px;font-family:Arial, Helvetica, sans-serif; mso-table-rspace:0pt;font-size:12px;border:0px;padding: 0px; border: 0px; font-size: 5px; height: 20px; border-top: none none none; border-bottom: none none none;">
                                                    &nbsp;&nbsp;&nbsp; </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td class="txtsize" id="elm_1588098497884"
                                style="border-collapse:collapse; mso-table-lspace:0pt; font-size:12px;font-family:Arial, Helvetica, sans-serif; mso-table-rspace:0pt;font-size:12px;padding:7px;border: 0px; padding: 0px 0px; border-collapse: collapse;"
                                valign="top">
                                <table bgcolor="transparent" cellpadding="0" cellspacing="0"
                                    style="border-collapse:collapse;border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;font-size:12px;border: 0px; border-collapse: collapse; border: none;"
                                    width="100%">
                                    <tbody>
                                        <tr>
                                            <td class="paddingcomp"
                                                style="border-collapse:collapse; mso-table-lspace:0pt; font-size:12px;font-family:Arial, Helvetica, sans-serif; mso-table-rspace:0pt;font-size:12px;padding:7px;border: 0px; padding: 7px 15px; border-top: none none none; border-bottom: none none none; padding-top: 7px; padding-bottom: 7px; padding-right: 15px; padding-left: 15px;">
                                                <div class="zpelement-wrapper buttonElem" id="elm_1588098497884">
                                                    <div class="zpAlignPos" style="text-align: center">
                                                        <table align="center" cellpadding="0" cellspacing="0"
                                                            style="border-collapse:collapse;border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;font-size:12px;border: none; padding: 0px; border: 0px; margin: 0px auto; border-collapse: separate;">
                                                            <tbody>
                                                                <tr>
                                                                    <td align="center" class="txtsize"
                                                                        style="border-collapse:collapse; mso-table-lspace:0pt; font-size:12px;font-family:Arial, Helvetica, sans-serif; mso-table-rspace:0pt;font-size:12px;padding:7px;border: 0px; padding: 0px; color: rgb(255, 255, 255); font-family: Arial; font-weight: bold; text-align: center; border-radius: 110px; text-align: center; cursor: pointer;">
                                                                        <a href="https://workdrive.zoho.com/file/gum0l62f8f9e06b964a518d914a859a17a1f0"
                                                                            rel="noopener noreferrer"
                                                                            style="text-decoration:underline;padding: 0px 0px; background-color: rgb(0, 155, 221); width: 221px; height: 40px; font-size: 12pt; direction: ltr; font-family: Arial; color: rgb(255, 255, 255); cursor: pointer; text-decoration: none; border-radius: 110px; border: 0px solid rgb(255, 255, 255); border-collapse: separate; display: table; text-align: center;"
                                                                            target="_blank">
                                                                            <font
                                                                                style="color: rgb(255, 255, 255); display: table-cell; vertical-align: middle">
                                                                                Descargar manual </font>
                                                                        </a> </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td class="txtsize" id="elm_1518458438709"
                                style="border-collapse:collapse; mso-table-lspace:0pt; font-size:12px;font-family:Arial, Helvetica, sans-serif; mso-table-rspace:0pt;font-size:12px;padding:7px;border: 0px; padding: 0px 0px; border-collapse: collapse;"
                                valign="top">
                                <div class="zpelement-wrapper" id="elm_1518458438709" style="padding-right: 0px">
                                    <table border="0" cellpadding="0" cellspacing="0" class="zpAlignPos"
                                        style=" border:0px;border-collapse:collapse;border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;font-size:12px;padding: 0px; border: 0px; border-collapse: collapse;"
                                        width="100%">
                                        <tbody>
                                            <tr>
                                                <td class="paddingcomp"
                                                    style="border-collapse:collapse; mso-table-lspace:0pt; font-size:12px;font-family:Arial, Helvetica, sans-serif; mso-table-rspace:0pt;font-size:12px;padding:7px;border: 0px; padding: 7px 15px; font-size: 12pt; font-family: Arial, Helvetica; line-height: 19pt; border-top: 0px none; border-bottom: 0px none; padding-top: 7px; padding-bottom: 7px; padding-right: 15px; padding-left: 15px;">
                                                    <div style="">
                                                        <div style="text-align: center">
                                                            <font color="#666666"><b><span> <b
                                                                            style="color: rgb(102, 102, 102); font-family: Arial, verdana; font-size: 12px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; background-color: rgb(255, 255, 255); text-decoration-color: initial">VA
                                                                            Arrendamiento y Crédito | Tu Mejor Socio</b>
                                                                    </span></b></font>
                                                        </div>
                                                        <div style="text-align: center">
                                                            <font color="#666666">&nbsp;Este email fue enviado con ♥ por
                                                                VA Arrendamiento y Crédito | Todos los Derechos
                                                                Reservados©2025.&nbsp;​​​​​​​Consulta nuestras Políticas
                                                                de Uso y nuestro Aviso de Privacidad en <span><a
                                                                        alt="VA SERVICIOS"
                                                                        href="https://www.va-servicios.mx/"
                                                                        rel="noopener noreferrer"
                                                                        style="text-decoration:underline;color: rgb(102, 102, 102);"
                                                                        target="_blank" title="VA SERVICIOS">
                                                                        <font color="#666666"
                                                                            style="color: rgb(102, 102, 102)"> VA
                                                                            SERVICIOS</font>
                                                                    </a></span></font>
                                                        </div>
                                                        <div style="text-align: center">
                                                            <font color="#666666"><span><span
                                                                        style="color: rgb(67, 67, 67); font-family: Arial, verdana; font-size: 12px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; background-color: rgb(255, 255, 255); text-decoration-color: initial; float: none; display: inline !important">Una
                                                                        marca de</span><span
                                                                        style="color: rgb(67, 67, 67); font-family: Arial, verdana; font-size: 12px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; background-color: rgb(255, 255, 255); text-decoration-color: initial"><span>&nbsp;</span>VA
                                                                        Servicios SAPI de CV SOFOM ENR</span></span>
                                                            </font>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </td>
    </tr>
</tbody>`

  const mailOptions = {
    from: 'aruiz@segurointeligente.mx',
    to: ['raqmartinez@va-financiera.mx','rrojas@va-financiera.mx',
      'afigueroa@va-financiera.mx','vcastaneda@va-financiera.mx'],  // Destinatarios del correo
    cc: ['aruiz@siaqs.com','eescoto@segurointeligente.mx'],
    subject: "AVISO IMPORTANTE - Recordatorio PLD",
    html: htmlContent
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("Correo enviado:", info.response);
}
