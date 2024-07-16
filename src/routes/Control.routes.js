import { Router } from "express";

import { LogPMP , getCheckSitemap } from '../controllers/Control.controllers.js'

const router = Router()

router.post('/PasameMiPolizaUSO' , LogPMP)

// Ruta para validar el sitemap
router.get('/check-sitemap/:id', getCheckSitemap);

export default router