import { Router } from "express";

import { obtenerLeadsDeFacebook  } from '../controllers/facebook.controllers.js'

const router = Router()

router.post('/FacebookCRM' , obtenerLeadsDeFacebook)


export default router