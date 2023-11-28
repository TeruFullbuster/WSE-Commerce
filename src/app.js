import express from 'express'

import SesionesRoutes from './routes/Sesiones.routes.js'
import MailingRoutes from './routes/Mailing.routes.js'

import cors from 'cors'

console.log("Algo");

const app = express()

app.use(cors())

app.use(express.json())

app.use(SesionesRoutes)

app.use(MailingRoutes)

export default app;