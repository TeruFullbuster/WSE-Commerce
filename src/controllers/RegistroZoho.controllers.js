import puppeteer from 'puppeteer';
import fs from 'fs';

const TokenZoho = "ozohocsrcoo=3ec516525b5a5d6d2d5d67fcf22d82eaaa2be55f2a558c409d6ba9c2a2bb08101eebb73d1b606741c51e21b4100eacb5b53f0ede3895adb64ba6a9150035f580";
const CookieZoho = "_iamadt=41ce4fbc40b932094546bfd7e56daf800b032a069c83c003245a027bcf5895a9a839a64e108f98c0025da2d060be732b5403dea5be5b078736b1d2ef7d892330; _iambdt=8bcef46956ab73edd05f7651e118e44b88c11e96cd44ed7067e9aa120272ef2c340b837ae1dd678d4bb57b8bc4b19c462bfd89442864bd387acac245e4f6c367; ozohocsr=3ec516525b5a5d6d2d5d67fcf22d82eaaa2be55f2a558c409d6ba9c2a2bb08101eebb73d1b606741c51e21b4100eacb5b53f0ede3895adb64ba6a9150035f580; _zcsr_tmp=3ec516525b5a5d6d2d5d67fcf22d82eaaa2be55f2a558c409d6ba9c2a2bb08101eebb73d1b606741c51e21b4100eacb5b53f0ede3895adb64ba6a9150035f580; CT_CSRF_TOKEN=3ec516525b5a5d6d2d5d67fcf22d82eaaa2be55f2a558c409d6ba9c2a2bb08101eebb73d1b606741c51e21b4100eacb5b53f0ede3895adb64ba6a9150035f580; wms-tkp-token=800473062-2b1ebff5-666905ff958a7c24dd8a47fa4410bc69; CSRF_TOKEN=3ec516525b5a5d6d2d5d67fcf22d82eaaa2be55f2a558c409d6ba9c2a2bb08101eebb73d1b606741c51e21b4100eacb5b53f0ede3895adb64ba6a9150035f580; app_sfmo9c033add411234523ae1e30223db82ebd=eyJlbnRpdHlfaWQiOiIyMjQzMjMwNjAyNTE3ODE3OTYxIiwibW9kdWxlIjoiQ2hhdHMifQ==; zalb_3309580ed5=5e41c4a69d62a20d11fee6ef8532db03; zalb_6feda1cee0=69ac280cf1ebae8919b2130e5e288c5e; JSESSIONID=1781A9DE412FA9205AA58290E3F8BC24; com_chat_owner=1730849343934; com_avcliq_owner=1730849343935";

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


export const EmailExist = async (req, res) => {
    const { Email ,  Active, Response } = req.body; // Extraer el correo electrónico de los parámetros de la URL
    
    try{

        if (!Email) {
            return res.status(400).json({ message: "El correo electrónico es obligatorio" });
        }
        
        const Respuesta = await pool.query('INSERT INTO ABCGetEmail (EmailConsulta, Active, Response) VALUES (?, ?, ?)', [Email ,  Active, Response]);
        
        if(!Respuesta){
            return res.status(400).json({ message: "Error al revisar el correo electrónico" });
        }
    
        res.json(Respuesta);
    
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error",
            error: error.message
        });
    }
};

