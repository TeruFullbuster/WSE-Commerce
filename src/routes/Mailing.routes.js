import { Router } from "express";

import { POSTSesion } from '../controllers/Mailing.controllers.js'

const router = Router()

router.post('/SendMailing' , POSTSesion)

export default router