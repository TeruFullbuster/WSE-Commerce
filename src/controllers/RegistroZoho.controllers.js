import puppeteer from 'puppeteer';
import fs from 'fs';

export const RegistroZoho = async (req, res) => {
    const { Nombre, Apellido, Correo } = req.body;
    const Mail = "infraestructura@segurointeligente.mx";
    const Pass = "!nfr43sTructura%$";

    // Abrir una instancia del navegador
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        // Navegar a la página de registro
        await page.goto('https://one.zoho.com/zohoone/segurointeligente/adminhome#/users/new');
        console.log('Página de registro cargada.');

        // Esperar a que la página cargue completamente
        await page.waitForSelector('input[name="LOGIN_ID"]');
        await page.waitForSelector('input[name="PASSWORD"]');

        // Rellenar el formulario de inicio de sesión con los datos proporcionados
        await page.type('input[name="LOGIN_ID"]', Mail);
        // Obtiene el valor del input
        const valorInput = await page.$eval('input[name="LOGIN_ID"]', input => input.value);
        console.log('Valor del input:', valorInput);
        // Hacer clic en el botón de siguiente
        await page.click('button#nextbtn');

        // Esperar un par de segundos para asegurar que la página se haya cargado completamente
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Obtener el texto del botón después de hacer clic en él
        const textoBoton = await page.evaluate(() => {
        const boton = document.querySelector('button#nextbtn');
        return boton.textContent.trim();
        });

        console.log('Texto del botón después de hacer clic:', textoBoton);
        await page.type('input[name="PASSWORD"]', Pass);
        // Obtiene el valor del input
        const valorInput2 = await page.$eval('input[name="PASSWORD"]', input => input.value);
        console.log('Valor del input:', valorInput2);
        // Hacer clic en el botón de siguiente
        await page.click('button#nextbtn');

        // Esperar un par de segundos para asegurar que la página se haya cargado completamente
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Imprimir la URL actual
        console.log('Se completó el inicio de sesión. URL actual:', page.url());
        console.log('Ingreso a la cuenta');

       /*  // Esperar a que se complete el inicio de sesión
        await page.waitForNavigation(); */

        // Esperar un par de segundos para asegurar que la página se haya cargado completamente
        await new Promise(resolve => setTimeout(resolve, 20000));
        // Guardar el contenido de la página en un archivo de texto
        const contenidoPagina = await page.content();
        fs.writeFileSync('PaginaPrincipal.txt', contenidoPagina);
        // Imprimir la URL actual
        console.log('Se completó el inicio de sesión. URL actual:', page.url());

        // Esperar un par de segundos para asegurar que la página se haya cargado completamente
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Imprimir la URL actual
        await page.waitForSelector('#ember4340');

        // Obtener el HTML del elemento con el ID "ember4340"
        const htmlElemento = await page.$eval('#ember4340', element => element.outerHTML);
        console.log('Se busca Form:', page.url());
        // Esperar a que aparezca el OTP en la página
        // Esperar a que el elemento esté presente en la página
        // Imprimir o hacer lo que necesites con el HTML del elemento        
        await page.waitForSelector('.zod-fw-600.zod-fs-15');

        // Obtener el texto del OTP
        const otpElement = await page.$('.zod-fw-600.zod-fs-15');
        const otpValue = await page.evaluate(element => element.textContent, otpElement);
        console.log('One-Time Password:', otpValue); 
           
        await page.type('input[#ember4383]', Nombre);
        await page.type('input[#ember4384]', Apellido);
        await page.type('input[#ember4394]', Correo);
        await page.click('button#submit');
        await new Promise(resolve => setTimeout(resolve, 3000));

        const contenidoPagina2 = await page.content();

        fs.writeFileSync('RegistroCompleto.txt', contenidoPagina2);

        await page.waitForSelector('#ember4377');

        // Hacer clic en el botón dentro del div con el ID "ember4377"
        await page.evaluate(() => {
            const divElemento = document.querySelector('#ember4377');
            if (divElemento) {
                const boton = divElemento.querySelector('#submit');
                if (boton) {
                    boton.click();
                } else {
                    console.error('No se encontró el botón dentro del div.');
                }
            } else {
                console.error('No se encontró el div con el ID "ember4377".');
            }
        });
    } catch (error) {
        console.error('Error al obtener el OTP:', error);
    } finally {
        // Cerrar el navegador
        await browser.close();
    }
};




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

