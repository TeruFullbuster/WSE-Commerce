import puppeteer from 'puppeteer';
import fs from 'fs';

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
    myHeaders.append("Cookie", "zohocares-_zldp=YfEOFpfOAG%2FL9h2wm3hJ%2FgfBK1vX09RZESXbTMucH7wUjxdeLfzTJ1cV2UrIuarDb8YSslKh1II%3D; zohocares-_uuid=11fa1669-d6cc-4a86-b9f0-aeab5cfef362_d298; ZohoMarkRef=\"https://www.zoho.com/es-xl/mail/?zsrc=fromproduct\"; 6feda1cee0=19c433fabc01729e3d93a22892540ecc; 3309580ed5=0c4a79d08c61db863a11041128fa1862; ZohoMarkSrc=\"google:mail||google:mail\"; zsca63a3daff87f4d33b6cffbe7a949ff5f=1718242447797zsc0.7546657115583106; zft-sdc=isef%3Dtrue-isfr%3Dtrue-src%3Done.zoho.com; zps-tgr-dts=sc%3D3-expAppOnNewSession%3D%5B%5D-pc%3D1-sesst%3D1718242447798; zohocares-_zldt=96c80fe1-bff2-4da3-bfdd-3f8720142c5c-0; _iamadt=2e3c0ce3364d760c29e5f4f92e012a1d4736e1287723a0fb90c89bb12eebad233d8f9cae072564d0250d3e1cdb5e30e4825701f0e054c5a1bbf96a1eae927f20; _iambdt=a2e760da9034469023695ac2d20ff780bea4c4e87a417cdc70f592445f3192d51d2950ed54b12d4a0397a94423d5dab0106acb44b44f717cbdd99ef9c199e189; ozohocsr=293991f418d3a3a21c1560def491a13f0ad1a589c77432b31e88407bec42fd1a0852cc89f9d11069ccd9806cb3152f147b1efffdf7ba4e51379f11d48228990f; _zcsr_tmp=293991f418d3a3a21c1560def491a13f0ad1a589c77432b31e88407bec42fd1a0852cc89f9d11069ccd9806cb3152f147b1efffdf7ba4e51379f11d48228990f; CT_CSRF_TOKEN=293991f418d3a3a21c1560def491a13f0ad1a589c77432b31e88407bec42fd1a0852cc89f9d11069ccd9806cb3152f147b1efffdf7ba4e51379f11d48228990f; wms-tkp-token=720810430-1158e30d-e26d886919acec866c176cf49ea0fb52; com_chat_owner=1718242485509; com_avcliq_owner=1718242485510; JSESSIONID=5AA018E35EB2A21E2ECCF3A599301F2B; 6feda1cee0=5b566598b2beee6a9bc663a26a2d927c; JSESSIONID=1BCE3BBC293ED97CE4062507B1C374E1; _zcsr_tmp=4bd4cb24-83c4-48dd-a78e-b420d0af8e77; ozohocsr=4bd4cb24-83c4-48dd-a78e-b420d0af8e77");
    myHeaders.append("X-Zcsrf-Token", "ozohocsrcoo=293991f418d3a3a21c1560def491a13f0ad1a589c77432b31e88407bec42fd1a0852cc89f9d11069ccd9806cb3152f147b1efffdf7ba4e51379f11d48228990f");
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
        "X-Zcsrf-Token": "ozohocsrcoo=293991f418d3a3a21c1560def491a13f0ad1a589c77432b31e88407bec42fd1a0852cc89f9d11069ccd9806cb3152f147b1efffdf7ba4e51379f11d48228990f",
        "Cookie": "zohocares-_zldp=YfEOFpfOAG%2FL9h2wm3hJ%2FgfBK1vX09RZESXbTMucH7wUjxdeLfzTJ1cV2UrIuarDb8YSslKh1II%3D; zohocares-_uuid=11fa1669-d6cc-4a86-b9f0-aeab5cfef362_d298; ZohoMarkRef=\"https://www.zoho.com/es-xl/mail/?zsrc=fromproduct\"; 6feda1cee0=19c433fabc01729e3d93a22892540ecc; 3309580ed5=0c4a79d08c61db863a11041128fa1862; ZohoMarkSrc=\"google:mail||google:mail\"; zsca63a3daff87f4d33b6cffbe7a949ff5f=1718242447797zsc0.7546657115583106; zft-sdc=isef%3Dtrue-isfr%3Dtrue-src%3Done.zoho.com; zps-tgr-dts=sc%3D3-expAppOnNewSession%3D%5B%5D-pc%3D1-sesst%3D1718242447798; zohocares-_zldt=96c80fe1-bff2-4da3-bfdd-3f8720142c5c-0; _iamadt=2e3c0ce3364d760c29e5f4f92e012a1d4736e1287723a0fb90c89bb12eebad233d8f9cae072564d0250d3e1cdb5e30e4825701f0e054c5a1bbf96a1eae927f20; _iambdt=a2e760da9034469023695ac2d20ff780bea4c4e87a417cdc70f592445f3192d51d2950ed54b12d4a0397a94423d5dab0106acb44b44f717cbdd99ef9c199e189; ozohocsr=293991f418d3a3a21c1560def491a13f0ad1a589c77432b31e88407bec42fd1a0852cc89f9d11069ccd9806cb3152f147b1efffdf7ba4e51379f11d48228990f; _zcsr_tmp=293991f418d3a3a21c1560def491a13f0ad1a589c77432b31e88407bec42fd1a0852cc89f9d11069ccd9806cb3152f147b1efffdf7ba4e51379f11d48228990f; CT_CSRF_TOKEN=293991f418d3a3a21c1560def491a13f0ad1a589c77432b31e88407bec42fd1a0852cc89f9d11069ccd9806cb3152f147b1efffdf7ba4e51379f11d48228990f; wms-tkp-token=720810430-1158e30d-e26d886919acec866c176cf49ea0fb52; com_chat_owner=1718242485509; com_avcliq_owner=1718242485510; JSESSIONID=5AA018E35EB2A21E2ECCF3A599301F2B; 6feda1cee0=5b566598b2beee6a9bc663a26a2d927c; JSESSIONID=1BCE3BBC293ED97CE4062507B1C374E1; _zcsr_tmp=4bd4cb24-83c4-48dd-a78e-b420d0af8e77; ozohocsr=4bd4cb24-83c4-48dd-a78e-b420d0af8e77"
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
        "X-Zcsrf-Token": "ozohocsrcoo=293991f418d3a3a21c1560def491a13f0ad1a589c77432b31e88407bec42fd1a0852cc89f9d11069ccd9806cb3152f147b1efffdf7ba4e51379f11d48228990f",
        "Cookie": "zohocares-_zldp=YfEOFpfOAG%2FL9h2wm3hJ%2FgfBK1vX09RZESXbTMucH7wUjxdeLfzTJ1cV2UrIuarDb8YSslKh1II%3D; zohocares-_uuid=11fa1669-d6cc-4a86-b9f0-aeab5cfef362_d298; ZohoMarkRef=\"https://www.zoho.com/es-xl/mail/?zsrc=fromproduct\"; 6feda1cee0=19c433fabc01729e3d93a22892540ecc; 3309580ed5=0c4a79d08c61db863a11041128fa1862; ZohoMarkSrc=\"google:mail||google:mail\"; zsca63a3daff87f4d33b6cffbe7a949ff5f=1718242447797zsc0.7546657115583106; zft-sdc=isef%3Dtrue-isfr%3Dtrue-src%3Done.zoho.com; zps-tgr-dts=sc%3D3-expAppOnNewSession%3D%5B%5D-pc%3D1-sesst%3D1718242447798; zohocares-_zldt=96c80fe1-bff2-4da3-bfdd-3f8720142c5c-0; _iamadt=2e3c0ce3364d760c29e5f4f92e012a1d4736e1287723a0fb90c89bb12eebad233d8f9cae072564d0250d3e1cdb5e30e4825701f0e054c5a1bbf96a1eae927f20; _iambdt=a2e760da9034469023695ac2d20ff780bea4c4e87a417cdc70f592445f3192d51d2950ed54b12d4a0397a94423d5dab0106acb44b44f717cbdd99ef9c199e189; ozohocsr=293991f418d3a3a21c1560def491a13f0ad1a589c77432b31e88407bec42fd1a0852cc89f9d11069ccd9806cb3152f147b1efffdf7ba4e51379f11d48228990f; _zcsr_tmp=293991f418d3a3a21c1560def491a13f0ad1a589c77432b31e88407bec42fd1a0852cc89f9d11069ccd9806cb3152f147b1efffdf7ba4e51379f11d48228990f; CT_CSRF_TOKEN=293991f418d3a3a21c1560def491a13f0ad1a589c77432b31e88407bec42fd1a0852cc89f9d11069ccd9806cb3152f147b1efffdf7ba4e51379f11d48228990f; wms-tkp-token=720810430-1158e30d-e26d886919acec866c176cf49ea0fb52; com_chat_owner=1718242485509; com_avcliq_owner=1718242485510; JSESSIONID=5AA018E35EB2A21E2ECCF3A599301F2B; 6feda1cee0=5b566598b2beee6a9bc663a26a2d927c; JSESSIONID=1BCE3BBC293ED97CE4062507B1C374E1; _zcsr_tmp=4bd4cb24-83c4-48dd-a78e-b420d0af8e77; ozohocsr=4bd4cb24-83c4-48dd-a78e-b420d0af8e77"
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

