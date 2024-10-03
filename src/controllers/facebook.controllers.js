import fetch from 'node-fetch'; // Importa la librería node-fetch

// Configura tus tokens y IDs
const facebookAccessToken = 'EAAR5tQ3Y7T4BO4bQrp8xHTQUBEpqSuxZAl1MEZBico58EWAbJW2ENjOnzPtIMYOKIswn0tQcknxPi7JjoQPCxfgi7uhVoJoojMmO5QZA4v4lhVmH7ZBw616TbSuAwbisFd2I8ATgeKZAuYTrN0AYVdC2UzZCNMTztV8qklBh99o785IZBdczuZB2jxVsrZCEA5S7x'; // Token de acceso
const adAccountId = 'act_1453998281865589'; // ID de la cuenta publicitaria

export async function obtenerLeadsDeFacebook() {
    try {
        const url = `https://graph.facebook.com/v12.0/${adAccountId}/leadgen_forms?access_token=${facebookAccessToken}`;
        console.log(`Realizando la petición a: ${url}`); // Imprime la URL

        // Realiza la petición a la API de Facebook para obtener los formularios de generación de leads
        const response = await fetch(url);

        // Verifica si la respuesta es exitosa
        if (!response.ok) {
            const errorDetails = await response.json(); // Captura detalles del error
            throw new Error(`Error en la petición: ${response.status} ${response.statusText} - ${JSON.stringify(errorDetails)}`);
        }

        // Obtiene los datos en formato JSON
        const leadsData = await response.json();

        // Muestra la respuesta en consola
        console.log(JSON.stringify(leadsData, null, 2)); // Formato JSON bonito
    } catch (error) {
        console.error('Error al obtener leads:', error);
    }
}

// Llama a la función
//obtenerLeadsDeFacebook();

async function obtenerCuentasPublicitarias() {
    try {
        const url = `https://graph.facebook.com/v12.0/me/adaccounts?access_token=${facebookAccessToken}`;
        console.log(`Realizando la petición a: ${url}`); // Imprime la URL

        const response = await fetch(url);

        if (!response.ok) {
            const errorDetails = await response.json(); // Captura detalles del error
            throw new Error(`Error en la petición: ${response.status} ${response.statusText} - ${JSON.stringify(errorDetails)}`);
        }

        const cuentasData = await response.json();
        console.log(JSON.stringify(cuentasData, null, 2)); // Muestra la respuesta en formato JSON

    } catch (error) {
        console.error('Error al obtener cuentas publicitarias:', error);
    }
}

obtenerCuentasPublicitarias();
