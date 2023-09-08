import { Router } from "express";

import { POSTSesion } from '../controllers/Sesiones.controllers.js'

const router = Router()

router.get('/InsertaSesion' , POSTSesion)

export default router