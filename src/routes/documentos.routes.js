import { Router } from 'express';
import { OCRPoliza } from '../controllers/documentos.controllers.js';
import multer from 'multer';
// Configuración de Multer para manejar archivos
const upload = multer({ dest: 'uploads/' });

const router = Router();

// Ruta para manejar la subida del archivo PDF
router.post('/Escaneo/OCRPoliza', upload.single('pdf'), OCRPoliza);

export default router;
