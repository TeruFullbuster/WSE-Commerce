import e from 'cors';
import { pool } from '../db.js'
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import puppeteer from 'puppeteer';
import xmlbuilder from 'xmlbuilder';
import { chromium } from 'playwright';

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

export const BotcotizacionQualitas = async (req, res) => {
    const { VIN, Days, insuredName } = req.body; // Recibe el VIN del body
    const agentKey = "84886";
    const account = "MAESTRA";
    const password = "IWZ332";

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
        await page.type('#VINTuristas', VIN);
        console.log(`VIN ingresado: ${VIN}`);

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
        console.log(`Buscando el select 'selectMonths' para asignar el valor '${Days}'...`);
        const selectSelector = 'select#selectMonths';

        await page.waitForSelector(selectSelector, { visible: true });

        // Verificar si el valor existe en el select antes de asignarlo
        const isValuePresent = await page.evaluate((selector, value) => {
            const select = document.querySelector(selector);
            return Array.from(select.options).some(option => option.value === value);
        }, selectSelector, Days);

        if (isValuePresent) {
            await page.select(selectSelector, Days); // Asigna el valor al select
            console.log(`Valor '${Days}' asignado al select 'selectMonths'.`);
        } else {
            console.error(`El valor '${Days}' no existe en el select 'selectMonths'.`);
            throw new Error(`El valor '${Days}' no es válido para el select 'selectMonths'.`);
        }
        // Buscar el input 'insuredName' y asignarle el valor
        console.log(`Buscando el input 'insuredName' para asignar el valor '${insuredName}'...`);
        const inputSelector = '#insuredName';

        await page.waitForSelector(inputSelector, { visible: true });
        await page.focus(inputSelector); // Enfocar el campo
        await page.click(inputSelector, { clickCount: 3 }); // Seleccionar todo el contenido previo si existe
        await page.keyboard.press('Backspace'); // Limpiar el campo si tiene texto previo

        await page.type(inputSelector, insuredName); // Escribir el valor en el input
        console.log(`Valor '${insuredName}' asignado al input 'insuredName'.`);

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

        // Cerrar el navegador
        await browser.close();

        res.status(200).json({ message: 'VIN ingresado y búsqueda completada exitosamente' });
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

export const BotcotizacionQualitasCopy = async (req, res) => {
    const { VIN, Days, insuredName } = req.body;
    const agentKey = "84886";
    const account = "MAESTRA";
    const password = "IWZ332";

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    try {
        const browser = await chromium.launch({ headless: false });
        const page = await browser.newPage();
        await page.setViewportSize({ width: 1280, height: 800 });

        // Navegación al portal
        await page.goto('https://agentes360.qualitas.com.mx/web/guest/home', { waitUntil: 'networkidle' });

        // Inicio de sesión
        await page.fill('#_com_liferay_login_web_portlet_LoginPortlet_login', agentKey);
        await page.fill('#_com_liferay_login_web_portlet_LoginPortlet_account', account);
        await page.fill('#_com_liferay_login_web_portlet_LoginPortlet_password', password);

        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForLoadState('networkidle')
        ]);

        // Navegación a la página específica
        await page.goto('https://agentes360.qualitas.com.mx/group/guest/nueva-cotizacion', { waitUntil: 'networkidle' });

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
        const isUso1011Selected = await page.isChecked('#uso_1011_vehicle');

        if (isUso1011Selected) {
            console.log("El elemento 'uso_1011_vehicle' está seleccionado. Pulsando el botón de submit...");
            await page.click('#buttonOrigenYUso');
            console.log("Formulario enviado.");
        } else {
            console.log("El elemento 'uso_1011_vehicle' no está seleccionado. No se enviará el formulario.");
            throw new Error("El elemento 'uso_1011_vehicle' no se pudo seleccionar.");
        }

        // Rellenar formulario de búsqueda
        console.log("Rellenando VIN...");
        await page.fill('#VINTuristas', VIN);
        await page.press('#VINTuristas', 'Enter');
        await delay(2000);

        // Buscar y pulsar 'Siguiente'
        console.log("Pulsando 'Siguiente'...");
        await page.click('button.btn.btn-primary[type="submit"]', { timeout: 5000 });
        await delay(3000);

        // Asignar valor al select de 'Days'
        console.log(`Seleccionando valor '${Days}' en 'selectMonths`);
        await page.selectOption('#selectMonths', Days);
        await delay(1000);

        // Asignar insuredName
        console.log("Rellenando insuredName...");
        await page.fill('#insuredName', insuredName);
        await delay(1000);

        // Pulsar 'Siguiente'
        console.log("Confirmando el formulario...");
        await page.click('button.btn.btn-primary[type="submit"]');
        await delay(3000);

        // Extraer 'Primer Pago'
        console.log("Extrayendo valores de 'Primer Pago'...");
        const paymentValues = await page.locator('text=Primer pago').locator('xpath=../..').locator('p.h5.text-body').innerText();
        const [usd, mxn] = paymentValues.split('/').map(value => value.trim());

        console.log("Valores extraídos:", { usd, mxn });
        await browser.close();

        res.status(200).json({ message: 'VIN ingresado y búsqueda completada exitosamente', paymentValues: { usd, mxn } });
    } catch (error) {
        console.error('Error durante el proceso:', error);
        res.status(500).json({ message: 'Error durante el proceso', error: error.message });
    }
};


