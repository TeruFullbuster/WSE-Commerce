import { Router } from "express";

import { consultarREPUVE } from '../controllers/Servicios.controllers.js'

const router = Router()

router.post('/Servicios/Repuve' , consultarREPUVE)

export default router