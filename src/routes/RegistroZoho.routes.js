import { Router } from "express";

import { RegistroZoho, SearchEmailZoho , CreateUserZoho, SearchActiveAccountZoho  } from '../controllers/RegistroZoho.controllers.js'

const router = Router()

router.post('/Zoho/Registro' , RegistroZoho)
router.post('/Zoho/CreateUser' , CreateUserZoho)
router.get('/Zoho/SearchEmail' , SearchEmailZoho)
router.get('/Zoho/SearchActiveAccountZoho', SearchActiveAccountZoho)
export default router