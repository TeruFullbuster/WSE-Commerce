import { Router } from "express";

import { createCE, NotificacionDiariaLeads } from '../controllers/CRM.controllers.js'

const router = Router()

router.post('/CRM/LineasComerciales' , createCE)

router.post('/CRM/NotificacionDiariaLeads' , NotificacionDiariaLeads)

export default router