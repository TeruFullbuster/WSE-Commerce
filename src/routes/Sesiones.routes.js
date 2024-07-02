import { Router } from "express";

import { POSTSesion , PutSesion, PutPass , POSTFormulario, createProspecto, updateProspectoPaso1, updateProspectoPaso2, updateProspectoPaso3 } from '../controllers/Sesiones.controllers.js'

const router = Router()

router.post('/InsertaSesion' , POSTSesion)

router.put('/ActualizacionSesion' , PutSesion)

router.put('/ActualizaPaso' , PutPass)

router.post('/RegistroLinkedIn' , POSTFormulario)

router.post('/prospecto', createProspecto);

router.put('/prospecto/:id/paso1', updateProspectoPaso1);

router.put('/prospecto/:id/paso2', updateProspectoPaso2);

router.put('/prospecto/:id/paso3', updateProspectoPaso3);

export default router