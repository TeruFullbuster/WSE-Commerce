import app from './app.js'

import { DB_HOST, PORT } from './config.js'

app.listen(PORT)

console.log('Servidor en el puerto ' + PORT)

console.log(DB_HOST)

