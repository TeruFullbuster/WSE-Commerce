import { Router } from "express";

import { OCRGPT } from '../controllers/GPTServices.controllers.js'

const router = Router()

import multer from 'multer';
const storage = multer.memoryStorage(); // Almacenamos en memoria
const upload = multer({ storage: storage });

// Usamos upload.single('Archivo') para manejar la carga del archivo
router.post('/GPTServices/OCR', upload.single('Archivo'), OCRGPT);

export default router