import { Router } from "express";

import { CotizarQualitas,BotcotizacionQualitas, BotEmisionQualitas } from '../controllers/Cotizadores.controllers.js'

const router = Router()

router.post('/Cotizar/Qualitas' , CotizarQualitas)

router.post('/Cotizar/QualitasBot' , BotcotizacionQualitas)

router.post('/Emitir/QualitasBot' , BotEmisionQualitas)

export default router