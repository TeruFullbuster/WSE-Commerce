import { Router } from "express";

import { createCE, NotificacionDiariaLeads, NotificacionDiariaLeadsLC,NotificacionDiariaLeadsSimple } from '../controllers/CRM.controllers.js'

const router = Router()

router.post('/CRM/LineasComerciales' , createCE)

router.post('/CRM/NotificacionDiariaLeads' , NotificacionDiariaLeads)

router.post('/CRM/NotificacionDiariaLeadsLC' , NotificacionDiariaLeadsLC)

router.get('/CRM/NotificacionDiariaLeadsLCSimple/:TipoNotificacion&:NotificarMail' , NotificacionDiariaLeadsSimple)

export default router