import { Router } from "express";

import { RegistroZoho  } from '../controllers/RegistroZoho.controllers.js'

const router = Router()

router.post('/Zoho/Registro' , RegistroZoho)


export default router