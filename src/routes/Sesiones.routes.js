import { Router } from "express";

import { POSTSesion } from '../controllers/Sesiones.controllers.js'

const router = Router()

router.post('/InsertaSesion' , POSTSesion)

export default router