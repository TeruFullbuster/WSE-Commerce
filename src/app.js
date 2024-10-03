import express from 'express';
import SesionesRoutes from './routes/Sesiones.routes.js';
import MailingRoutes from './routes/Mailing.routes.js';
import AXAKeraltyRoutes from './routes/axakeralty.routes.js';
import RegistroZoho from './routes/RegistroZoho.routes.js';
import Generico from './routes/generico.routes.js';
import Control from './routes/Control.routes.js';
import CRM from './routes/CRM.routes.js';
import cors from 'cors';
import chicle from 'crypto';
import Facebook from './routes/facebook.routes.js';
const app = express();
const PORT = 3001;

chicle.randomBytes(16).toString('base64');
console.log(chicle.randomBytes(16).toString('base64'));
// '6JDFIvPbrWANKpSJ8vlv6b=='
console.log("Algo");

// Middleware para obtener la dirección IP del cliente
app.use((req, res, next) => {
    req.clientIp = req.connection.remoteAddress;
    next();
});

app.use(cors());

// Configuración para aumentar el límite de tamaño de carga
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(SesionesRoutes);
app.use(MailingRoutes);
app.use(AXAKeraltyRoutes);
app.use(RegistroZoho);
app.use(Generico);
app.use(Control);
app.use(CRM);
app.use(Facebook)
// Configuración del servidor para escuchar en el puerto
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

export default app;
