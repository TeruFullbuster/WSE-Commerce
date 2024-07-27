import { Router } from "express";

import { TokenCondusef,createImageEntry, getImageEntry, getImagesAsZip  } from '../controllers/generico.controllers.js'

const router = Router()

router.get('/Token/Condusef/' , TokenCondusef)

router.post('/createImageEntry/', createImageEntry);

router.get('/getImageEntry/:id' , getImageEntry)

router.get('/getImagesAsZip/' , getImagesAsZip)

export default router