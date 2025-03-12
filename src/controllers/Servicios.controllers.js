import axios from "axios";
import puppeteer from "puppeteer";

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

// 🔥 **Ejemplo de Uso**
consultarRepuve("LST567B").then(data => console.log(data));