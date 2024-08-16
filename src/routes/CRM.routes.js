import { Router } from "express";

import { createCE } from '../controllers/CRM.controllers.js'

const router = Router()

router.post('/CRM/LineasComerciales' , createCE)

export default router