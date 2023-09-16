import { Router } from "express";

import { POSTSesion , PutSesion, PutPass } from '../controllers/Sesiones.controllers.js'

const router = Router()

router.post('/InsertaSesion' , POSTSesion)

router.put('/ActualizacionSesion' , PutSesion)

router.put('/ActualizaPaso' , PutPass)


export default router