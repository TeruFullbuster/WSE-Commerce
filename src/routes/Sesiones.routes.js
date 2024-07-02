import { Router } from "express";

import { POSTSesion , PutSesion, PutPass , POSTFormulario, createProspecto, updatePaso1, updatePaso2, updatePaso3 } from '../controllers/Sesiones.controllers.js'

const router = Router()

router.post('/InsertaSesion' , POSTSesion)

router.put('/ActualizacionSesion' , PutSesion)

router.put('/ActualizaPaso' , PutPass)

router.post('/RegistroLinkedIn' , POSTFormulario)

router.post('/prospecto', createProspecto);

router.put('/prospecto/:id/paso1', updatePaso1);

router.put('/prospecto/:id/paso2', updatePaso2);

router.put('/prospecto/:id/paso3', updatePaso3);

export default router