import OpenAI from "openai";
import pdfParse from "pdf-parse";

import { pool } from "../db.js"; // Tu conexión a la base de datos

import { OPENAI_API_KEY } from "../config.js"; // Asegúrate que esta ruta es la correcta

// Configuración de OpenAI
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

// 👉 Formatear fecha de texto tipo "12 ene 2024" a "2024-01-12 00:00:00"
function formatFecha(fecha) {
  if (!fecha) return null;
  const meses = {
    "ene": "01", "feb": "02", "mar": "03", "abr": "04", "may": "05", "jun": "06",
    "jul": "07", "ago": "08", "sep": "09", "oct": "10", "nov": "11", "dic": "12"
  };
  const parts = fecha.toLowerCase().split(/[-/\s]/);
  if (parts.length === 3) {
    let [dia, mes, año] = parts;
    mes = meses[mes] || mes;
    if (!isNaN(dia) && !isNaN(mes) && !isNaN(año)) {
      return `${año}-${mes}-${dia} 00:00:00`;
    }
  }
  return null;
}

// 👉 Extraer JSON desde respuesta GPT
function extractJSONFromString(responseText) {
  try {
    const jsonMatch = responseText.match(/```json([\s\S]*?)```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1].trim());
    }

    // fallback si no está delimitado con markdown
    const start = responseText.indexOf("{");
    const end = responseText.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      const jsonText = responseText.slice(start, end + 1);
      return JSON.parse(jsonText);
    }

    throw new Error("No se encontró JSON válido en la respuesta.");
  } catch (error) {
    console.error("❌ Error al extraer JSON:", error);
    throw new Error("Formato de respuesta incorrecto.");
  }
}

// 👉 Formatear montos a número
const formatMoney = (valor) => {
  if (!valor || typeof valor !== "string") return null;
  let cleanValue = valor.replace(/[^0-9.]/g, "");
  let parsedValue = parseFloat(cleanValue);
  return isNaN(parsedValue) ? null : parsedValue;
};

// 👉 Función principal OCR con pdf-parse
export const OCRGPT = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se ha proporcionado un documento PDF." });
    }
    console.log('Ejecutando...')
    // 📄 Leer el texto del PDF con pdf-parse
    const pdfData = await pdfParse(req.file.buffer);
    const textoPlano = pdfData.text;

    // 🧠 Enviar a GPT-4-Turbo el texto como input
    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Eres un sistema de OCR avanzado. Extrae los datos del documento." },
        { role: "user", content: `${PromptOCR}\n\nTexto del documento:\n${textoPlano}` }
      ],
      max_tokens: 2000
    });

    const responseContent = gptResponse.choices[0].message?.content;
    console.log("🧠 GPT Response Content:");
    console.log(responseContent);

    const extractedData = extractJSONFromString(responseContent);

    // 🔄 Formatear campos
    extractedData.FechaVigenciaInicio = formatFecha(extractedData.FechaVigenciaInicio);
    extractedData.FechaVigenciaFin = formatFecha(extractedData.FechaVigenciaFin);
    extractedData.FechaEmision = formatFecha(extractedData.FechaEmision);
    extractedData.PrimaTotal = formatMoney(extractedData.PrimaTotal);
    extractedData.PrimaNeta = formatMoney(extractedData.PrimaNeta);

    res.status(200).json({
      message: "Datos extraídos y guardados correctamente",
      datos: extractedData
    });

  } catch (error) {
    console.error("❌ Error procesando OCR:", error);
    res.status(500).json({
      message: "Error al procesar la póliza",
      error: error.message
    });
  }
};

// 🔹 **Prompt de OCR** (instrucciones para GPT)
const PromptOCR = `
Eres un sistema de OCR avanzado diseñado para analizar documentos escaneados de pólizas de seguro y extraer información estructurada en formato JSON.

Tu tarea es escanear el documento proporcionado y recuperar la información más completa posible, adaptándote a distintos formatos y estructuras.

---

## **Instrucciones Generales**
1. **Flexibilidad en la extracción**  
   - La ubicación de los datos puede variar según la estructura del documento.  
   - Si un campo no está presente en el documento, inclúyelo en el JSON con valor "" (cadena vacía).  

2. **Formato estandarizado de salida**  
   - **Fechas:** "DD/MM/AAAA" (ejemplo: "24/02/2025").  
   - **Montos:** Usar dos decimales y separador de miles con coma ("12,441.67").  
   - **Corrección de texto:** Eliminar caracteres especiales, espacios innecesarios o saltos de línea.  

3. **Diferenciación entre Póliza y Endoso**  
   - Si el documento menciona “Endoso”, “Modificación” o términos similares, indicar ""Endoso": "Sí"" en el JSON.  

4. **Identificación del tipo de póliza**  
   - Si la póliza comienza con **UAA, UBI, GAM, UBH**, pertenece a **tipo D**.  
   - Se debe clasificar cada póliza en una de las siguientes categorías: **GMM, Autos, Daños, Vida**.  

---

🔹 Campos a Extraer (Todos los Ramos)
📌 Datos Generales (Aplica para todos los tipos de pólizas)
NombreContratante → Nombre del asegurado o empresa que contrata la póliza.
RazonSocial → Razón social en caso de ser persona moral.
NoPoliza → Número de póliza del documento.
Inciso → Número de identificación de la póliza dentro de una serie (si aplica).
RFC → Registro Federal de Contribuyentes (puede ser de persona física o moral).
CURP → Identificador único para personas físicas en México (si aplica).
FechaVigenciaInicio → Fecha de inicio de vigencia de la póliza (DD/MM/AAAA).
FechaVigenciaFin → Fecha de vencimiento de la póliza (DD/MM/AAAA).
FechaEmision → Fecha de emisión de la póliza (DD/MM/AAAA).
PrimaTotal → Monto total de la prima del seguro.
PrimaNeta → Monto de la prima sin impuestos ni recargos.
DerechoPoliza → Costo de emisión de la póliza.
%Recargo → Porcentaje de recargos aplicados. *Debe ser el valor plano sin el simbolo de porcentaje.
Recargos → Monto de recargos aplicados.
%IVA → Porcentaje del IVA aplicado. *Debe ser el valor plano sin el simbolo de porcentaje.
IVA → Monto del IVA aplicado.
Endoso → Indica si el documento es un Endoso o una Póliza.
ClasificacionDocumento → Tipo de documento (Póliza, Endoso, Cancelación, etc.).
Direccion:
Calle
NumeroExterior
NumeroInterior
Colonia
Ciudad
CodigoPostal
Estado
Pais
NumeroCelular → Número de contacto del asegurado o contratante.
Correo → Correo electrónico del asegurado o contratante.
Ramo → Tipo de seguro contratado (Autos, Vida, GMM, Daños, etc.).
SubRamo → Categoría específica dentro del ramo de seguros.
ClaveAgente → Número de identificación del agente.
NombreAgente → Nombre completo del agente de seguros.
FormaPago → Método de pago utilizado (Tarjeta de Crédito, Transferencia, Domiciliado, etc.).
TipoPago → Frecuencia de pago (Mensual, Trimestral, Anual, etc.).
Moneda → Tipo de moneda utilizada en la póliza (MXN, USD, EUR).
📌 Datos Administrativos y Comerciales
Grupo → Categoría del asegurado dentro de la empresa.
Subgrupo → Clasificación adicional dentro del grupo.
Ejecutivo → Nombre del ejecutivo que gestionó la póliza.
ConductoCobro → Medio por el cual se realiza el pago.
TipoVenta → Si es una póliza nueva, renovación o venta especial.
Vendedor → Nombre del vendedor de la póliza.
Despacho → Nombre del despacho que gestionó la venta.
Gerencia → Área administrativa a la que pertenece la póliza.
LineaNegocio → Tipo de negocio al que pertenece la póliza.
CoberturaPlan → Nombre del plan contratado.
📌 Fechas Relevantes
FechaAntiguedad → Fecha en la que el asegurado se registró con la aseguradora.
FechaSolicitud → Fecha en la que se solicitó la póliza.
FechaEnvio → Fecha en la que la aseguradora envió la póliza.
FechaRecepcion → Fecha en la que el asegurado recibió la póliza.
FechaEntrega → Fecha de entrega de la póliza.
FechaConversion → Fecha en la que se realizó una conversión en la póliza.
📌 Datos Específicos por Tipo de Póliza
🔹 Pólizas de GMM (Gastos Médicos Mayores)
ApellidoPaterno, ApellidoMaterno, Nombres
Entidad → Estado donde reside el asegurado.
Sexo → Género del asegurado.
FechaNacimiento → Fecha de nacimiento (DD/MM/AAAA).
NumeroEmpleado → Número de empleado en caso de póliza empresarial.
Telefono1a, Telefono2a, Telefono3a
EstatusCobro → Estado de pago de la póliza (Pagado, Pendiente, etc.).
🔹 Pólizas de Autos
Marca → Marca del vehículo asegurado.
Modelo → Año del modelo del vehículo.
DescripcionVehiculo → Tipo de vehículo (Sedán, SUV, etc.).
NumeroSerie → Número de serie (VIN) del vehículo.
NumeroMotor → Número de motor del vehículo.
Placas → Matrícula del vehículo.
TipoServicio → Servicio del vehículo (Particular, Público, etc.).
UsoVehiculo → Uso que se le dará al vehículo (Personal, Comercial, etc.).
NumeroTarjeta → Número de tarjeta asociada al pago de la póliza (si aplica).
NumeroCuentaCLABE → CLABE de la cuenta de pago (si aplica).
🔹 Pólizas de Daños
TipoCobertura → Ejemplo: Hogar, Comercio, Industrial.
MontoAsegurado → Valor asegurado del inmueble.
UsoInmueble → Residencial, Comercial, Industrial, etc.
🔹 Pólizas de Vida
Beneficiarios → Lista de beneficiarios con su porcentaje asignado. *Debe ser el valor plano sin el simbolo de porcentaje.
TipoSeguroVida → Tradicional, Universal, Ahorro, etc.
SumaAsegurada → Monto asegurado en la póliza.
PlazoSeguro → Años de duración de la póliza.

## **Reglas Específicas por Tipo de Póliza**

### **1️⃣ Pólizas de GMM**
Si el documento pertenece a **GMM**, incluir:
- **APELLIDO PATERNO**, **ApellidoMaterno**, **Nombres**, **RazonSocial**  
- **Entidad**, **Sexo**, **FecNac**, **C.U.R.P.**, **NEmpleado**  
- **Teléfonos**: **Telefono1a**, **Telefono2a**, **Telefono3a**  
- **Fechas relevantes**: **FechadeAntiguedad, Desde, Hasta, FechadeSolicitud, FechadeEnvio, FechadeRecepcion, FechadeEntrega, FechaConversion**  
- **Datos financieros**: **PrimaNeta, Derecho de Poliza, % Recargo, Recargos, % I.V.A., I.V.A., PrimaTotal**  
- **Clasificación**: **Agente, Forma de Pago, Tipo de Pago, Moneda, SubRamo, Ejecutivo, Conducto de Cobro, RENOVACION, Tipo de Venta, Grupo, Subgrupo, VENDEDOR, DESPACHO, GERENCIA, LINEA DE NEGOCIO, CoberturaPlan**  

Ejemplo de póliza de **GMM**:

DIR METRO SUR	FLORIDA	FLORIDA	AGENTES	57999	ARMANDO CERVANTES CRUZ	11710S00	Sin Dato	VALADEZ GRAHAM SANTIAGO	04-may-24	04-nov-24	GMI

2️⃣ Pólizas de Autos
Si el documento pertenece a Autos, incluir:

Apellido Materno, Nombre(s), Razón Social, RFC, C.U.R.P., Nº Empleado
Grupo, Subgrupo, Ejecutivo, VENDEDOR, DESPACHO, GERENCIA, LINEA DE NEGOCIO
Datos financieros: Prima Neta, Derecho de Póliza, Recargo, % Recargos, IVA, % IVA, Prima Total
Vehículo: Marca, Descripción (Tipo), Modelo, Número de Serie, Número de Motor, Placas
Tipo de Servicio y Uso del Vehículo
Estatus de la póliza: Conducto de Cobro, Tipo de Conducto de Cobro, Tipo de Pago, Tipo de Venta, Estatus, Estatus de Cobro, Estatus de Usuario
Fechas clave: Fecha de Antigüedad, Desde, Hasta, Fecha de Solicitud, Fecha de Envio, Fecha de Recepcion, Fecha de Entrega, Fecha Conversion
Ejemplo de póliza de Autos:

DIR METRO SUR	FLORIDA	FLORIDA	AGENTES	48297	MARCOS JAVIER BELTRAN ORTEGA	100224986711	D5013104	CARLOS CASTAÑUELA MENDOZA	12-dic-24	12-dic-25	AUTOS

3️⃣ Pólizas de Daños
Si el documento pertenece a Daños, incluir:

Tipo de Cobertura (Ejemplo: Hogar, Comercio, Industrial)
Datos financieros: Prima Neta, Derecho de Póliza, Recargo, % Recargos, IVA, % IVA, Prima Total
Estatus de Cobro y Forma de Pago
Datos del inmueble: Dirección completa, Código Postal, Ciudad
Ejemplo de póliza de Daños:

DIR METRO SUR	FLORIDA	FLORIDA	AGENTES	57999	ARMANDO CERVANTES CRUZ	SDA044340200	SDA04434	ROCIO GUEVARA RESENDIZ	23-mar-25	23-mar-26	DAÑOS

4️⃣ Pólizas de Vida
Si el documento pertenece a Vida, incluir:

Nombre completo, RFC, Sexo, Fecha de Nacimiento
Datos financieros: Prima Neta, Derecho de Póliza, Recargo, % Recargos, IVA, % IVA, Prima Total
Estatus de la póliza: Conducto de Cobro, Tipo de Venta, Despacho, Gerencia
Beneficiarios (si están presentes en el documento)
Ejemplo de póliza de Vida:

DIR METRO SUR	FLORIDA	FLORIDA	AGENTES	127252	SONIA LAURA GONZALEZ RODRIGUEZ	0K1158827	Sin dato	JESUS RAMIREZ SEGURA	VIDA Y AHORRO

### 📌 **Detección de Direcciones Recurrentes**
1. **Identificación de direcciones frecuentes**  
   - Si el documento contiene una dirección recurrente de oficinas de la aseguradora (ejemplo: "Nuevo León 1"), debe interpretarse como la **dirección de la aseguradora** y no la del asegurado.
   - En este caso, asigna la dirección a un nuevo campo llamado **"DireccionAseguradora"** en el JSON de salida.

2. **Diferenciación de direcciones**  
   - Si el documento contiene dos direcciones:
     - Una coincide con una dirección recurrente de aseguradoras → Se almacena en "DireccionAseguradora".
     - La otra es única o pertenece al asegurado → Se almacena en "Direccion".
   - Si solo se encuentra una dirección, se evalúa si es de aseguradora y se almacena en el campo correspondiente.

3. **Ejemplo de direcciones recurrentes**  
   - **AXA Seguros:** "Av. Insurgentes Sur 762, Col. Del Valle, México, CDMX., C.P. 03100."
   - **GNP Seguros:** "Av. Insurgentes Sur 1106, Col. Del Valle, CDMX"
   - **Seguros Monterrey:** "Paseo de la Reforma 505, Col. Cuauhtémoc, CDMX"
   - **MAPFRE:** "Av. Revolución 1900, Col. San Ángel, CDMX"

4. **Manejo de números cercanos a direcciones**  
   - Si en el documento aparece un número **cerca de una dirección recurrente**, se asume que es parte de la dirección y se asigna correctamente a "DireccionAseguradora".
   - Ejemplo:  
     - **Entrada en el documento:** "Av. Insurgentes Sur 762, Col. Del Valle, México, CDMX., C.P. 03100."
     - **Salida en JSON:** "DireccionAseguradora": "Nuevo León 1, Col. Condesa, CDMX"

---

Ejemplo de Salida JSON
CLAVE MAPFRE: 0109-0010-0019
{
  "NombreContratante": "OSCAR ALBERTO REYNAL BAEZA",
  "NoPoliza": "0065709A",
  "RFC": "RUJA960807TM2",
  "CURP": "RUJA960807HDFNRN06",
  "FechaVigenciaInicio": "12/01/2012",
  "FechaVigenciaFin": "24/02/2025",
  "FechaEmision": "24/02/2025",
  "PrimaTotal": "12,441.67",
  "PrimaNeta": "11,000.00",
  "DerechoPoliza": "500.00",
  "%Recargo": "2.5%",
  "Recargos": "300.00",
  "%IVA": "16%",
  "IVA": "1,441.67",
  "Endoso": "No",
  "Direccion": {
    "Calle": "AV EL RIEGO AND 57",
    "NumeroExterior": "10",
    "NumeroInterior": "",
    "Colonia": "VILLA COAPA",
    "Ciudad": "TLALPAN",
    "CodigoPostal": "14390",
    "Pais": "MEXICO"
  },
  "NumeroCelular": "5512345678",
  "Correo": "oscar.reynal@example.com",
  "Ramo": "Vida",
  "SubRamo": "Seguro de Vida Individual",
  "ClaveAgente": "123456",
  "NombreAgente": "JUAN PÉREZ",
  "FormaPago": "Tarjeta de Crédito",
  "TipoPago": "Mensual",
  "Moneda": "MXN",
  "Grupo": "Corporativo",
  "Subgrupo": "Ejecutivo",
  "Ejecutivo": "CARLOS LOPEZ",
  "ConductoCobro": "Domiciliado",
  "TipoVenta": "Nueva Contratación",
  "Vendedor": "Ana Martínez",
  "Despacho": "Seguros ABC",
  "Gerencia": "Nacional",
  "LineaNegocio": "Seguros Personales",
  "CoberturaPlan": "Plan Premium",
  "Estatus": "Vigente",
  "EstatusCobro": "Pagado",
  "EstatusUsuario": "Activo",
  "FechaAntiguedad": "10/05/2010",
  "FechaSolicitud": "01/01/2025",
  "FechaEnvio": "05/01/2025",
  "FechaRecepcion": "08/01/2025",
  "FechaEntrega": "10/01/2025",
  "FechaConversion": "15/01/2025",
  "ClasificacionDocumento": "Póliza",
  "Inciso": "001"
}

### 📌 **Reglas Adicionales para MAPFRE**

Si el documento pertenece a la aseguradora **MAPFRE**, también deberás buscar y extraer la **clave MAPFRE**, que puede aparecer con el texto:

- "CLAVE MAPFRE: 0109-0010-0019"  
- u otras variantes similares donde se incluya la palabra "CLAVE MAPFRE:" seguida de una cadena tipo código.

🔹 Si la encuentras, incluye un campo adicional en el JSON con la siguiente estructura:

"ClaveMAPFRE": "0109-0010-0019"

🔹 Si no hay ninguna clave MAPFRE visible, incluye "ClaveMAPFRE": "".
}
📌 Reglas Adicionales para GNP
Si el documento pertenece a la aseguradora GNP, deberás buscar y extraer la descripción completa del vehículo, que aparece en la sección “VEHÍCULO ASEGURADO”, así como identificar la marca del vehículo.

🔍 Este campo usualmente contiene una cadena con el siguiente formato:

arduino
Copiar
Editar
"CHEVROLET SPARK DOT G L4 1.2 STD"
u otras variantes similares donde el primer término representa la marca.

🔹 Para extraer esta información correctamente:

Ubica el bloque o línea donde aparece el encabezado VEHÍCULO ASEGURADO.

Localiza la línea que contiene la descripción completa del vehículo, generalmente después de las palabras Descripción y Serie.

Guarda esa línea como valor del campo DescripcionGNP.

Extrae la primera palabra de dicha línea (antes del primer espacio). Esa será la marca del vehículo.

🔹 Ejemplo:

Texto detectado:
CHEVROLET SPARK DOT G L4 1.2 STD

Resultado esperado en el JSON:

"DescripcionGNP": "CHEVROLET SPARK DOT G L4 1.2 STD",
"Marca": "CHEVROLET"
🔹 Si no se encuentra la descripción, incluir:
"DescripcionGNP": "",
"Marca": "CHEVROLET"

`;