import { Router } from "express";

import { TokenCondusef  } from '../controllers/generico.controllers.js'

const router = Router()

router.get('/Token/Condusef/' , TokenCondusef)


export default router