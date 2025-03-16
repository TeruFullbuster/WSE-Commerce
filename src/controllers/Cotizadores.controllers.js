import e from 'cors';
import { pool } from '../db.js'
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import puppeteer from 'puppeteer';
import xmlbuilder from 'xmlbuilder';

export const CotizarQualitas = async (req, res) => {
    const {
        marca, modelo, descripcionVehiculo, cPostal, cveAmis, usoVehiculo, servicioVehiculo,
        paquete, agenteNegocio, inicioVig, finVig, agente, tarifaValores, porcentajeDescuento
    } = req.body;

    try {
        // Validaciones y valores por defecto
        const agenteFinal = agente || "74034"; // Valor por defecto basado en tu ejemplo
        const negocioFinal = agenteNegocio || "1925"; // Valor por defecto basado en tu ejemplo
        const cPostalFormatted = cPostal && cPostal.length < 5 ? `0${cPostal}` : cPostal || "00000";
        const cveAmisFormatted = cveAmis ? cveAmis.padStart(5, '0') : "02533"; // Ejemplo predeterminado
        const descripcionFinal = descripcionVehiculo || "ACCENT GL MID C/ACC. AIRBAG 5PAS. 5PTAS. R-15 STD. L4 1.6L ABS CAMARA-TRASERA";
        const usoVehiculoFinal = usoVehiculo || "01";
        const servicioVehiculoFinal = servicioVehiculo || "01";
        const paqueteFinal = paquete || "01";
        const tarifaValoresFinal = tarifaValores || "2409";
        const porcentajeDescuentoFinal = porcentajeDescuento || "50";

        // Construcción del XML
        const xmlRequest = xmlbuilder
            .create('Movimientos')
            .ele('Movimiento', {
                NoNegocio: negocioFinal,
                NoOTra: "",
                TipoEndoso: "",
                NoEndoso: "",
                NoCotizacion: "",
                NoPoliza: "",
                TipoMovimiento: "2"
            })
            .ele('DatosAsegurado', { NoAsegurado: "" })
                .ele('Nombre').text("").up()
                .ele('Direccion').text("").up()
                .ele('Colonia').text("").up()
                .ele('Poblacion').text("").up()
                .ele('Estado').text("09").up()
                .ele('CodigoPostal').text(cPostalFormatted).up()
                .up() // Cierra DatosAsegurado
            .ele('DatosVehiculo', { NoInciso: "1" })
                .ele('ClaveAmis').text(cveAmisFormatted).up()
                .ele('Modelo').text(modelo || "2020").up()
                .ele('DescripcionVehiculo').text(descripcionFinal).up()
                .ele('Uso').text(usoVehiculoFinal).up()
                .ele('Servicio').text(servicioVehiculoFinal).up()
                .ele('Paquete').text(paqueteFinal).up()
                .ele('Coberturas', { NoCobertura: "1" })
                    .ele('SumaAsegurada').text("").up()
                    .ele('TipoSuma').text("02").up()
                    .ele('Deducible').text("5").up()
                    .ele('Prima').text("0").up().up()
                .ele('Coberturas', { NoCobertura: "4" })
                    .ele('SumaAsegurada').text("3000000").up()
                    .ele('TipoSuma').text("0").up()
                    .ele('Deducible').text("0").up()
                    .ele('Prima').text("0").up().up()
                .up() // Cierra DatosVehiculo
            .ele('DatosGenerales')
                .ele('FechaEmision').text(inicioVig || "2024-12-03").up()
                .ele('FechaInicio').text(inicioVig || "2024-12-03").up()
                .ele('FechaTermino').text(finVig || "2025-12-03").up()
                .ele('Moneda').text("0").up()
                .ele('Agente').text(agenteFinal).up()
                .ele('FormaPago').text("C").up()
                .ele('TarifaValores').text(tarifaValoresFinal).up()
                .ele('TarifaCuotas').text(tarifaValoresFinal).up()
                .ele('TarifaDerechos').text(tarifaValoresFinal).up()
                .ele('PorcentajeDescuento').text(porcentajeDescuentoFinal).up()
                .up() // Cierra DatosGenerales
            .ele('Primas')
                .ele('PrimaNeta').text("").up()
                .ele('Derecho').text("750").up()
                .ele('Recargo').text("").up()
                .ele('Impuesto').text("").up()
                .ele('PrimaTotal').text("").up()
                .ele('Comision').text("").up()
                .up() // Cierra Primas
            .ele('CodigoError').text("").up()
            .end({ pretty: true });
            console.log(xmlRequest);
        // Enviar la solicitud SOAP
        const response = await axios.post('https://qa.qualitas.com.mx/wsEmisionServiceSoap', xmlRequest, {
            headers: {
                'Content-Type': 'text/xml;charset=UTF-8',
                SOAPAction: 'http://qualitas.com.mx/obtenerNuevaEmision',
            },
        });
        console.log(response);
        // Manejo de la respuesta
        res.json({ message: 'Cotización realizada con éxito', response: response.data });
    } catch (error) {
        res.status(500).json({ message: 'Error en la cotización', error: error.message });
    }
};

export const CotizarChubb = async (req, res) => {
    const {
        marca, modelo, descripcionVehiculo, cPostal, cveAmis, usoVehiculo, servicioVehiculo,
        paquete, agenteNegocio, inicioVig, finVig, agente, tarifaValores, porcentajeDescuento
    } = req.body;

    try {
        // Validaciones y valores por defecto
        const agenteFinal = agente || "74034"; // Valor por defecto basado en tu ejemplo
        const negocioFinal = agenteNegocio || "1925"; // Valor por defecto basado en tu ejemplo
        const cPostalFormatted = cPostal && cPostal.length < 5 ? `0${cPostal}` : cPostal || "00000";
        const cveAmisFormatted = cveAmis ? cveAmis.padStart(5, '0') : "02533"; // Ejemplo predeterminado
        const descripcionFinal = descripcionVehiculo || "ACCENT GL MID C/ACC. AIRBAG 5PAS. 5PTAS. R-15 STD. L4 1.6L ABS CAMARA-TRASERA";
        const usoVehiculoFinal = usoVehiculo || "01";
        const servicioVehiculoFinal = servicioVehiculo || "01";
        const paqueteFinal = paquete || "01";
        const tarifaValoresFinal = tarifaValores || "2409";
        const porcentajeDescuentoFinal = porcentajeDescuento || "50";

        // Construcción del XML
        const xmlRequest = xmlbuilder
            .create('Movimientos')
            .ele('Movimiento', {
                NoNegocio: negocioFinal,
                NoOTra: "",
                TipoEndoso: "",
                NoEndoso: "",
                NoCotizacion: "",
                NoPoliza: "",
                TipoMovimiento: "2"
            })
            .ele('DatosAsegurado', { NoAsegurado: "" })
                .ele('Nombre').text("").up()
                .ele('Direccion').text("").up()
                .ele('Colonia').text("").up()
                .ele('Poblacion').text("").up()
                .ele('Estado').text("09").up()
                .ele('CodigoPostal').text(cPostalFormatted).up()
                .up() // Cierra DatosAsegurado
            .ele('DatosVehiculo', { NoInciso: "1" })
                .ele('ClaveAmis').text(cveAmisFormatted).up()
                .ele('Modelo').text(modelo || "2020").up()
                .ele('DescripcionVehiculo').text(descripcionFinal).up()
                .ele('Uso').text(usoVehiculoFinal).up()
                .ele('Servicio').text(servicioVehiculoFinal).up()
                .ele('Paquete').text(paqueteFinal).up()
                .ele('Coberturas', { NoCobertura: "1" })
                    .ele('SumaAsegurada').text("").up()
                    .ele('TipoSuma').text("02").up()
                    .ele('Deducible').text("5").up()
                    .ele('Prima').text("0").up().up()
                .ele('Coberturas', { NoCobertura: "4" })
                    .ele('SumaAsegurada').text("3000000").up()
                    .ele('TipoSuma').text("0").up()
                    .ele('Deducible').text("0").up()
                    .ele('Prima').text("0").up().up()
                .up() // Cierra DatosVehiculo
            .ele('DatosGenerales')
                .ele('FechaEmision').text(inicioVig || "2024-12-03").up()
                .ele('FechaInicio').text(inicioVig || "2024-12-03").up()
                .ele('FechaTermino').text(finVig || "2025-12-03").up()
                .ele('Moneda').text("0").up()
                .ele('Agente').text(agenteFinal).up()
                .ele('FormaPago').text("C").up()
                .ele('TarifaValores').text(tarifaValoresFinal).up()
                .ele('TarifaCuotas').text(tarifaValoresFinal).up()
                .ele('TarifaDerechos').text(tarifaValoresFinal).up()
                .ele('PorcentajeDescuento').text(porcentajeDescuentoFinal).up()
                .up() // Cierra DatosGenerales
            .ele('Primas')
                .ele('PrimaNeta').text("").up()
                .ele('Derecho').text("750").up()
                .ele('Recargo').text("").up()
                .ele('Impuesto').text("").up()
                .ele('PrimaTotal').text("").up()
                .ele('Comision').text("").up()
                .up() // Cierra Primas
            .ele('CodigoError').text("").up()
            .end({ pretty: true });
            console.log(xmlRequest);
        // Enviar la solicitud SOAP
        const response = await axios.post('https://qa.qualitas.com.mx/wsEmisionServiceSoap', xmlRequest, {
            headers: {
                'Content-Type': 'text/xml;charset=UTF-8',
                SOAPAction: 'http://qualitas.com.mx/obtenerNuevaEmision',
            },
        });
        console.log(response);
        // Manejo de la respuesta
        res.json({ message: 'Cotización realizada con éxito', response: response.data });
    } catch (error) {
        res.status(500).json({ message: 'Error en la cotización', error: error.message });
    }
};

export const BotcotizacionChubb = async (req, res) => {
    const {  noSerieNIV,
        valorVehiculoUSD,
        diasCobertura,
        zonaCobertura,
        hibridoElectrico,
        tieneRemolque,
        tipoDeducible,
        edadConductor,
        nombreContacto,
        apellidoContacto,
        emailContacto,
        celularContacto,
        documentoPDF1, // Base64 del primer PDF
        documentoPDF2  // Base64 del segundo PDF
         } = req.body; // Recibe el VIN del body
         let insertedId; // Declarar la variable fuera del try
         try {
            // Construir la consulta SQL dinámicamente
            let query = `
                INSERT INTO CotizacionesTuristas (
                    noSerieNIV,
                    valorVehiculoUSD,
                    diasCobertura,
                    zonaCobertura,
                    hibridoElectrico,
                    tieneRemolque,
                    tipoDeducible,
                    edadConductor,
                    nombreContacto,
                    apellidoContacto,
                    emailContacto,
                    celularContacto,
                    horaCotizacion
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;
    
            // Valores a insertar
            let values = [
                noSerieNIV,
                valorVehiculoUSD,
                diasCobertura,
                zonaCobertura,
                hibridoElectrico || 'No', // Default 'No' si no está definido
                tieneRemolque || 'No',    // Default 'No'
                tipoDeducible,
                edadConductor,
                nombreContacto,
                apellidoContacto,
                emailContacto,
                celularContacto
            ];
    
            // Ejecutar la consulta
            const [rows] = await pool.query(query, values);
            // Capturar el ID insertado
            insertedId = rows.insertId;
            
            console.log(`ID generado en la inserción: ${insertedId}`);
        } catch (error) {
            // Manejo de errores
            return res.status(500).json({
                message: 'Algo salió mal durante el registro',
                error: error.message
            });
        }
    const agentKey = "MAGAGEN";
    const password = "Chubb2025!";

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        // Navegación al portal
        await page.goto('https://chubbcrossborder.com/index.php', { waitUntil: 'networkidle2' });

        // Inicio de sesión
        await page.type('#user', agentKey);
        await page.type('#pass', password);

        // Hacer clic en el botón Login
        await page.evaluate(() => {
            document.querySelector('a.btn').click();
        });

        // Esperar navegación después del clic
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        console.log('Inicio de sesión exitoso.');

        // Abrir menú btn-menu
        const menuButtonSelector = '#btn-menu';
        await page.waitForSelector(menuButtonSelector, { visible: true });
        await page.click(menuButtonSelector);
        console.log('Menú abierto con éxito.');

        // Agregar delay para que el menú cargue
        await delay(2000);

        // Selector del enlace dentro del menú desplegable Tasks
        const linkSelector = 'ul#task a.title.menu';
        const linkText = 'Quote Mexican Auto Insurance';

        // Buscar el enlace por texto y hacer clic
        const links = await page.$$eval(linkSelector, (elements, text) => {
            for (const el of elements) {
                if (el.textContent.trim() === text) {
                    el.click();
                    return true; // Retorna true si se realizó el clic
                }
            }
            return false; // Retorna false si no encontró el enlace
        }, linkText);

        if (links) {
            console.log(`Clic realizado en el enlace: "${linkText}"`);
            await delay(3000); // Esperar navegación
        } else {
            console.error(`No se encontró el enlace con texto: "${linkText}"`);
        }

        // Llenado de formulario

        // Espera a que cargue el formulario principal
        await delay(3000); // Pausa para garantizar el cargado

        // Buscar si hay iframes y cambiar al contexto correcto
        const frames = await page.frames();
        const formFrame = frames.find(frame => frame.name() === 'menu_inbox'); // Buscar el iframe por nombre

        if (!formFrame) {
            throw new Error("No se encontró el iframe del formulario.");
        }

        console.log('Cambiando contexto al iframe...');
        await formFrame.waitForSelector('input[name="txt_Name"]', { visible: true, timeout: 0 });
        console.log('Formulario detectado.');
         // Esperar y dar clic en el botón Mexico
         await formFrame.waitForSelector('a.btn', { visible: true });
         await formFrame.click('a.btn');
        // Llenar campos del formulario
        await formFrame.type('input[name="txt_Name"]', nombreContacto);
        await formFrame.type('input[name="txt_LName"]', apellidoContacto);
        await formFrame.select('select[name="days"]', diasCobertura);

        if (zonaCobertura === 'Zona A') {
            await formFrame.select('select[name="territory"]', '1');
            
        }
        if (hibridoElectrico === 'Sí') {
            await formFrame.click('input#hybrid');
        }
        if (tieneRemolque === 'Sí') {
            await formFrame.click('input#tow');
        }

        console.log('Formulario llenado correctamente.');
        await delay(1000);

        await formFrame.select('#vehicleTypeId', '1');

        await delay(1000);

        await formFrame.select('#vehicleValue', valorVehiculoUSD);

        await delay(1000);

        const [button] = await page.$("//a[@class='btn' and @href='javascript:Dopost_ini();']");
        if (button) {
        await button.click();
        console.log('Clic realizado en el botón con href="javascript:Dopost_ini();"');
        } else {
        console.error('No se encontró el botón con href="javascript:Dopost_ini();".');
        }

    } catch (error) {
        console.error('Error durante el proceso:', error);
        
        res.status(500).json({ message: 'Error durante el proceso', error: error.message });
    }
};

export const BotcotizacionQualitas = async (req, res) => {
    const {  noSerieNIV,
        valorVehiculoUSD,
        diasCobertura,
        zonaCobertura,
        hibridoElectrico,
        tieneRemolque,
        tipoDeducible,
        edadConductor,
        nombreContacto,
        apellidoContacto,
        emailContacto,
        celularContacto,
        documentoPDF1, // Base64 del primer PDF
        documentoPDF2  // Base64 del segundo PDF
         } = req.body; // Recibe el VIN del body
         let insertedId; // Declarar la variable fuera del try
         try {
            // Construir la consulta SQL dinámicamente
            let query = `
                INSERT INTO CotizacionesTuristas (
                    noSerieNIV,
                    valorVehiculoUSD,
                    diasCobertura,
                    zonaCobertura,
                    hibridoElectrico,
                    tieneRemolque,
                    tipoDeducible,
                    edadConductor,
                    nombreContacto,
                    apellidoContacto,
                    emailContacto,
                    celularContacto,
                    horaCotizacion
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;
    
            // Valores a insertar
            let values = [
                noSerieNIV,
                valorVehiculoUSD,
                diasCobertura,
                zonaCobertura,
                hibridoElectrico || 'No', // Default 'No' si no está definido
                tieneRemolque || 'No',    // Default 'No'
                tipoDeducible,
                edadConductor,
                nombreContacto,
                apellidoContacto,
                emailContacto,
                celularContacto
            ];
    
            // Ejecutar la consulta
            const [rows] = await pool.query(query, values);
            // Capturar el ID insertado
            insertedId = rows.insertId;
            
            console.log(`ID generado en la inserción: ${insertedId}`);
        } catch (error) {
            // Manejo de errores
            return res.status(500).json({
                message: 'Algo salió mal durante el registro',
                error: error.message
            });
        }
    const agentKey = "53717";
    const account = "MAESTRA";
    const password = "P13L78";

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        // Navegación al portal
        await page.goto('https://agentes360.qualitas.com.mx/web/guest/home', { waitUntil: 'networkidle2' });

        // Inicio de sesión
        await page.type('#_com_liferay_login_web_portlet_LoginPortlet_login', agentKey);
        await page.type('#_com_liferay_login_web_portlet_LoginPortlet_account', account);
        await page.type('#_com_liferay_login_web_portlet_LoginPortlet_password', password);

        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2' })
        ]);

        // Navegación a la página específica
        const specificUrl = 'https://agentes360.qualitas.com.mx/group/guest/nueva-cotizacion';
        await page.goto(specificUrl, { waitUntil: 'networkidle2' });

        // Esperar la sección principal
        await page.waitForSelector('#uso-vehiculo-section', { visible: true });

        // Función auxiliar para alternar opciones
        const toggleOptions = async (firstOption, secondOption) => {
            console.log(`Seleccionando opción: ${firstOption}`);
            await page.click(`label[for="${firstOption}"]`);
            await delay(1000);

            console.log(`Cambiando temporalmente a opción: ${secondOption}`);
            await page.click(`label[for="${secondOption}"]`);
            await delay(1000);

            console.log(`Volviendo a seleccionar opción: ${firstOption}`);
            await page.click(`label[for="${firstOption}"]`);
            await delay(1000);
        };

        // Simular selección para negocio 5
        await toggleOptions('negocio_5_origin', 'negocio_6_origin');

        // Alternar entre 'uso_1_packages' y 'uso_5_packages'
        await toggleOptions('uso_1_packages', 'uso_5_packages');

        // Alternar entre 'uso_1011_vehicle' y 'uso_1051_vehicle'
        await toggleOptions('uso_1011_vehicle', 'uso_1051_vehicle');

        // Verificar si 'uso_1011_vehicle' está seleccionado
        const isUso1011Selected = await page.$eval('#uso_1011_vehicle', el => el.checked);

        if (isUso1011Selected) {
            console.log("El elemento 'uso_1011_vehicle' está seleccionado. Pulsando el botón de submit...");
            await page.click('#buttonOrigenYUso'); // ID del botón de submit
            console.log("Formulario enviado.");
        } else {
            console.log("El elemento 'uso_1011_vehicle' no está seleccionado. No se enviará el formulario.");
            throw new Error("El elemento 'uso_1011_vehicle' no se pudo seleccionar.");
        }

        // Esperar unos segundos para la carga de la siguiente sección
        await delay(3000);

        // Buscar el input con ID "VINTuristas" y escribir el VIN
        console.log("Buscando el input 'VINTuristas' para ingresar el VIN...");
        await page.waitForSelector('#VINTuristas', { visible: true });

        // Escribir el VIN y pulsar Enter
        await page.type('#VINTuristas', noSerieNIV);
        console.log(`VIN ingresado: ${noSerieNIV}`);

         // Pulsar Enter
        await page.keyboard.press('Enter');
        console.log("Presionado Enter para buscar el VIN.");
        await delay(3000); // Esperar la carga de los modales

        // Buscar el modal correcto por su contenido
        console.log("Buscando el modal con la palabra 'Serie no amparada'...");
        const modalFound = await page.evaluate(() => {
            const modals = Array.from(document.querySelectorAll('.modal-content')); // Obtener todos los modales
            for (const modal of modals) {
                const title = modal.querySelector('#titleSuccess')?.textContent?.trim();
                const message = modal.querySelector('#msjSuccess')?.textContent?.trim();

                // Validar si el modal contiene el texto deseado
                if (title?.includes('Serie no amparada') && message?.includes('La serie no está amparada')) {
                    // Encontrar el botón "Aceptar" dentro del modal
                    const button = modal.querySelector('button.btn.btn-primary');
                    if (button) {
                        button.click(); // Simular clic en el botón "Aceptar"
                        return true; // Retornar éxito
                    }
                }
            }
            return false; // No se encontró el modal correcto
        });

        if (modalFound) {
            console.log("Modal encontrado y botón 'Aceptar' pulsado.");
        } else {
            console.log("No se encontró el modal correcto. No es necesario ocultarlo.");
        }

       // Buscar el botón activo "Siguiente"
        console.log("Buscando el botón 'Siguiente' que está activo...");
        const buttonSelector = 'button.btn.btn-primary[type="submit"]';

        const activeButtonIndex = await page.evaluate((selector) => {
            const buttons = Array.from(document.querySelectorAll(selector));
            const activeButton = buttons.find(button => !button.disabled);
            return buttons.indexOf(activeButton); // Retorna el índice del botón activo
        }, buttonSelector);

        if (activeButtonIndex !== -1) {
            // Usar el índice del botón encontrado para hacer clic
            await page.evaluate((selector, index) => {
                const buttons = document.querySelectorAll(selector);
                buttons[index].click();
            }, buttonSelector, activeButtonIndex);

            console.log("Botón 'Siguiente' activo pulsado.");
        } else {
            throw new Error("No se encontró un botón 'Siguiente' activo.");
        }

        // Seleccionar el valor en el select 'selectMonths'
        console.log(`Buscando el select 'selectMonths' para asignar el valor '${diasCobertura}'...`);
        const selectSelector = 'select#selectMonths';

        await page.waitForSelector(selectSelector, { visible: true });

        // Verificar si el valor existe en el select antes de asignarlo
        const isValuePresent = await page.evaluate((selector, value) => {
            const select = document.querySelector(selector);
            return Array.from(select.options).some(option => option.value === value);
        }, selectSelector, diasCobertura);

        if (isValuePresent) {
            await page.select(selectSelector, diasCobertura); // Asigna el valor al select
            console.log(`Valor '${diasCobertura}' asignado al select 'selectMonths'.`);
        } else {
            console.error(`El valor '${diasCobertura}' no existe en el select 'selectMonths'.`);
            throw new Error(`El valor '${diasCobertura}' no es válido para el select 'selectMonths'.`);
        }
        // Buscar el input 'insuredName' y asignarle el valor
        console.log(`Buscando el input 'insuredName' para asignar el valor '${nombreContacto}'...`);
        const inputSelector = '#insuredName';

        await page.waitForSelector(inputSelector, { visible: true });
        await page.focus(inputSelector); // Enfocar el campo
        await page.click(inputSelector, { clickCount: 3 }); // Seleccionar todo el contenido previo si existe
        await page.keyboard.press('Backspace'); // Limpiar el campo si tiene texto previo

        await page.type(inputSelector, nombreContacto); // Escribir el valor en el input
        console.log(`Valor '${nombreContacto}' asignado al input 'insuredName'.`);

        // Agregar delay después de escribir el valor
        const waitTime = 2000; // 2 segundos de espera
        console.log(`Esperando ${waitTime / 1000} segundos después de asignar el valor...`);
        await delay(waitTime);
        // Selector del formulario y botón específico
        const formSelector = '#formDatosDeCotizacion';
        const submitButtonSelector = `${formSelector} button.btn.btn-primary[type="submit"]`;

        console.log("Buscando el botón 'Siguiente' dentro del formulario 'formDatosDeCotizacion'...");

        await page.waitForSelector(submitButtonSelector, { visible: true });

        // Verificar si el botón está visible y activo
        const buttonClicked = await page.evaluate((selector) => {
            const button = document.querySelector(selector);
            if (button && button.offsetParent !== null && !button.disabled) {
                button.click(); // Simular clic en el botón
                return true;    // Botón encontrado y clic exitoso
            }
            return false;       // No se pudo encontrar o pulsar el botón
        }, submitButtonSelector);

        // Validar el resultado y agregar un delay después del clic
        if (buttonClicked) {
            console.log("Botón 'Siguiente' pulsado exitosamente.");
            const waitTime = 3000; // Tiempo en milisegundos (3 segundos)
            console.log(`Esperando ${waitTime / 1000} segundos antes de continuar...`);
            await delay(waitTime); // Pausar el flujo por el tiempo especificado
        } else {
            throw new Error("No se pudo encontrar o pulsar el botón 'Siguiente' dentro del formulario.");
        }

       // Selector del nuevo elemento 'Editar' que apunta a collapseDatosDeVehiculo
        const editVehiculoSelector = 'span.edit.collapsed[data-toggle="collapse"][data-target="#collapseDatosDeVehiculo"]';

        console.log("Buscando el elemento 'Editar' para 'collapseDatosDeVehiculo'...");

        // Esperar a que el elemento esté visible
        await page.waitForSelector(editVehiculoSelector, { visible: true });

        // Simular clic en el elemento
        await page.click(editVehiculoSelector);
        console.log("Clic simulado en el elemento 'Editar' para 'collapseDatosDeVehiculo'.");

        await delay(waitTime); // Pausar el flujo por el tiempo especificado

        // Selector del botón de 'Siguiente' dentro del formulario
        const submitButtonSelector1 = '#formDatosDeVehiculo button[type="submit"]';

        console.log("Buscando el botón 'Siguiente' para enviar el formulario...");

        // Esperar que el botón esté presente y visible
        await page.waitForSelector(submitButtonSelector1, { visible: true });

        // Simular clic en el botón
        await page.click(submitButtonSelector1);
        console.log("Botón 'Siguiente' pulsado y formulario enviado.");
        
        // Selector del botón de 'Siguiente' dentro del formulario
        const submitButtonSelector2 = '#formDatosDeCotizacion button[type="submit"]';

        console.log("Buscando el botón 'Siguiente' para enviar el formulario...");

        // Esperar que el botón esté presente y visible
        await page.waitForSelector(submitButtonSelector2, { visible: true });

        // Simular clic en el botón
        await page.click(submitButtonSelector2);
        console.log("Botón 'Siguiente' pulsado y formulario enviado.");
         
        await delay(waitTime); // Pausar el flujo por el tiempo especificado

        console.log("Buscando el elemento 'Primer pago' y extrayendo los valores...");

        const paymentValues = await page.evaluate(() => {
            // Buscar el contenedor que contiene el texto 'Primer pago'
            const container = Array.from(document.querySelectorAll('div'))
                .find(div => div.textContent.includes('Primer pago'));

            if (container) {
                // Buscar el elemento <p> que contiene el precio
                const priceElement = container.querySelector('p.h5.text-body');
                if (priceElement) {
                    // Extraer el contenido y separar los valores
                    const text = priceElement.textContent.trim();
                    const [usd, mxn] = text.split('/').map(value => value.trim());
                    return { usd, mxn };
                }
            }
            return { usd: null, mxn: null };
        });

        console.log("Valores extraídos:", paymentValues);

        // Hacer clic en el botón "Siguiente"
        const siguienteButtonSelector = 'button.btn.btn-primary.next';
        await page.waitForSelector(siguienteButtonSelector, { visible: true });
        await page.click(siguienteButtonSelector);

        // Esperar a que los elementos existan en la página
        await page.waitForSelector('#resumenNumCotizacion', { visible: true });
        await page.waitForSelector('#resumenVehiculo', { visible: true });

        // Extraer el Número de Cotización y el Vehículo
        const resumenDatos = await page.evaluate(() => {
            const numCotizacion = document.querySelector('#resumenNumCotizacion')?.textContent?.trim() || '';
            const vehiculo = document.querySelector('#resumenVehiculo')?.textContent?.trim() || '';
            
            return {
                numCotizacion,
                vehiculo
            };
        });

        // Mostrar en consola los resultados
        console.log(`Número de Cotización: ${resumenDatos.numCotizacion}`);
        console.log(`Vehículo: ${resumenDatos.vehiculo}`);

        // Clic en el botón para abrir el modal
        console.log("Abriendo el modal de descarga de PDF...");
        await page.waitForSelector('#descargarPDF', { visible: true });
        await page.click('#descargarPDF');
        await delay(2000); // Esperar a que el modal se abra completamente

        // Extraer los href de los dos botones dentro del modal
        console.log("Extrayendo enlaces de descarga...");

        const pdfLinks = await page.evaluate(() => {
            const links = {};
            const pesosLink = document.querySelector('#descargarPDFTuristaPesos')?.getAttribute('href');
            const dolaresLink = document.querySelector('#descargarPDFTuristaDolares')?.getAttribute('href');

            if (pesosLink) links['Pesos'] = pesosLink;
            if (dolaresLink) links['Dólares'] = dolaresLink;

            return links;
        });

        console.log("Enlaces de descarga extraídos:", pdfLinks);
        //downloadPDFAndSaveToDB(pdfLinks.Pesos, insertedId);
        //downloadPDFAndSaveToDB(pdfLinks.Dólares, insertedId);

        const updateQuery = `
        UPDATE CotizacionesTuristas
        SET
            CostoQualitas = ?,
            VehiculoQualitas = ?,
            idCotQualitas = ?
        WHERE idCot = ?
        `;

        // Valores que deseas actualizar
        const updateValues = [
        JSON.stringify(paymentValues),// Nuevo valor para Precio
        resumenDatos.vehiculo, // Nuevo valor para Vehicle
        resumenDatos.numCotizacion,         // Nuevo valor para Número de Cotización
        insertedId      // ID de la fila a actualizar
        ];
        // Ejecutar el query de actualización
        const [result] = await pool.query(updateQuery, updateValues);

        console.log(`Filas actualizadas: ${result.affectedRows}`);
        
        // Construir la respuesta JSON
        res.status(200).json({
            message: "OK",
            valoresExtraidos: {
                costo: {
                    USD: paymentValues.usd || '0', // Costo en USD
                    MXN: paymentValues.mxn || '0'  // Costo en MXN
                },
                vehiculo: resumenDatos.vehiculo,         // Valor del Vehículo
                cotizacionId: resumenDatos.numCotizacion, // ID de la Cotización
                insertedId: insertedId,
                pdfLinks: pdfLinks                // ID insertado en la base de datos
            }
        });

        // Cerrar el navegador
        await browser.close();
    } catch (error) {
        console.error('Error durante el proceso:', error);
        res.status(500).json({ message: 'Error durante el proceso', error: error.message });
    }
};

export const BotEmisionQualitas = async (req, res) => {
    const { Cotizacion, Emision } = req.body;
    let insertedId; // Declarar la variable fuera del try
    try {
        // Extraer los valores del objeto Cotizacion
        const {
            noSerieNIV,
            valorVehiculoUSD,
            diasCobertura,
            zonaCobertura,
            hibridoElectrico,
            tieneRemolque,
            tipoDeducible,
            edadConductor,
            nombreContacto,
            apellidoContacto,
            emailContacto,
            celularContacto
        } = Cotizacion;

        // Extraer los valores del objeto Emision
        const {
            EdoNacimiento,
            nombreContacto: emisionNombre,
            apellidoContacto: emisionApellido,
            Genero,
            FechaNacimiento,
            RFC,
            CodigoPostal,
            Calle,
            Colonia,
            NoExt,
            NoInt,
            GiroNegocio,
            Placas
        } = Emision;

        // Construir la consulta SQL para inserción en CotizacionesTuristas
        let query = `
            INSERT INTO CotizacionesTuristas (
                noSerieNIV,
                valorVehiculoUSD,
                diasCobertura,
                zonaCobertura,
                hibridoElectrico,
                tieneRemolque,
                tipoDeducible,
                edadConductor,
                nombreContacto,
                apellidoContacto,
                emailContacto,
                celularContacto,
                horaCotizacion
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        // Valores para la inserción
        const values = [
            Cotizacion.noSerieNIV,
            valorVehiculoUSD,
            diasCobertura,
            zonaCobertura,
            hibridoElectrico || 'No',
            tieneRemolque || 'No',
            tipoDeducible,
            edadConductor,
            nombreContacto,
            apellidoContacto,
            emailContacto,
            celularContacto
        ];
        console.log(values);
         
    
            // Ejecutar la consulta
            const [rows] = await pool.query(query, values);
            // Capturar el ID insertado
            insertedId = rows.insertId;
            
            console.log(`ID generado en la inserción: ${insertedId}`);
        } catch (error) {
            // Manejo de errores
            return res.status(500).json({
                message: 'Algo salió mal durante el registro',
                error: error.message
            });
        }
    const agentKey = "53717";
    const account = "MAESTRA";
    const password = "P13L78";

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        // Navegación al portal
        await page.goto('https://agentes360.qualitas.com.mx/web/guest/home', { waitUntil: 'networkidle2' });

        // Inicio de sesión
        await page.type('#_com_liferay_login_web_portlet_LoginPortlet_login', agentKey);
        await page.type('#_com_liferay_login_web_portlet_LoginPortlet_account', account);
        await page.type('#_com_liferay_login_web_portlet_LoginPortlet_password', password);

        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2' })
        ]);

        // Navegación a la página específica
        const specificUrl = 'https://agentes360.qualitas.com.mx/group/guest/nueva-cotizacion';
        await page.goto(specificUrl, { waitUntil: 'networkidle2' });

        // Esperar la sección principal
        await page.waitForSelector('#uso-vehiculo-section', { visible: true });

        // Función auxiliar para alternar opciones
        const toggleOptions = async (firstOption, secondOption) => {
            console.log(`Seleccionando opción: ${firstOption}`);
            await page.click(`label[for="${firstOption}"]`);
            await delay(1000);

            console.log(`Cambiando temporalmente a opción: ${secondOption}`);
            await page.click(`label[for="${secondOption}"]`);
            await delay(1000);

            console.log(`Volviendo a seleccionar opción: ${firstOption}`);
            await page.click(`label[for="${firstOption}"]`);
            await delay(1000);
        };

        // Simular selección para negocio 5
        await toggleOptions('negocio_5_origin', 'negocio_6_origin');

        // Alternar entre 'uso_1_packages' y 'uso_5_packages'
        await toggleOptions('uso_1_packages', 'uso_5_packages');

        // Alternar entre 'uso_1011_vehicle' y 'uso_1051_vehicle'
        await toggleOptions('uso_1011_vehicle', 'uso_1051_vehicle');

        // Verificar si 'uso_1011_vehicle' está seleccionado
        const isUso1011Selected = await page.$eval('#uso_1011_vehicle', el => el.checked);

        if (isUso1011Selected) {
            console.log("El elemento 'uso_1011_vehicle' está seleccionado. Pulsando el botón de submit...");
            await page.click('#buttonOrigenYUso'); // ID del botón de submit
            console.log("Formulario enviado.");
        } else {
            console.log("El elemento 'uso_1011_vehicle' no está seleccionado. No se enviará el formulario.");
            throw new Error("El elemento 'uso_1011_vehicle' no se pudo seleccionar.");
        }

        // Esperar unos segundos para la carga de la siguiente sección
        await delay(3000);

        // Buscar el input con ID "VINTuristas" y escribir el VIN
        console.log("Buscando el input 'VINTuristas' para ingresar el VIN...");
        await page.waitForSelector('#VINTuristas', { visible: true });

        // Escribir el VIN y pulsar Enter
        await page.type('#VINTuristas', Cotizacion.noSerieNIV);
        console.log(`VIN ingresado: ${Cotizacion.noSerieNIV}`);

         // Pulsar Enter
        await page.keyboard.press('Enter');
        console.log("Presionado Enter para buscar el VIN.");
        await delay(3000); // Esperar la carga de los modales

        // Buscar el modal correcto por su contenido
        console.log("Buscando el modal con la palabra 'Serie no amparada'...");
        const modalFound = await page.evaluate(() => {
            const modals = Array.from(document.querySelectorAll('.modal-content')); // Obtener todos los modales
            for (const modal of modals) {
                const title = modal.querySelector('#titleSuccess')?.textContent?.trim();
                const message = modal.querySelector('#msjSuccess')?.textContent?.trim();

                // Validar si el modal contiene el texto deseado
                if (title?.includes('Serie no amparada') && message?.includes('La serie no está amparada')) {
                    // Encontrar el botón "Aceptar" dentro del modal
                    const button = modal.querySelector('button.btn.btn-primary');
                    if (button) {
                        button.click(); // Simular clic en el botón "Aceptar"
                        return true; // Retornar éxito
                    }
                }
            }
            return false; // No se encontró el modal correcto
        });

        if (modalFound) {
            console.log("Modal encontrado y botón 'Aceptar' pulsado.");
        } else {
            console.log("No se encontró el modal correcto. No es necesario ocultarlo.");
        }

       // Buscar el botón activo "Siguiente"
        console.log("Buscando el botón 'Siguiente' que está activo...");
        const buttonSelector = 'button.btn.btn-primary[type="submit"]';

        const activeButtonIndex = await page.evaluate((selector) => {
            const buttons = Array.from(document.querySelectorAll(selector));
            const activeButton = buttons.find(button => !button.disabled);
            return buttons.indexOf(activeButton); // Retorna el índice del botón activo
        }, buttonSelector);

        if (activeButtonIndex !== -1) {
            // Usar el índice del botón encontrado para hacer clic
            await page.evaluate((selector, index) => {
                const buttons = document.querySelectorAll(selector);
                buttons[index].click();
            }, buttonSelector, activeButtonIndex);

            console.log("Botón 'Siguiente' activo pulsado.");
        } else {
            throw new Error("No se encontró un botón 'Siguiente' activo.");
        }

        // Seleccionar el valor en el select 'selectMonths'
        console.log(`Buscando el select 'selectMonths' para asignar el valor '${Cotizacion.diasCobertura}'...`);
        const selectSelector = 'select#selectMonths';

        await page.waitForSelector(selectSelector, { visible: true });

        // Verificar si el valor existe en el select antes de asignarlo
        const isValuePresent = await page.evaluate((selector, value) => {
            const select = document.querySelector(selector);
            return Array.from(select.options).some(option => option.value === value);
        }, selectSelector, Cotizacion.diasCobertura);

        if (isValuePresent) {
            await page.select(selectSelector, Cotizacion.diasCobertura); // Asigna el valor al select
            console.log(`Valor '${Cotizacion.diasCobertura}' asignado al select 'selectMonths'.`);
        } else {
            console.error(`El valor '${Cotizacion.diasCobertura}' no existe en el select 'selectMonths'.`);
            throw new Error(`El valor '${Cotizacion.diasCobertura}' no es válido para el select 'selectMonths'.`);
        }
        // Buscar el input 'insuredName' y asignarle el valor
        console.log(`Buscando el input 'insuredName' para asignar el valor '${Cotizacion.nombreContacto}'...`);
        const inputSelector = '#insuredName';

        await page.waitForSelector(inputSelector, { visible: true });
        await page.focus(inputSelector); // Enfocar el campo
        await page.click(inputSelector, { clickCount: 3 }); // Seleccionar todo el contenido previo si existe
        await page.keyboard.press('Backspace'); // Limpiar el campo si tiene texto previo

        await page.type(inputSelector, Cotizacion.nombreContacto); // Escribir el valor en el input
        console.log(`Valor '${Cotizacion.nombreContacto}' asignado al input 'insuredName'.`);

        // Agregar delay después de escribir el valor
        const waitTime = 2000; // 2 segundos de espera
        console.log(`Esperando ${waitTime / 1000} segundos después de asignar el valor...`);
        await delay(waitTime);
        // Selector del formulario y botón específico
        const formSelector = '#formDatosDeCotizacion';
        const submitButtonSelector = `${formSelector} button.btn.btn-primary[type="submit"]`;

        console.log("Buscando el botón 'Siguiente' dentro del formulario 'formDatosDeCotizacion'...");

        await page.waitForSelector(submitButtonSelector, { visible: true });

        // Verificar si el botón está visible y activo
        const buttonClicked = await page.evaluate((selector) => {
            const button = document.querySelector(selector);
            if (button && button.offsetParent !== null && !button.disabled) {
                button.click(); // Simular clic en el botón
                return true;    // Botón encontrado y clic exitoso
            }
            return false;       // No se pudo encontrar o pulsar el botón
        }, submitButtonSelector);

        // Validar el resultado y agregar un delay después del clic
        if (buttonClicked) {
            console.log("Botón 'Siguiente' pulsado exitosamente.");
            const waitTime = 3000; // Tiempo en milisegundos (3 segundos)
            console.log(`Esperando ${waitTime / 1000} segundos antes de continuar...`);
            await delay(waitTime); // Pausar el flujo por el tiempo especificado
        } else {
            throw new Error("No se pudo encontrar o pulsar el botón 'Siguiente' dentro del formulario.");
        }

       // Selector del nuevo elemento 'Editar' que apunta a collapseDatosDeVehiculo
        const editVehiculoSelector = 'span.edit.collapsed[data-toggle="collapse"][data-target="#collapseDatosDeVehiculo"]';

        console.log("Buscando el elemento 'Editar' para 'collapseDatosDeVehiculo'...");

        // Esperar a que el elemento esté visible
        await page.waitForSelector(editVehiculoSelector, { visible: true });

        // Simular clic en el elemento
        await page.click(editVehiculoSelector);
        console.log("Clic simulado en el elemento 'Editar' para 'collapseDatosDeVehiculo'.");

        await delay(waitTime); // Pausar el flujo por el tiempo especificado

        // Selector del botón de 'Siguiente' dentro del formulario
        const submitButtonSelector1 = '#formDatosDeVehiculo button[type="submit"]';

        console.log("Buscando el botón 'Siguiente' para enviar el formulario...");

        // Esperar que el botón esté presente y visible
        await page.waitForSelector(submitButtonSelector1, { visible: true });

        // Simular clic en el botón
        await page.click(submitButtonSelector1);
        console.log("Botón 'Siguiente' pulsado y formulario enviado.");
        
        // Selector del botón de 'Siguiente' dentro del formulario
        const submitButtonSelector2 = '#formDatosDeCotizacion button[type="submit"]';

        console.log("Buscando el botón 'Siguiente' para enviar el formulario...");

        // Esperar que el botón esté presente y visible
        await page.waitForSelector(submitButtonSelector2, { visible: true });

        // Simular clic en el botón
        await page.click(submitButtonSelector2);
        console.log("Botón 'Siguiente' pulsado y formulario enviado.");
         
        await delay(waitTime); // Pausar el flujo por el tiempo especificado

        console.log("Buscando el elemento 'Primer pago' y extrayendo los valores...");

        const paymentValues = await page.evaluate(() => {
            // Buscar el contenedor que contiene el texto 'Primer pago'
            const container = Array.from(document.querySelectorAll('div'))
                .find(div => div.textContent.includes('Primer pago'));

            if (container) {
                // Buscar el elemento <p> que contiene el precio
                const priceElement = container.querySelector('p.h5.text-body');
                if (priceElement) {
                    // Extraer el contenido y separar los valores
                    const text = priceElement.textContent.trim();
                    const [usd, mxn] = text.split('/').map(value => value.trim());
                    return { usd, mxn };
                }
            }
            return { usd: null, mxn: null };
        });

        console.log("Valores extraídos:", paymentValues);

        // Hacer clic en el botón "Siguiente"
        const siguienteButtonSelector = 'button.btn.btn-primary.next';
        await page.waitForSelector(siguienteButtonSelector, { visible: true });
        await page.click(siguienteButtonSelector);

        // Esperar a que los elementos existan en la página
        await page.waitForSelector('#resumenNumCotizacion', { visible: true });
        await page.waitForSelector('#resumenVehiculo', { visible: true });

        // Extraer el Número de Cotización y el Vehículo
        const resumenDatos = await page.evaluate(() => {
            const numCotizacion = document.querySelector('#resumenNumCotizacion')?.textContent?.trim() || '';
            const vehiculo = document.querySelector('#resumenVehiculo')?.textContent?.trim() || '';
            
            return {
                numCotizacion,
                vehiculo
            };
        });

        // Mostrar en consola los resultados
        console.log(`Número de Cotización: ${resumenDatos.numCotizacion}`);
        console.log(`Vehículo: ${resumenDatos.vehiculo}`);

        // Clic en el botón para abrir el modal
        console.log("Abriendo el modal de descarga de PDF...");
        await page.waitForSelector('#descargarPDF', { visible: true });
        await page.click('#descargarPDF');
        await delay(2000); // Esperar a que el modal se abra completamente

        // Extraer los href de los dos botones dentro del modal
        console.log("Extrayendo enlaces de descarga...");

        const pdfLinks = await page.evaluate(() => {
            const links = {};
            const pesosLink = document.querySelector('#descargarPDFTuristaPesos')?.getAttribute('href');
            const dolaresLink = document.querySelector('#descargarPDFTuristaDolares')?.getAttribute('href');

            if (pesosLink) links['Pesos'] = pesosLink;
            if (dolaresLink) links['Dólares'] = dolaresLink;

            return links;
        });

        console.log("Enlaces de descarga extraídos:", pdfLinks);
        //downloadPDFAndSaveToDB(pdfLinks.Pesos, insertedId);
        //downloadPDFAndSaveToDB(pdfLinks.Dólares, insertedId);

        const updateQuery = `
        UPDATE CotizacionesTuristas
        SET
            CostoQualitas = ?,
            VehiculoQualitas = ?,
            idCotQualitas = ?
        WHERE idCot = ?
        `;

        // Valores que deseas actualizar
        const updateValues = [
        JSON.stringify(paymentValues),// Nuevo valor para Precio
        resumenDatos.vehiculo, // Nuevo valor para Vehicle
        resumenDatos.numCotizacion,         // Nuevo valor para Número de Cotización
        insertedId      // ID de la fila a actualizar
        ];
        // Ejecutar el query de actualización
        const [result] = await pool.query(updateQuery, updateValues);

        console.log(`Filas actualizadas: ${result.affectedRows}`);
        
        // Seleccionar y hacer clic en el botón "Emitir" que abre el modal
        const emitirButtonSelector = 'button.btn.btn-primary[data-target="#modalQuitQuote"]';
        await page.waitForSelector(emitirButtonSelector, { visible: true });
        await page.click(emitirButtonSelector);
        console.log("Botón 'Emitir' clickeado, modal abierto.");

        // Esperar a que el modal esté completamente visible
        const modalSelector = 'div.modal-content.p-4.text-center';
        await page.waitForSelector(modalSelector, { visible: true });
        console.log("Modal visible en pantalla.");

        // Seleccionar y hacer clic en el botón "Sí, continuar"
        const continuarButtonSelector = 'div.modal-content.p-4.text-center button.btn.btn-primary';
        await page.waitForSelector(continuarButtonSelector, { visible: true, timeout: 5000 });

        // Evaluar el clic en el botón "Sí, continuar" directamente
        await page.evaluate((selector) => {
            const button = document.querySelector(selector);
            if (button) {
                button.click();
                console.log("Botón 'Sí, continuar' clickeado.");
            } else {
                throw new Error("No se encontró el botón 'Sí, continuar'.");
            }
        }, continuarButtonSelector);

        console.log("Acción completada: Botón 'Sí, continuar' clickeado.");
        await delay(1000); // Pequeña espera para la acción visual
        
        // Seleccionar "Nuevo" alternando con "Existente"
        await toggleOptions('Nuevo', 'Existente');

        // Esperar que la sección 'Tipo de Persona' esté visible
        console.log("Esperando a que la sección 'Tipo de Persona' esté visible...");
        await page.waitForSelector('#tipoDePersona', { visible: true });

        // Seleccionar "Física" directamente
        console.log("Seleccionando la opción 'Física'...");
        await page.click(`label[for="persona_fisica"]`);
        await delay(1000);

        // Verificar si 'persona_fisica' está seleccionado correctamente
        const isFisicaSelected = await page.$eval('#persona_fisica', el => el.checked);

        if (isFisicaSelected) {
            console.log("La opción 'Física' está seleccionada. Listo para continuar.");
        } else {
            console.log("Error: La opción 'Física' no se pudo seleccionar.");
            throw new Error("La opción 'Física' no se seleccionó correctamente.");
        }

        try {
            await fillAseguradoFisicaForm(page, Emision);
        
            // Pulsar el botón Guardar
            console.log("Pulsando el botón Guardar...");
            await page.click('#saveButton_AseguradoFisica');
            await delay(3000); // Esperar para procesar el guardado
        
            console.log("Formulario enviado con éxito.");
        } catch (error) {
            console.error("Error al rellenar el formulario:", error.message);
        }   
        await delay(3000); // Esperar para procesar el guardado
        
        // Esperar que el modal esté presente y visible
        await page.waitForSelector('section#modalSuccessGe.show', { visible: true });

        // Intentar hacer clic en el botón "Aceptar" si está visible
        const aceptarButtonSelector = 'section#modalSuccessGe div.modal-content button.btn.btn-primary[data-dismiss="modal"]';

        if (await page.$(aceptarButtonSelector)) {
            console.log("Cerrando modal usando el botón 'Aceptar'...");
            await page.click(aceptarButtonSelector);
        } else {
            console.log("Botón 'Aceptar' no encontrado, intentando cerrar con el botón 'Tache'...");
            const closeButtonSelector = 'section#modalSuccessGe div.modal-content button.close[data-dismiss="modal"]';
            await page.click(closeButtonSelector);
        }
            // Esperar 2 segundos (equivalente a page.waitForTimeout(2000))
            await delay(2000);
        try {
            // Esperar a que el modal desaparezca
            await page.waitForSelector('#modalSuccessGe', { hidden: true });
            console.log("Modal cerrado correctamente.");
        
            // Esperar que el botón "Siguiente" esté presente y habilitado
            const nextButtonSelector = '#nextButton_AseguradoFisica';
            await page.waitForSelector(nextButtonSelector, { visible: true });
            console.log("Botón 'Siguiente' encontrado. Haciendo clic...");
        
            // Hacer clic en el botón "Siguiente"
            await page.click(nextButtonSelector);
            console.log("Se hizo clic en el botón 'Siguiente'.");
        
            // Esperar 2 segundos (equivalente a page.waitForTimeout(2000))
            await delay(2000);
        } catch (error) {
            console.error("Error al hacer clic en el botón 'Siguiente':", error.message);
        }
         // Esperar 2 segundos (equivalente a page.waitForTimeout(2000))
         await delay(2000);

         await page.type('#placa', Emision.Placas);
         // Esperar 2 segundos (equivalente a page.waitForTimeout(2000))
         await delay(1000);

         const buttonExists = await page.evaluate(() => {
            return !!document.querySelector('#formPlacas button[type="submit"]');
        });
        console.log("¿Existe el botón en el DOM?:", buttonExists);
         await page.evaluate(() => {
            const button = document.querySelector('#formPlacas button[type="submit"]');
            if (button) {
                button.removeAttribute('disabled'); // Habilita el botón si está deshabilitado
                button.click();
            } else {
                console.error("Botón no encontrado en el DOM.");
            }
        });
        console.log("Clic forzado en el botón 'Siguiente'.");
        
        await delay(1000);
        
        try {
            // Selectores de los radio buttons
            const nuevoContratanteSelector = '#nuevo-contratante';
            const usarDatosAseguradoSelector = '#datos-contratante';
        
            // Selector del botón "Siguiente"
            const nextButtonSelector = '#formDatosDelContratante .useData';
        
            // Esperar a que los radio buttons existan en el DOM
            await page.waitForSelector(nuevoContratanteSelector, { visible: true });
            await page.waitForSelector(usarDatosAseguradoSelector, { visible: true });
        
            // Seleccionar la opción "Nuevo"
            console.log("Seleccionando opción 'Nuevo'...");
            await page.evaluate((selector) => {
                const radioButton = document.querySelector(selector);
                if (radioButton) radioButton.click();
            }, nuevoContratanteSelector);
            console.log("Opción 'Nuevo' seleccionada.");
        
            // Esperar un momento usando delay
            await delay(1000);
        
            // Cambiar a "Usar datos del asegurado"
            console.log("Cambiando a 'Usar datos del asegurado'...");
            await page.evaluate((selector) => {
                const radioButton = document.querySelector(selector);
                if (radioButton) radioButton.click();
            }, usarDatosAseguradoSelector);
            console.log("Opción 'Usar datos del asegurado' seleccionada.");
        
            // Esperar a que se habiliten o actualicen otros elementos usando delay
            await delay(1000);
        
            // Hacer clic en el botón "Siguiente"
            console.log("Haciendo clic en el botón 'Siguiente'...");
            await page.waitForSelector(nextButtonSelector, { visible: true });
            await page.evaluate((selector) => {
                const button = document.querySelector(selector);
                if (button) button.click();
            }, nextButtonSelector);
            console.log("Clic en el botón 'Siguiente' realizado con éxito.");
        } catch (error) {
            console.error("Error al interactuar con el formulario del contratante:", error.message);
        }
        
        try {
            // Función auxiliar para alternar opciones de radio
            const toggleOptions = async (option1, option2) => {
                console.log(`Seleccionando opción: ${option1}...`);
                await page.click(`label[for="${option1}"]`);
                await delay(1000);
        
                console.log(`Cambiando a opción: ${option2}...`);
                await page.click(`label[for="${option2}"]`);
                await delay(1000);
            };
        
            // Seleccionar "Nuevo" y luego "Usar datos del asegurado"
            await toggleOptions('nuevo-contratante', 'datos-contratante');
        
            // Verificar que la selección se ha realizado
            console.log("Confirmando que 'Usar datos del asegurado' está seleccionado...");
            const isChecked = await page.evaluate(() => {
                return document.querySelector('#datos-contratante').checked;
            });
            if (isChecked) {
                console.log("'Usar datos del asegurado' seleccionado correctamente.");
            } else {
                console.log("Error: No se seleccionó 'Usar datos del asegurado'.");
            }
        
            // Seleccionar "Física" en el siguiente paso
            console.log("Seleccionando la opción 'Mismos datos'...");
            await page.waitForSelector('label[for="datos-contratante"]', { visible: true });
            await page.click('label[for="datos-contratante"]');
            await delay(1000);
        
            // Hacer clic en el botón "Siguiente"
            console.log("Haciendo clic en el botón 'Siguiente'...");
            await page.waitForSelector('.useData', { visible: true });
            await page.click('.useData');
            console.log("Formulario enviado correctamente.");
        } catch (error) {
            console.error("Error al interactuar con el formulario:", error.message);
        }
            await delay(1000);
            try {
                // Esperar que el formulario esté visible
                console.log("Esperando a que el formulario 'formVigencia' esté disponible...");
                await page.waitForSelector('#formVigencia', { visible: true });
            
                // Asegurar que el botón "Siguiente" sea visible
                console.log("Esperando a que el botón 'Siguiente' esté visible...");
                await page.waitForSelector('#btnVigencia', { visible: true });
            
                // Desplazarse al botón "Siguiente"
                console.log("Desplazando al botón 'Siguiente'...");
                await page.evaluate(() => {
                    const btn = document.querySelector('#btnVigencia');
                    if (btn) btn.scrollIntoView({ behavior: "smooth", block: "center" });
                });
                await delay(500); // Usar la función delay para esperar un poco después del scroll
            
                // Hacer clic en el botón "Siguiente"
                console.log("Haciendo clic en el botón 'Siguiente'...");
                await page.click('#btnVigencia');
            
                console.log("Botón 'Siguiente' pulsado correctamente.");
            } catch (error) {
                console.error("Error al pulsar el botón 'Siguiente' en el formulario de vigencia:", error.message);
            }
            try {
                // Esperar que el botón "Emitir" esté disponible y visible
                console.log("Esperando a que el botón 'Emitir' esté disponible...");
                await page.waitForSelector('#btnEmision', { visible: true });
            
                // Desplazarse al botón "Emitir" para asegurarse de que sea clicable
                console.log("Desplazando al botón 'Emitir'...");
                await page.evaluate(() => {
                    const btn = document.querySelector('#btnEmision');
                    if (btn) btn.scrollIntoView({ behavior: "smooth", block: "center" });
                });
                await delay(500); // Espera breve después del scroll
            
                // Hacer clic en el botón "Emitir"
                console.log("Haciendo clic en el botón 'Emitir'...");
                await page.click('#btnEmision');
            
                console.log("Botón 'Emitir' pulsado correctamente.");
            } catch (error) {
                console.error("Error al pulsar el botón 'Emitir':", error.message);
            }

            await delay(1000);
            
            try {
                console.log("Iniciando alternancia entre métodos de pago...");
            
                // Función auxiliar para seleccionar opciones
                const selectPaymentOption = async (optionLabel) => {
                    console.log(`Cambiando a '${optionLabel}'...`);
                    const selector = `label[for="${optionLabel}"] input`;
            
                    await page.waitForSelector(selector, { visible: true });
                    await page.evaluate((selector) => {
                        document.querySelector(selector).scrollIntoView({ behavior: "smooth", block: "center" });
                    }, selector);
                    await delay(500); // Pequeño delay
            
                    // Intentar forzar el clic
                    await page.click(selector, { delay: 100 });
                };
            
                // Alternar entre opciones varias veces
                await selectPaymentOption('efectivo');
                await delay(1000);
            
                await selectPaymentOption('pago-linea');
                await delay(1000);
            
                await selectPaymentOption('efectivo');
                await delay(1000);
            
                await selectPaymentOption('pago-linea');
                console.log("Método de pago final: 'Pagar en línea' seleccionado.");
            
                // Confirmar selección final
                const isSelected = await page.$eval('#pago-linea', (el) => el.checked);
                if (isSelected) {
                    console.log("Confirmación exitosa: 'Pagar en línea' está seleccionado.");
                } else {
                    throw new Error("No se pudo seleccionar 'Pagar en línea'.");
                }
            
                // Pulsar el botón "Siguiente"
                const nextButtonSelector = '#btnMetodoPago';
                console.log("Desplazando y pulsando el botón 'Siguiente'...");
                await page.waitForSelector(nextButtonSelector, { visible: true });
                await page.evaluate((selector) => {
                    document.querySelector(selector).scrollIntoView({ behavior: "smooth", block: "center" });
                }, nextButtonSelector);
                await delay(500);
                await page.click(nextButtonSelector);
                console.log("Botón 'Siguiente' pulsado correctamente.");
            
            } catch (error) {
                console.error("Error durante el proceso de alternancia de métodos de pago:", error.message);
            }            
            
              
        // Cerrar el navegador
        //await browser.close();
    } catch (error) {
        console.error('Error durante el proceso:', error);
        res.status(500).json({ message: 'Error durante el proceso', error: error.message });
    }
};

const toggleOptions = async (firstOption, secondOption) => {
    console.log(`Seleccionando opción: ${firstOption}`);
    await page.click(`label[for="${firstOption}"]`);
    await delay(1000);

    console.log(`Cambiando temporalmente a opción: ${secondOption}`);
    await page.click(`label[for="${secondOption}"]`);
    await delay(1000);

    console.log(`Volviendo a seleccionar opción: ${firstOption}`);
    await page.click(`label[for="${firstOption}"]`);
    await delay(1000);
};

export const downloadPDFAndSaveToDB = async (pdfUrl, insertedId) => {
    try {
        console.log(`Iniciando descarga del PDF desde: ${pdfUrl}`);

        // 1. Descargar el PDF usando axios como un arraybuffer
        const response = await axios.get(pdfUrl, {
            responseType: 'arraybuffer' // Para recibir la respuesta en binario
        });

        // 2. Convertir el buffer a Base64
        const pdfBase64 = Buffer.from(response.data, 'binary').toString('base64');
        console.log("PDF descargado y convertido a Base64 correctamente.");

        // 3. Actualizar el PDF en la base de datos
        const updateQuery = `
            UPDATE CotizacionesTuristas
            SET documentoPDF1 = ?
            WHERE id = ?
        `;
        const [result] = await pool.query(updateQuery, [pdfBase64, insertedId]);

        console.log(`Filas actualizadas: ${result.affectedRows}`);

        // 4. Retornar resultado
        return {
            success: true,
            message: "PDF descargado y guardado en Base64 correctamente",
            pdfSize: response.data.byteLength, // Tamaño del PDF
            affectedRows: result.affectedRows
        };
    } catch (error) {
        console.error("Error al descargar o guardar el PDF:", error.message);
        return {
            success: false,
            message: "Error al descargar o guardar el PDF",
            error: error.message
        };
    }
};

// Función para rellenar el formulario con datos del body
const fillAseguradoFisicaForm = async (page, emision) => {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    console.log("Rellenando formulario 'Asegurado Física'...");

    // Llenar Estado de Nacimiento
if (emision.EdoNacimiento) {
    console.log(`Seleccionando estado de nacimiento: ${emision.EdoNacimiento}`);
    await page.waitForSelector('#selectState', { visible: true });

    // Verificar si el valor existe en las opciones
    const estadoExiste = await page.evaluate((selector, value) => {
        const select = document.querySelector(selector);
        return Array.from(select.options).some(option => option.value === value);
    }, '#selectState', emision.EdoNacimiento);

    if (estadoExiste) {
        await page.select('#selectState', emision.EdoNacimiento);
        console.log(`Estado seleccionado correctamente: ${emision.EdoNacimiento}`);
    } else {
        console.error(`El valor ${emision.EdoNacimiento} no existe en las opciones del select`);
    }
    }

    // Llenar Nombre
    if (emision.nombreContacto) {
        console.log(`Escribiendo nombre: ${emision.nombreContacto}`);
        await page.type('#name', emision.nombreContacto);
    }

    // Llenar Apellido Paterno
    if (emision.apellidoContacto) {
        console.log(`Escribiendo apellido paterno: ${emision.apellidoContacto}`);
        await page.type('#lastName', emision.apellidoContacto);
    }

    // Llenar Género
    if (emision.Genero) {
        const generoValue = emision.Genero.toUpperCase() === 'MASCULINO' ? 'MASCULINO' : 'FEMENINO';
        console.log(`Seleccionando género: ${generoValue}`);
        await page.select('#selectSex', generoValue);
    }

    // Llenar Fecha de Nacimiento
    if (emision.FechaNacimiento) {
        console.log(`Escribiendo fecha de nacimiento: ${emision.FechaNacimiento}`);
        await page.type('#dateOfBirth', emision.FechaNacimiento);
    }

    // Llenar RFC
    if (emision.RFC) {
        await page.waitForSelector('#RFC', { visible: true });
        await page.focus('#RFC');
        await page.click('#RFC', { clickCount: 3 });
        await page.keyboard.press('Backspace');
        await page.type('#RFC', emision.RFC);
    }

    // Llenar Código Postal y esperar a que llene automáticamente
    if (emision.CodigoPostal) {
        console.log(`Escribiendo Código Postal: ${emision.CodigoPostal}`);
        await page.type('#postalCode', emision.CodigoPostal);
        await page.keyboard.press('Enter');
        await delay(2000); // Espera para que la ciudad y el estado se llenen automáticamente
    }

    // Llenar Calle
    if (emision.Calle) {
        console.log(`Escribiendo Calle: ${emision.Calle}`);
        await page.type('#street', emision.Calle);
    }

    // Llenar Número Exterior
    if (emision.NoExt) {
        console.log(`Escribiendo Número Exterior: ${emision.NoExt}`);
        await page.type('#outdoorNumber', emision.NoExt);
    }

    // Llenar Número Interior (opcional)
    if (emision.NoInt) {
        console.log(`Escribiendo Número Interior: ${emision.NoInt}`);
        await page.type('#interiorNumber', emision.NoInt);
    }

    // Llenar Giro de Negocio
    if (emision.GiroNegocio) {
        console.log(`Seleccionando Giro de Negocio: ${emision.GiroNegocio}`);
        await page.select('#selectBusiness', '0001'); // Ejemplo: Si siempre es "Financiero"
    }

    console.log("Formulario 'Asegurado Física' rellenado exitosamente.");
};

// Funciones Espejo para SSL

export const EspejoQualitas = async (req, res) => {
    try {
        // Extraer datos del body
        const {  
            noSerieNIV,
            valorVehiculoUSD,
            diasCobertura,
            zonaCobertura,
            hibridoElectrico,
            tieneRemolque,
            tipoDeducible,
            edadConductor,
            nombreContacto,
            apellidoContacto,
            emailContacto,
            celularContacto
        } = req.body;

        // URL del endpoint externo
        const url = "http://34.46.77.143:3001/Cotizar/QualitasBot";

        // Datos para el POST
        const data = {
            noSerieNIV: noSerieNIV,
            valorVehiculoUSD: valorVehiculoUSD, // Aquí toma el valor correcto del body
            diasCobertura: diasCobertura,
            zonaCobertura: zonaCobertura,
            hibridoElectrico: hibridoElectrico,
            tieneRemolque: tieneRemolque,
            tipoDeducible: tipoDeducible,
            edadConductor: edadConductor,
            nombreContacto: nombreContacto,
            apellidoContacto: apellidoContacto,
            emailContacto: emailContacto,
            celularContacto: celularContacto
        };

        // Hacer la solicitud al endpoint externo
        const response = await axios.post(url, data, {
            headers: { "Content-Type": "application/json" }
        });

        // Enviar la respuesta del servidor externo al cliente
        res.status(200).json({
            success: true,
            message: "Datos enviados y procesados correctamente.",
            data: response.data // Respuesta del endpoint externo
        });

    } catch (error) {
        console.error("Error al consumir el endpoint:", error.message);

        // Manejar errores y enviar respuesta al cliente
        res.status(500).json({
            success: false,
            message: "Error al consumir el endpoint externo.",
            error: error.message
        });
    }
};

export const EspejoChubb = async (req, res) => {
    try {
        // Extraer datos del body
        const {  
            noSerieNIV,
            valorVehiculoUSD,
            diasCobertura,
            zonaCobertura,
            hibridoElectrico,
            tieneRemolque,
            tipoDeducible,
            edadConductor,
            nombreContacto,
            apellidoContacto,
            emailContacto,
            celularContacto
        } = req.body;

        // URL del endpoint externo
        const url = "http://34.46.77.143:3001/Cotizar/QualitasBot";

        // Datos para el POST
        const data = {
            noSerieNIV: noSerieNIV,
            valorVehiculoUSD: valorVehiculoUSD, // Aquí toma el valor correcto del body
            diasCobertura: diasCobertura,
            zonaCobertura: zonaCobertura,
            hibridoElectrico: hibridoElectrico,
            tieneRemolque: tieneRemolque,
            tipoDeducible: tipoDeducible,
            edadConductor: edadConductor,
            nombreContacto: nombreContacto,
            apellidoContacto: apellidoContacto,
            emailContacto: emailContacto,
            celularContacto: celularContacto
        };

        // Hacer la solicitud al endpoint externo
        const response = await axios.post(url, data, {
            headers: { "Content-Type": "application/json" }
        });

        // Enviar la respuesta del servidor externo al cliente
        res.status(200).json({
            success: true,
            message: "Datos enviados y procesados correctamente.",
            data: response.data // Respuesta del endpoint externo
        });

    } catch (error) {
        console.error("Error al consumir el endpoint:", error.message);

        // Manejar errores y enviar respuesta al cliente
        res.status(500).json({
            success: false,
            message: "Error al consumir el endpoint externo.",
            error: error.message
        });
    }
};

export const BotcotizacionChubbExperto = async (req, res) => {
  /*   const  { days, vehicleTypeId, vehicleValue, hybrid, under21 }  = req.body;

    try {
        const browser = await chromium.launch({
            headless: false, 
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.goto('https://chubbcrossborder.com/chubb/agencyPage.php?ac=ADMEXPERTOINS&pr=SB', { waitUntil: 'domcontentloaded' });
        console.log('✅ Página cargada correctamente.');

        await page.waitForSelector('iframe#frameContenido', { timeout: 15000 });
        const frameHandle = await page.$('iframe#frameContenido');
        const frame = await frameHandle.contentFrame();
        if (!frame) throw new Error("❌ No se pudo acceder al iframe.");
        console.log("✅ Se accedió al iframe correctamente.");
        console.log(days)
        await frame.selectOption('select#days', days);
        console.log('✅ Se seleccionó "90 días".');

        await frame.waitForSelector('select#territory', { timeout: 10000 });
        await frame.selectOption('select#territory', '2');
        console.log('✅ Se seleccionó "Baja California, Baja California Sur & Sonora".');
        await frame.waitForTimeout(1000);
        await frame.selectOption('select#territory', '1');
        console.log('✅ Se seleccionó "All Mexico".');
        await frame.waitForTimeout(3000);

        await frame.selectOption('select#vehicleTypeId', vehicleTypeId);
        console.log('✅ Se seleccionó "Tipo de vehículo 2".');

        await frame.selectOption('select#vehicleValue', vehicleValue);
        console.log('✅ Se seleccionó "Valor del vehículo: 5000".');

        // ✅ Selección del botón "Next" asegurando que no sea "Close"
        const buttons = await frame.$$('a.btn');
        let nextButton = null;

        for (const btn of buttons) {
            const text = await frame.evaluate(el => el.innerText, btn);
            if (text.trim() === 'Next') {
                nextButton = btn;
                break;
            }
        }

        if (nextButton) {
            await nextButton.click();
            console.log("✅ Se hizo clic en el botón 'Next'.");
        } else {
            throw new Error("❌ No se encontró el botón 'Next'.");
        }

        await frame.waitForSelector('#cotizando', { timeout: 10000 });
        console.log("✅ Tabla de cotización detectada.");

        // ✅ Obtención del número de cotización desde el `span#numCotiza`
        await frame.waitForSelector('span#numCotiza', { timeout: 5000 });
        const quotationText = await frame.$eval('span#numCotiza', el => el.innerText);
        const quotationNumberMatch = quotationText.match(/(\d+)/);
        const quotationNumber = quotationNumberMatch ? quotationNumberMatch[1] : 'No encontrado';
        console.log("✅ Número de cotización:", quotationNumber);

        // ✅ Formatear la tabla correctamente
        const tableData = await frame.evaluate(() => {
            const table = document.querySelector('#cotizando table');
            if (!table) return null;

            const rows = table.querySelectorAll('tr');
            const headers = Array.from(rows[0].querySelectorAll('th')).map(th => th.innerText.trim());

            let data = [];
            rows.forEach((row, index) => {
                if (index === 0) return;
                const cells = Array.from(row.querySelectorAll('td'));
                if (cells.length > 0) {
                    let rowData = {};
                    rowData['Policy Period'] = cells[0].innerText.trim();
                    headers.slice(1).forEach((header, i) => {
                        rowData[header] = cells[i + 1]?.innerText.trim() || '';
                    });
                    data.push(rowData);
                }
            });

            return data;
        });

        await browser.close();
        res.json({ 
            message: 'Scraping completado', 
            quotationNumber: quotationNumber, 
            table: tableData 
        });

    } catch (error) {
        console.error('❌ Error en el scraping:', error);
        res.status(500).json({ message: 'Error en scraping', error: error.message });
    } */
};








