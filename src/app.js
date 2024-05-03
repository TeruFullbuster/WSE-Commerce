import express from 'express'

import SesionesRoutes from './routes/Sesiones.routes.js'
import MailingRoutes from './routes/Mailing.routes.js'
import AXAKeraltyRoutes from './routes/axakeralty.routes.js'

import http from 'http'

import cors from 'cors'

console.log("Algo");

const app = express()
const server = http.createServer((req, res) => {
    // Obtiene la dirección IP del cliente
    const clientIp = req.connection.remoteAddress;
  
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`La dirección IP del cliente es: ${clientIp}`);
  });

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

app.use(cors())

app.use(express.json())

app.use(SesionesRoutes)

app.use(MailingRoutes)

app.use(AXAKeraltyRoutes)

export default app;