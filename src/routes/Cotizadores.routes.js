import { Router } from "express";

import { CotizarQualitas,BotcotizacionQualitas } from '../controllers/Cotizadores.controllers.js'

const router = Router()

router.post('/Cotizar/Qualitas' , CotizarQualitas)

router.post('/Cotizar/QualitasBot' , BotcotizacionQualitas)

export default router