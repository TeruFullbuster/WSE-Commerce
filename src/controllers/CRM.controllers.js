import { response } from 'express';
import fetch from 'node-fetch';

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