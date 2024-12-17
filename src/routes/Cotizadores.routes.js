import { Router } from "express";

import { CotizarQualitas,BotcotizacionQualitas, BotcotizacionQualitasCopy } from '../controllers/Cotizadores.controllers.js'

const router = Router()

router.post('/Cotizar/Qualitas' , CotizarQualitas)

router.post('/Cotizar/QualitasBot' , BotcotizacionQualitas)

router.post('/Cotizar/QualitasBot2' , BotcotizacionQualitasCopy)

export default router