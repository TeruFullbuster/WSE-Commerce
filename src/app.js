import express from 'express'

import SesionesRoutes from './routes/Sesiones.routes.js'

import cors from 'cors'

console.log("Algo");

const app = express()

app.use(cors())

app.use(express.json())

app.use(SesionesRoutes)

export default app;