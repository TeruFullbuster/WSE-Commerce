import { Router } from "express";

import { cotizaciones  } from '../controllers/axakeralty.controllers.js'

const router = Router()

router.post('/CotizacionKeralty' , cotizaciones)


export default router