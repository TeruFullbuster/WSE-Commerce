import { Router } from "express";

import { CotizarQualitas,BotcotizacionQualitas, BotEmisionQualitas, BotcotizacionChubb, EspejoQualitas,BotcotizacionChubbExperto } from '../controllers/Cotizadores.controllers.js'

const router = Router()

router.post('/Cotizar/Qualitas' , CotizarQualitas)

router.post('/Cotizar/QualitasBot' , BotcotizacionQualitas)

router.post('/Emitir/QualitasBot' , BotEmisionQualitas)

router.post('/Cotizar/ChubbBot' , BotcotizacionChubb)

router.post('/Emitir/ChubbBot' , BotcotizacionChubb)

router.post('/Cotizar/ChubbExperto' , BotcotizacionChubbExperto)

router.post('/Espejo/Cotizar/QualitasBot' , EspejoQualitas)

router.post('/Espejo/Emitir/QualitasBot' , BotEmisionQualitas)

export default router