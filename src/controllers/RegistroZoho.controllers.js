import puppeteer from 'puppeteer';
import fs from 'fs';

const TokenZoho = "ozohocsrcoo=d1ce60c79d52308e47574ea0b7d6cdfd52757bf05cb5a1d13bc850a6b5f8a9db40f62585e31243f2039616f9677bcfe5d5106995ed6ee067abf8e85fe1d4ee6f";
const CookieZoho = "_iamadt=41ce4fbc40b932094546bfd7e56daf80390e8f70dcf4ae279a6665d120be6976a607fd7a9add3fd858a39a6cc4a93b635e5f3c05355b0500f1d427cf81df220b; _iambdt=88e07e78356aded2bd4027d5dc1cb20b17c1c3d364cc17e2b4493639a6eca41d8951ba8227e4e3d8a14ae574daec50f4373f886fc121d1a65c9c81ea1a1b1b93; wms-tkp-token=800473062-436ed0ab-492f7a857fea6f46f7446f0e67b193b5; CT_CSRF_TOKEN=d1ce60c79d52308e47574ea0b7d6cdfd52757bf05cb5a1d13bc850a6b5f8a9db40f62585e31243f2039616f9677bcfe5d5106995ed6ee067abf8e85fe1d4ee6f; _zcsr_tmp=d1ce60c79d52308e47574ea0b7d6cdfd52757bf05cb5a1d13bc850a6b5f8a9db40f62585e31243f2039616f9677bcfe5d5106995ed6ee067abf8e85fe1d4ee6f; com_chat_owner=1722818643941_f; ozohocsr=d1ce60c79d52308e47574ea0b7d6cdfd52757bf05cb5a1d13bc850a6b5f8a9db40f62585e31243f2039616f9677bcfe5d5106995ed6ee067abf8e85fe1d4ee6f; zalb_6feda1cee0=127aa5b4ad62fd47c73d84df2954f733; JSESSIONID=4D7C1072978C6C6BA823A827010460E8; zalb_3309580ed5=4c5716862d4ac06e042a8460ce1f1fdc; com_avcliq_owner=1722369224795";

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