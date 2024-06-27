import puppeteer from 'puppeteer';
import fs from 'fs';

const TokenZoho = "ozohocsrcoo=db6d98c6a41b929001e0c74417a3c89e021b9d1b4037f72f71bacee1d26a42f069035e4a0751ee875cc6850087b21d17cd14f7586f436edbcaec5764e7a2f438";
const CookieZoho = "_iamadt=41ce4fbc40b932094546bfd7e56daf80d3c75de9d4792b67eac6ddd4798ffbe932a7c4e225e7feb8712d6c04babf6129a75635a2a43b11f3d2bcce7d302bb954; _iambdt=d79ba1e96f7d869da8243c42f0d9a9bc681c4951771be17f8d4ca1cbb185bfd3375eb907d4b657ab8bd8c45592ab8ce8800b1ecb42dafd8214fdbb989ce03004; wms-tkp-token=800473062-7e2a4ecd-ba39c1bfcfc597dea150df12e93355f4; ozohocsr=db6d98c6a41b929001e0c74417a3c89e021b9d1b4037f72f71bacee1d26a42f069035e4a0751ee875cc6850087b21d17cd14f7586f436edbcaec5764e7a2f438; _zcsr_tmp=db6d98c6a41b929001e0c74417a3c89e021b9d1b4037f72f71bacee1d26a42f069035e4a0751ee875cc6850087b21d17cd14f7586f436edbcaec5764e7a2f438; CT_CSRF_TOKEN=db6d98c6a41b929001e0c74417a3c89e021b9d1b4037f72f71bacee1d26a42f069035e4a0751ee875cc6850087b21d17cd14f7586f436edbcaec5764e7a2f438; CSRF_TOKEN=db6d98c6a41b929001e0c74417a3c89e021b9d1b4037f72f71bacee1d26a42f069035e4a0751ee875cc6850087b21d17cd14f7586f436edbcaec5764e7a2f438; com_chat_owner=1718914921563_f; zalb_6feda1cee0=2c31a623bf2e77f060bdaea264a2c0c0; JSESSIONID=BDFBB60B6E0C0484088F59F1A536AEC7; zalb_3309580ed5=5e41c4a69d62a20d11fee6ef8532db03; com_avcliq_owner=1718979763973";

export const RegistroZoho = async (req, res) => {
    const { Nombre, Apellido, Correo } = req.body;
    const Mail = "infraestructura@segurointeligente.mx";
    const Pass = "Infraestructura2024&%";

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

export const CreateUserZoho = async (req, res) => {
    const { Datos } = req.body; // Extraer los datos del cuerpo de la solicitud
    console.log(Datos)
    const myHeaders = new Headers();
    myHeaders.append("Cookie", CookieZoho);
    myHeaders.append("X-Zcsrf-Token", TokenZoho);
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
    "users": {
        "first_name": Datos.users.first_name,
        "last_name": Datos.users.last_name,
        "gender": Datos.users.gender,
        "country_code": "MX",
        "timezone": "America/Mexico_City",
        "notify_mail": true,
        "language_code": "es-mx",
        "allow_auto_create_mailbox": false,
        "emails": [
        {
            "email_id": Datos.users.emails.email_id,
        }
        ],
        "password": {
        "password": Datos.users.password.password,
        "is_one_time_password": true
        },
        "address": [
        {}
        ]
    }
    });
    console.log(raw)
    const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        try {
            const response = await fetch("https://one.zoho.com/api/v1/orgs/651915177/users", requestOptions);
            const result = await response.json();
            console.log(result);
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error en la solicitud' });
        }
};

export const SearchEmailZoho = async (req, res) => {
    const { email } = req.query; // Extraer el correo electrónico de los parámetros de la URL

    const myHeaders = {
        "X-Zcsrf-Token": TokenZoho,
        "Cookie": CookieZoho
    };

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    try {
        const response = await fetch(`https://one.zoho.com/api/v1/orgs/651915177/reports/users/verifyemail?filter_email_id=${email}`, requestOptions);
        const result = await response.json();
        console.log(result);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en la solicitud' });
    }
};

export const SearchActiveAccountZoho = async (req, res) => {

    const myHeaders = {
        "X-Zcsrf-Token": TokenZoho,
        "Cookie": CookieZoho
    };

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    try {
        const response = await fetch(`https://one.zoho.com/api/v1/orgs/651915177/dashboard?include=user_stats%2Corg_stats&timezone=America%2FMexico_City`, requestOptions);
        const result = await response.json();
        console.log(result);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en la solicitud' });
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

console.log('Ejecutando')