import { pool } from '../db.js'

export const POSTSesion  = async (req, res) => {
    const {URL,FechaDCreacion,IP} = req.body
    try {
    const [rows] = await pool.query('INSERT INTO Sesiones (URL,FechaDCreacion,IP) VALUES (?,?,?)', [URL,FechaDCreacion,IP])
    //console.log(rows) 
    res.send({
        message: "Registro Exitoso",
        id: rows.insertId,
        URL,
        FechaDCreacion,
        IP
    })
    } catch (error) {
        return res.status(500).json({
            message: ' Algo esta mal'
        })
    }
}