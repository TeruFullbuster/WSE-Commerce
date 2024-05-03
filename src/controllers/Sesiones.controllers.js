import { pool } from '../db.js'

export const POSTSesion  = async (req, res) => {
    const {URL,FechaDCreacion,IP,primaTotal} = req.body
    try {
    const [rows] = await pool.query('INSERT INTO Sesiones (URL,FechaDCreacion,IP,primaTotal) VALUES (?,?,?,?)', [URL,FechaDCreacion,IP,primaTotal])
    //console.log(rows) 
    res.send({
        message: "Registro Exitoso",
        id: rows.insertId,
        URL,
        FechaDCreacion,
        IP,
        primaTotal
    })
    } catch (error) {
        return res.status(500).json({
            message: ' Algo esta mal'
        })
    }
}

export const PutSesion = async(req, res) => {
    const {leadidcpy,id} = req.body
    try {    
    const [result] = await pool.query('UPDATE Sesiones SET LeadidCPY = ? WHERE id = ?', [leadidcpy,id])
    console.log(result)

    if (result.affectedRows === 0) return res.status(404).json({
        message: 'Empleado no encontrado'
    })
    res.send({
        message: "Actualización Exitoso"    
    })

    } catch (error) {
        return res.status(500).json({
            message: ' Algo esta mal'
        })
    }
}

export const PutPass = async(req, res) => {
    const {Paso,id} = req.body
    try {    
    const [result] = await pool.query('UPDATE Sesiones SET Paso = ? WHERE id = ?', [Paso,id])
    console.log(result)

    if (result.affectedRows === 0) return res.status(404).json({
        message: 'Empleado no encontrado'
    })
    res.send({
        message: "Actualización Exitoso"    
    })

    } catch (error) {
        return res.status(500).json({
            message: ' Algo esta mal'
        })
    }
}


export const POSTFormulario  = async (req, res) => {
    
    try {
        const {Nombre,Apellidos,Correo,Telefono, Origen} = req.body
        const HoradeRegistro = new Date();                
        const [result] = await pool.query(
            'INSERT INTO FormulariosLinkedIN (Nombre,Apellidos,Correo,Telefono,Origen,HoredeRegistro) VALUES (?,?,?,?,?,?)',
            [Nombre,Apellidos,Correo,Telefono,Origen,HoradeRegistro]
        );
      
        // Verifica si la inserción fue exitosa
        if (result.affectedRows > 0) {
            // Obtén los datos insertados
            console.log(result.insertId)
            const id = result.insertId
            const insertedData = {            
            Nombre,
            Apellidos,
            Correo,
            Telefono,
            Origen,
            HoradeRegistro
            // Agrega más columnas según sea necesario
            };

            return res.status(200).json({
            message: 'Inserción exitosa',
            response: insertedData
            });
        } else {
            return res.status(500).json({
            message: 'No se pudo realizar la inserción'
            });
        }
        } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Error en el servidor'
        });
      }
}