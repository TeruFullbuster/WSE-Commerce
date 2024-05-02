import { Router } from "express";

import { POSTSesion , PutSesion, PutPass , POSTFormulario } from '../controllers/Sesiones.controllers.js'

const router = Router()

router.post('/InsertaSesion' , POSTSesion)

router.put('/ActualizacionSesion' , PutSesion)

router.put('/ActualizaPaso' , PutPass)

router.post('/RegistroLinkedIn' , POSTFormulario)

export default router