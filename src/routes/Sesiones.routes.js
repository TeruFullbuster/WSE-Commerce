import { Router } from "express";

import { updateProspectoEcommerce, POSTSesion , PutSesion, PutPass , 
    POSTFormulario, createProspecto, updateProspectoPaso1, updateProspectoPaso2, 
    updateProspectoPaso3, updateProspectoPaso4, RecuperaProspectos, TraemelosEcommerce,
    RecuperaProspectosEcommerce, GetCotID, GetToken, updateProspectoRecotiza, GetMSIxBanco,
    UpdateDescCot } from '../controllers/Sesiones.controllers.js'

const router = Router()

router.post('/InsertaSesion' , POSTSesion)

router.put('/ActualizacionSesion' , PutSesion)

router.put('/ActualizaPaso' , PutPass)

router.post('/RegistroLinkedIn' , POSTFormulario)

router.post('/prospecto', createProspecto);

router.put('/prospecto/:id/paso1', updateProspectoPaso1);

router.put('/prospecto/:id/paso2', updateProspectoPaso2);

router.put('/prospecto/:id/paso3', updateProspectoPaso3);

router.put('/prospecto/:id/paso4', updateProspectoPaso4);

router.put('/prospecto/:id/UpdateDescCot', UpdateDescCot);

router.get('/RecuperaProspectos', RecuperaProspectos);

router.put('/prospecto/:id/Ecommerce', updateProspectoEcommerce);

router.get('/TraemelosEcommerce', TraemelosEcommerce);

router.get('/RecuperaProspectosEcommerce', RecuperaProspectosEcommerce);

router.put('/prospecto/:id/Recotiza', updateProspectoRecotiza);

router.get('/GetCotID/:id', GetCotID);

router.get('/Catalogos/BancosxAseguradoraMSI/:idCIa', GetMSIxBanco);

router.post('/GetToken', GetToken);

export default router