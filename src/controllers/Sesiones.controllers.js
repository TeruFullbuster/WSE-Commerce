import { pool } from '../db.js'

export const POSTSesion  = async (req, res) => {
    /*console.log('Si aca ando')
    console.log(req.query)
    const area = req.query.area;
    const perfil = req.query.perfil;*/
    try {
    const [rows] = await pool.query('SELECT * FROM EjemploEmpleados')
            res.json(rows)
        
    } catch (error) {
        return res.status(500).json({
            message: ' Algo esta mal aca toy'
        })
    }
}