import { createPool } from 'mysql2/promise';

import {DB_HOST,DB_DATABASES,DB_USER,DB_PASSWORD,DB_PORT} from './config.js'
console.log(DB_HOST,DB_DATABASES,DB_USER,DB_PASSWORD,DB_PORT)
export const pool = createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    port: DB_PORT,
    database: DB_DATABASES
})
