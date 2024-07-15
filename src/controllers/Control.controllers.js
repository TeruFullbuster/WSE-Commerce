import { pool } from '../db.js'
import fetch from 'node-fetch';

export const LogPMP  = async (req, res) => {

    const {correo,LogsPMP} = req.body

    try {
    const [rows] = await pool.query('INSERT INTO LogsPMP (correo,LogsPMP) VALUES (?,?)', [correo,LogsPMP])
    //console.log(rows) 
    res.send({
        message: "Registro Exitoso"        
    })
    } catch (error) {
        return res.status(500).json({
            message: ' Algo esta mal'
        })
    }
}
