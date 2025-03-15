import axios from "axios";
import puppeteer from "puppeteer";
import OpenAI from 'openai';
import fs from "fs";
import path from "path";
import pdfPoppler from "pdf-poppler";
import dotenv from 'dotenv';
import { pool } from '../db.js'
import unzipper from "unzipper";
import multer from "multer";
import xlsx from 'xlsx';

// Paso 1: Obtener el token de Google reCAPTCHA
async function obtenerTokenReCAPTCHA() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Cargar la página donde se genera el reCAPTCHA
    await page.goto("https://www.google.com/recaptcha/api2/reload?k=6Lfy8AEoAAAAANclz0Doczn6y826fM0BjOPXEn9B");

    // Aquí deberás esperar que el usuario resuelva el captcha manualmente
    console.log("Por favor, resuelve el reCAPTCHA en la ventana abierta...");

    // Esperar a que el reCAPTCHA genere el token (este ejemplo supone que el token aparece en el DOM)
    const token = await page.evaluate(() => {
        const iframe = document.querySelector("iframe[src*='recaptcha']");
        return iframe?.contentWindow?.grecaptcha?.getResponse();
    });

    await browser.close();
    return token;
}

// Paso 2: Generar `criterio` y `llave`
// Este paso depende de cómo se generan estos valores. Por ahora, asumiremos que los tienes o puedes generarlos.

async function generarCriterioYLlave(placa) {
    // Esto es un ejemplo placeholder
    const criterio = Buffer.from(placa).toString("base64"); // Codificación base64 de la placa
    const llave = Buffer.from("llave-de-ejemplo").toString("base64"); // Llave ficticia
    return { criterio, llave };
}

// Paso 3: Realizar la solicitud al servicio de REPUVE
export async function consultarREPUVE(placa) {
    try {
        // Obtener el token de reCAPTCHA
        const token = await obtenerTokenReCAPTCHA();

        if (!token) {
            throw new Error("No se pudo obtener el token de reCAPTCHA");
        }

        // Generar `criterio` y `llave`
        const { criterio, llave } = await generarCriterioYLlave(placa);

        // Realizar la petición final
        const payload = {
            criterio,
            llave,
            token
        };

        const response = await axios.post(
            "https://www2.repuve.gob.mx:8443/consulta/consulta/repuve",
            payload,
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error en consultarREPUVE:", error.message);
        return null;
    }
}


const consultarRepuve = async (placa) => {
    try {
        // 1️⃣ Obtener el captcha
        const captchaUrl = "http://www2.repuve.gob.mx:8080/ciudadania/jcaptcha";
        console.log(captchaUrl)
        const captchaResponse = await axios.get(captchaUrl, { responseType: 'arraybuffer' });
        console.log("algo" + captchaResponse);
        // 2️⃣ Procesar la imagen del captcha
        const imageBuffer = Buffer.from(captchaResponse.data, 'binary');
        const { data: { text: captchaText } } = await tesseract.recognize(imageBuffer, 'eng', {
            tessedit_char_whitelist: '0123456789abcdefghijklmnopqrstuvwxyz'
        });

        console.log("Captcha detectado:", captchaText);

        // 3️⃣ Enviar datos al formulario de consulta
        const consultaUrl = 'http://www2.repuve.gob.mx:8080/ciudadania/servletconsulta';
        const consultaResponse = await axios.post(consultaUrl, new URLSearchParams({
            placa: placa,
            captcha: captchaText,
            pageSource: 'index.jsp'
        }).toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        // 4️⃣ Analizar el HTML recibido
        const $ = cheerio.load(consultaResponse.data);
        const tr = $('table').eq(0).find('tr').eq(2).find('table').eq(1).find('tr');

        const datosVehiculo = {
            marca: tr.eq(0).find('span.style21').text().trim(),
            modelo: tr.eq(1).find('td.style21').text().trim(),
            añoModelo: tr.eq(2).find('span.style21').text().trim(),
            clase: tr.eq(3).find('span.style21').text().trim(),
            tipo: tr.eq(4).find('span.style21').text().trim(),
            niv: tr.eq(5).find('span.style21').text().trim(),
            nci: tr.eq(6).find('span.style21').text().trim(),
            placa: tr.eq(7).find('span.style21').text().trim(),
            puertas: tr.eq(8).find('td.style21').text().trim(),
            origen: tr.eq(9).find('td.style21').text().trim(),
            versión: tr.eq(10).find('td.style21').text().trim(),
            ccl: tr.eq(11).find('td.style21').text().trim(),
            cilindros: tr.eq(12).find('td.style21').text().trim(),
            ejes: tr.eq(13).find('td.style21').text().trim(),
            ensambladora: tr.eq(14).find('td.style21').text().trim(),
            extra: tr.eq(15).find('span.style21').text().trim(),
            institución: tr.eq(16).find('span.style21').text().trim(),
            fechaInscripción: tr.eq(17).find('span.style21').text().trim(),
            horaInscripción: tr.eq(18).find('span.style21').text().trim(),
            entidadRegistro: tr.eq(19).find('span.style21').text().trim(),
            fechaRegistro: tr.eq(20).find('span.style21').text().trim(),
            últimaActualización: tr.eq(21).find('span.style21').text().trim()
        };

        // 5️⃣ Verificar si tiene reporte de robo
        const reporteRobo = $('table').eq(4).find('tr').eq(0).find('td').eq(1).find('b').text().trim();
        datosVehiculo.reporteRobo = reporteRobo !== 'SIN REPORTE DE ROBO';

        console.log("Datos del vehículo:", datosVehiculo);
        return datosVehiculo;

    } catch (error) {
        console.error("❌ Error en la consulta REPUVE:", error.message);
        return { error: "Error al consultar el REPUVE" };
    }
};


// Configuración de OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// 🛠 **Función para convertir PDF en imágenes**
async function convertirPDFaImagenes(pdfPath) {
    try {
        const outputDir = path.dirname(pdfPath);
        const outputPath = path.join(outputDir, "pagina");

        const opts = {
            format: "jpeg",
            out_dir: outputDir,
            out_prefix: "pagina",
            scale: 1024 // Escalar a un tamaño adecuado
        };

        await pdfPoppler.convert(pdfPath, opts);
        console.log("✅ PDF convertido a imágenes");

        // Obtener las imágenes generadas
        const imageFiles = fs.readdirSync(outputDir)
            .filter(file => file.startsWith("pagina") && file.endsWith(".jpg"))
            .map(file => path.join(outputDir, file));

        return imageFiles;
    } catch (error) {
        console.error("❌ Error al convertir PDF en imágenes:", error);
        throw new Error("Error al procesar el PDF");
    }
}
// 📌 **Función para convertir fechas con mes en texto a formato `YYYY-MM-DD HH:MM:SS`**
function formatFecha(fecha) {
    if (!fecha) return null; // Si no hay fecha, devolver NULL
    
    // Diccionario para convertir meses de texto a número
    const meses = {
        "ene": "01", "feb": "02", "mar": "03", "abr": "04", "may": "05", "jun": "06",
        "jul": "07", "ago": "08", "sep": "09", "oct": "10", "nov": "11", "dic": "12"
    };

    // Separar la fecha en partes
    const parts = fecha.toLowerCase().split(/[-/\s]/); // Separar por "-", "/", o espacio

    if (parts.length === 3) {
        let [dia, mes, año] = parts;

        // Convertir mes de texto a número
        mes = meses[mes] || mes; // Si es texto, lo convierte; si ya es número, lo deja igual

        // Validar que los valores sean numéricos antes de formatear
        if (!isNaN(dia) && !isNaN(mes) && !isNaN(año)) {
            return `${año}-${mes}-${dia} 00:00:00`; // Formato `YYYY-MM-DD HH:MM:SS`
        }
    }

    return null; // Si la conversión falla, devolver NULL
}
// 📌 **Función para extraer JSON de un string con texto adicional**
function extractJSONFromString(responseText) {
    try {
        const jsonMatch = responseText.match(/```json([\s\S]*?)```/);
        if (jsonMatch && jsonMatch[1]) {
            return JSON.parse(jsonMatch[1].trim()); // Convertir a JSON
        } else {
            throw new Error("No se encontró JSON válido en la respuesta.");
        }
    } catch (error) {
        console.error("❌ Error al extraer JSON:", error);
        throw new Error("Formato de respuesta incorrecto.");
    }
}

// 📌 **Función para convertir PrimaTotal a un número válido**
const formatMoney = (valor) => {
    if (!valor || typeof valor !== "string") return null; // Si está vacío, devolver NULL
    let cleanValue = valor.replace(/[^0-9.]/g, ""); // Eliminar comas y caracteres no numéricos
    let parsedValue = parseFloat(cleanValue); // Convertir a número
    return isNaN(parsedValue) ? null : parsedValue; // Si no es un número válido, devolver NULL
};

// 🚀 **Actualizar la función de OCR para guardar datos correctamente**

export const OCRGPT = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No se ha proporcionado un documento PDF." });
        }

        // 📌 Guardar temporalmente el buffer en un archivo en `/tmp/`
        const tempFilePath = `/tmp/${Date.now()}-${req.file.originalname}`;
        fs.writeFileSync(tempFilePath, req.file.buffer);

        // 📸 **Convertir PDF a imágenes**
        const imagePaths = await convertirPDFaImagenes(tempFilePath);
        if (imagePaths.length === 0) {
            fs.unlinkSync(tempFilePath); // Eliminar archivo temporal
            return res.status(400).json({ message: "No se pudo extraer imágenes del documento." });
        }

        // 🧠 **Llamar a OpenAI con las imágenes**
        const gptResponse = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                { role: "system", content: "Eres un sistema de OCR avanzado. Extrae los datos del documento." },
                { role: "user", content: PromptOCR },
                ...imagePaths.map(imagePath => ({
                    role: "user",
                    content: [
                        { type: "text", text: "Aquí está la imagen del documento a procesar:" },
                        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${fs.readFileSync(imagePath, "base64")}` } }
                    ]
                }))
            ],
            max_tokens: 1000
        });

        console.log(gptResponse);
        console.log(gptResponse.choices[0].message.content);

        // 🏷 **Extraer datos del JSON de respuesta**
        let extractedData;
        try {
            extractedData = extractJSONFromString(gptResponse.choices[0].message.content);
        } catch (error) {
            console.error("❌ Error extrayendo JSON:", error);
            fs.unlinkSync(tempFilePath); // Eliminar archivo temporal
            imagePaths.forEach(img => fs.unlinkSync(img)); // Eliminar imágenes temporales
            return res.status(400).json({ message: "Error al extraer datos del documento." });
        }

        console.log(extractedData);

        // 🔄 **Convertir fechas al formato correcto**
        extractedData.FechaVigenciaInicio = formatFecha(extractedData.FechaVigenciaInicio);
        extractedData.FechaVigenciaFin = formatFecha(extractedData.FechaVigenciaFin);
        extractedData.FechaEmision = formatFecha(extractedData.FechaEmision);

        // 💰 **Convertir PrimaTotal a número válido**
        extractedData.PrimaTotal = formatMoney(extractedData.PrimaTotal);
        extractedData.PrimaNeta = formatMoney(extractedData.PrimaNeta);

        // 🔍 **Verificar si la póliza ya existe en la base de datos**
        const [existingRows] = await pool.query(
            "SELECT * FROM polizas_revisadas WHERE NoPoliza = ? LIMIT 1",
            [extractedData.NoPoliza]
        );

        if (existingRows.length > 0) {
            console.log("✅ La póliza ya existe en la base de datos. No se insertará nuevamente.");
            fs.unlinkSync(tempFilePath);
            imagePaths.forEach(img => fs.unlinkSync(img));

            return res.status(200).json({
                message: "La póliza ya ha sido procesada previamente.",
                datosPrevios: existingRows[0]
            });
        }

        // 📊 **Insertar en la base de datos si la póliza no existe**
        await pool.query(
            `INSERT INTO polizas_revisadas 
            (NoPoliza, RFC, NombreContratante, FechaVigenciaInicio, FechaVigenciaFin, 
            PrimaTotal, Endoso, Direccion, CP, NumeroCelular, Correo, Ramo, ClaveAgente, FechaEmision, PrimaNeta, DatosExtraidos) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                extractedData.NoPoliza,
                extractedData.RFC,
                extractedData.NombreContratante,
                extractedData.FechaVigenciaInicio,
                extractedData.FechaVigenciaFin,
                extractedData.PrimaTotal,
                extractedData.Endoso,
                extractedData.Direccion,
                extractedData.CP,
                extractedData.NumeroCelular,
                extractedData.Correo,
                extractedData.Ramo,
                extractedData.ClaveAgente,
                extractedData.FechaEmision,
                extractedData.PrimaNeta,
                JSON.stringify(extractedData)
            ]
        );

        // 🗑 **Eliminar archivos temporales**
        fs.unlinkSync(tempFilePath);
        imagePaths.forEach(img => fs.unlinkSync(img));

        res.status(200).json({
            message: "Datos extraídos y guardados correctamente",
            datos: extractedData
        });

    } catch (error) {
        console.error("❌ Error en el procesamiento:", error);
        res.status(500).json({
            message: "Error al procesar la póliza",
            error: error.message
        });
    }
};



const writeFileAsync = promisify(fs.writeFile);

export const procesarZIP = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No se ha proporcionado un archivo ZIP." });
        }

        // 📌 Guardar el buffer temporalmente en `/tmp/`
        const tempZipPath = `/tmp/${Date.now()}-${req.file.originalname}`;
        await writeFileAsync(tempZipPath, req.file.buffer);

        // 📌 Carpeta temporal para extraer archivos
        const extractPath = `/tmp/${Date.now()}_extracted`;
        fs.mkdirSync(extractPath, { recursive: true });

        // 📂 Extraer los archivos del ZIP
        await fs.createReadStream(tempZipPath)
            .pipe(unzipper.Extract({ path: extractPath }))
            .promise();

        // 📄 Leer archivos extraídos
        const files = fs.readdirSync(extractPath);
        const pdfFiles = files.filter(file => file.endsWith(".pdf"));

        if (pdfFiles.length === 0) {
            fs.unlinkSync(tempZipPath);
            fs.rmSync(extractPath, { recursive: true, force: true });
            return res.status(400).json({ message: "No se encontraron archivos PDF en el ZIP." });
        }

        // 📑 Procesar cada PDF individualmente
        for (const pdfFile of pdfFiles) {
            const pdfPath = path.join(extractPath, pdfFile);
            console.log(`Procesando: ${pdfFile}`);

            // Leer el PDF en memoria
            const pdfBuffer = fs.readFileSync(pdfPath);

            // Llamar a la función OCRGPT para procesar el PDF en memoria
            await OCRGPT({ file: { buffer: pdfBuffer, originalname: pdfFile } }, { status: () => ({ json: console.log }) });
        }

        // 🗑 Eliminar archivos temporales
        fs.rmSync(extractPath, { recursive: true, force: true });
        fs.unlinkSync(tempZipPath);

        res.status(200).json({ message: "Procesamiento de ZIP completado" });

    } catch (error) {
        console.error("❌ Error procesando ZIP:", error);
        res.status(500).json({ message: "Error al procesar el ZIP", error: error.message });
    }
};

// 🔹 **Prompt de OCR** (instrucciones para GPT)
const PromptOCR = `
Eres un sistema de OCR avanzado diseñado para analizar documentos escaneados de pólizas de seguro y extraer información estructurada en formato JSON. 
Tu tarea es escanear el documento proporcionado y recuperar los siguientes campos clave. Dado que hay múltiples formatos de documentos, debes ser flexible y adaptarte a distintas estructuras para identificar los datos correctos.

Instrucciones Generales:
- Busca cada campo en diferentes ubicaciones del documento, ya que la estructura puede variar.
- Si un campo no está presente, devuélvelo como una cadena vacía "" en el JSON.
- Extrae correctamente los valores sin caracteres adicionales como saltos de línea, espacios innecesarios o caracteres especiales.
- Diferencia correctamente entre las fechas de inicio y fin de vigencia.
- Detecta si el documento corresponde a una póliza o un endoso (por términos como "Endoso" o "Modificación").
- En caso de que haya múltiples valores en una sección, selecciona el más relevante o con mayor claridad.
- Ignora información irrelevante que no pertenezca a los campos solicitados.

Campos a Extraer y Consideraciones:
- **NombreContratante**: Nombre de la empresa o persona que contrató la póliza.
- **NoPoliza**: Número de póliza del documento.
- **FechaVigenciaInicio y FechaVigenciaFin**: Buscar expresiones como "Inicio de Vigencia" y "Fin de Vigencia".
- **PrimaTotal**: Monto total de la prima del seguro.
- **Endoso**: Indicar si el documento es un endoso o una póliza.
- **Direccion**: Dirección del contratante.
- **CP**: Código postal de la dirección.
- **NumeroCelular**: Número de contacto del asegurado o contratante.
- **Correo**: Correo electrónico del asegurado o contratante.
- **Ramo**: Tipo de seguro contratado.
- **RFC**: Puede ser Fisica o Moral, con homoclave o sin ella.
- **Clave Agente o Nro Agente o No. Agente o Agente**: Puede ser un número de agente o clave de identificación.
- **Fecha de Emision o Expedición** : Fecha en la que se emitió la póliza.
- **Prima Neta** : Monto de la prima neta.

Ejemplo de Salida en JSON:

{
  "NombreContratante": "OSCAR ALBERTO REYNAL BAEZA",
  "NoPoliza": "0065709A",
  "RFC" : "RUJA960807TM2",
  "FechaVigenciaInicio": "12/01/2012",
  "FechaVigenciaFin": "24/02/2025",
  "FechaEmision": "24/02/2025",
  "PrimaTotal": "12,441.67",
  "Prima Neta": "12,441.67",
  "Endoso": "No",
  "Direccion": "AV EL RIEGO AND 57 NUM 10 VILLA COAPA, TLALPAN, DISTRITO FEDERAL",
  "CP": "14390",
  "NumeroCelular": "",
  "Correo": "",
  "Ramo": "Vida",
  "ClaveAgente": "123456"
}
`;

// 📌 **Función para procesar el Excel y completar la información de las pólizas**
export const procesarExcelPolizas = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No se ha proporcionado un archivo Excel." });
        }

        // 📖 **Leer el archivo Excel desde el buffer**
        const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0]; // Tomar la primera hoja
        const worksheet = workbook.Sheets[sheetName];
        let data = xlsx.utils.sheet_to_json(worksheet, { defval: "" });

        if (data.length === 0) {
            return res.status(400).json({ message: "El archivo Excel está vacío." });
        }

        // 🛠 **Verificar si la columna 'NoPoliza' existe en el Excel**
        if (!data[0].NoPoliza) {
            return res.status(400).json({ message: "El archivo Excel no contiene una columna 'NoPoliza'." });
        }

        // 🔍 **Obtener todas las pólizas de la base de datos**
        const [polizasDB] = await pool.query("SELECT * FROM polizas_revisadas");
        const polizasMap = new Map(polizasDB.map(row => [row.NoPoliza, row])); // Convertir a Map para búsqueda rápida

        // 📝 **Lista de columnas esperadas**
        const columnasEsperadas = [
            "NoPoliza", "RFC", "NombreContratante", "FechaVigenciaInicio", "FechaVigenciaFin",
            "PrimaTotal", "Endoso", "Direccion", "CP", "NumeroCelular", "Correo", "Ramo", "ClaveAgente"
        ];

        // 🔄 **Cruzar datos y completar la información**
        data = data.map(row => {
            const polizaInfo = polizasMap.get(row.NoPoliza) || {}; // Si no está en la base, dejamos un objeto vacío

            return {
                NoPoliza: row.NoPoliza, // Siempre incluir el número de póliza original
                EnBase: polizaInfo.NoPoliza ? "X" : "", // Marcar con "X" si está en la base
                ...columnasEsperadas.reduce((acc, columna) => {
                    acc[columna] = polizaInfo[columna] || row[columna] || ""; // Si no está en base, mantener el valor del Excel o vacío
                    return acc;
                }, {})
            };
        });

        // 📖 **Crear un nuevo archivo Excel en memoria**
        const newWorkbook = xlsx.utils.book_new();
        const newWorksheet = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, "PolizasActualizadas");

        // 📂 **Convertir el archivo actualizado a buffer**
        const excelBuffer = xlsx.write(newWorkbook, { type: "buffer", bookType: "xlsx" });

        res.setHeader("Content-Disposition", "attachment; filename=PolizasSubir_Actualizado.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        res.status(200).send(excelBuffer);

    } catch (error) {
        console.error("❌ Error al procesar el archivo Excel:", error);
        res.status(500).json({
            message: "Error al procesar el archivo Excel",
            error: error.message
        });
    }
};