import { pool } from '../db.js'

import fetch from 'node-fetch';

import axios from 'axios';
import decodeURIComponent from 'decode-uri-component';
import fs from 'fs';
import PDFParser from 'pdf2json';

export const OCRPoliza = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se adjuntó ningún archivo PDF' });
        }

        const pdfParser = new PDFParser();

        pdfParser.on('pdfParser_dataError', (errData) => {
            console.error('Error al analizar el PDF:', errData.parserError);
            return res.status(500).json({ error: 'Error al analizar el PDF' });
        });

        pdfParser.on('pdfParser_dataReady', (pdfData) => {
            try {
                // Extraer datos estructurados
                const datosEstructurados = extraerDatosEstructurados(pdfData);

                // Eliminar el archivo temporal
                fs.unlinkSync(req.file.path);

                // Responder con los datos estructurados
                return res.status(200).json(datosEstructurados);
            } catch (error) {
                console.error('Error al procesar el texto:', error);
                return res.status(500).json({ error: 'Error al procesar el texto del PDF' });
            }
        });

        // Cargar y procesar el PDF
        pdfParser.loadPDF(req.file.path);
    } catch (error) {
        console.error('Error en el controlador:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const extraerDatosEstructurados = (data) => {
    const textoExtraido = [];
    const paginas = data.Pages;

    // Extraer texto del PDF línea por línea
    paginas.forEach((pagina) => {
        pagina.Texts.forEach((texto) => {
            const linea = texto.R.map((r) => decodeURIComponent(r.T)).join(' ');
            textoExtraido.push(linea.trim()); // Decodificar y limpiar cada línea
        });
    });

    // Concatenar todo el texto para un análisis global
    const textoPlano = textoExtraido.join(' ');

    // Diccionario de datos a extraer
    const datos = {
        Asegurado: null,
        Propietario: null,
        Domicilio: null,
        "C.P.": null,
        Teléfono: null,
        "R.F.C.": null,
        Placas: null,
        Póliza: null,
        TextoPlano: textoPlano // Guardar el texto completo
    };

    // Detectar patrones específicos con regex
    const regexes = {
        RFC: /\b[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}\b/,
        CP: /\b\d{5}\b/,
        Telefono: /\b\d{10}\b/,
        Placas: /PLACAS=([A-Z0-9]+)/, // Detecta "PLACAS=" seguido por letras/números
        Poliza: /\bEK[A-Z0-9]+\b/ // Detecta palabras que empiezan con "EK" y contienen letras/números
    };

    // Buscar y extraer datos utilizando palabras clave
    textoExtraido.forEach((linea, index) => {
        if (linea.includes('Asegurado:')) {
            datos.Asegurado = linea.split('Asegurado:')[1]?.trim() || null;
        } else if (linea.includes('Propietario:')) {
            datos.Propietario = linea.split('Propietario:')[1]?.trim() || null;
        } else if (linea.includes('Domicilio:')) {
            datos.Domicilio = textoExtraido.slice(index + 1, index + 4).join(' ').trim(); // Captura las líneas siguientes como domicilio
        }
    });

    // Buscar patrones específicos en el texto plano
    datos["C.P."] = textoPlano.match(regexes.CP)?.[0] || null;
    datos.Teléfono = textoPlano.match(regexes.Telefono)?.[0] || null;
    datos["R.F.C."] = textoPlano.match(regexes.RFC)?.[0] || null;
    datos.Placas = textoPlano.match(regexes.Placas)?.[1] || null; // Captura la parte después de "PLACAS="
    datos.Póliza = textoPlano.match(regexes.Poliza)?.[0] || null; // Captura la palabra que empieza con "EK"

    return datos;
};
