import { Router } from "express";

import { TokenCondusef,createImageEntry, getImageEntry, getImageEntryAsBase64  } from '../controllers/generico.controllers.js'

const router = Router()

router.get('/Token/Condusef/' , TokenCondusef)

router.post('/createImageEntry/', createImageEntry);

router.get('/getImageEntry/:id' , getImageEntry)

router.get('/getImageBASE/:id' , getImageEntryAsBase64)

export default router