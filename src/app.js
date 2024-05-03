import express from 'express'

import SesionesRoutes from './routes/Sesiones.routes.js'
import MailingRoutes from './routes/Mailing.routes.js'
import AXAKeraltyRoutes from './routes/axakeralty.routes.js'

import http from 'http'

import cors from 'cors'

console.log("Algo");

const app = express()

const PORT = 3000;

app.use(cors())

app.use(express.json())

app.use(SesionesRoutes)

app.use(MailingRoutes)

app.use(AXAKeraltyRoutes)

export default app;