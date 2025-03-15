import { Router } from "express";
import multer from "multer";

import { consultarREPUVE, OCRGPT, procesarZIP, procesarExcelPolizas } from '../controllers/Servicios.controllers.js'

// 🛠 **Configurar `multer` para manejar archivos PDF**
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Guardar archivos en la carpeta "uploads"
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});
const upload = multer({ storage });
const router = Router()

router.post('/Servicios/Repuve' , consultarREPUVE)

// 📌 **Asegurar que `multer` recibe el archivo en la ruta correcta**
router.post("/Servicios/OCRGPT", upload.single("Archivo"), OCRGPT);

router.post("/Servicios/ProcesarZIP", upload.single("archivoZIP"), procesarZIP);

router.get('/Servicios/CruzarExcel', procesarExcelPolizas);

export default router