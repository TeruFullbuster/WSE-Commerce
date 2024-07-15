import { Router } from "express";

import { LogPMP } from '../controllers/Control.controllers.js'

const router = Router()

router.post('/PasameMiPolizaUSO' , LogPMP)


export default router