import { Router } from "express";
import multer from "multer";

import { consultarREPUVE, OCRGPT, procesarZIP, procesarExcelPolizas } from '../controllers/Servicios.controllers.js'

const storage = multer.memoryStorage(); // Guardar en memoria, no en disco
const upload = multer({ storage });

const router = Router()

router.post('/Servicios/Repuve' , consultarREPUVE)

// 📌 **Asegurar que `multer` recibe el archivo en la ruta correcta**
router.post("/Servicios/OCRGPT", upload.single("Archivo"), OCRGPT);

router.post("/Servicios/ProcesarZIP", upload.single("archivoZIP"), procesarZIP);

router.get('/Servicios/CruzarExcel', procesarExcelPolizas);

export default router