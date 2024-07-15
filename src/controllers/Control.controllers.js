import { pool } from '../db.js'
import fetch from 'node-fetch';

export const LogPMP  = async (req, res) => {

    const {correo,LogsPMP} = req.body
    console.log(correo,LogsPMP)
    try {
    const [rows] = await pool.query('INSERT INTO LogsPMP (correo,fechalogs) VALUES (?,?)', [correo,LogsPMP])
    console.log(rows) 
    res.send({
        message: "Registro Exitoso"        
    })
    } catch (error) {
        return res.status(500).json({
            message: ' Algo esta mal'
        })
    }
}
