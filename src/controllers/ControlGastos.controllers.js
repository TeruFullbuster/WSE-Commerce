import e from 'cors';
import { pool } from '../db.js'
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import moment from 'moment-timezone';
import crypto from 'crypto';
import { SECRET_KEY } from '../config.js';

export const CreateUser = async (req, res) => {
    try {
        const { nombre, correo, password } = req.body;
        console.log(req.body);

        // Validación de campos
        if (!nombre || !correo || !password) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        // Verificar si el usuario ya existe
        const [rows] = await pool.query('SELECT id FROM cgg_Usuarios WHERE correo = ?', [correo]);
        console.log(rows); // Imprime el resultado para depuración
        if (rows.length > 0) {
            return res.status(409).json({ message: "El correo ya está registrado" });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar usuario en la base de datos
        await pool.query(
            'INSERT INTO cgg_Usuarios (nombre, correo, contraseña_hash) VALUES (?, ?, ?)',
            [nombre, correo, hashedPassword]
        );

        res.status(201).json({ message: 'Usuario creado correctamente' });

    } catch (error) {
        console.error("Error al crear el usuario:", error);
        res.status(500).json({ message: "Error en el servidor al crear el usuario" });
    }
};

export const Login = async (req, res) => {
    try {
        const { correo, password } = req.body;

        // Validar que los campos no estén vacíos
        if (!correo || !password) {
            return res.status(400).json({ message: "Correo y contraseña son obligatorios" });
        }

        // Buscar el usuario en la base de datos
        const [rows] = await pool.query(
            'SELECT id, nombre, contraseña_hash FROM cgg_Usuarios WHERE correo = ?',
            [correo]
        );

        // Si no se encuentra el usuario, retornar error
        if (rows.length === 0) {
            return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
        }

        const user = rows[0];

        // Comparar la contraseña ingresada con la almacenada en hash
        const validPassword = await bcrypt.compare(password, user.contraseña_hash);
        if (!validPassword) {
            return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
        }

        // Generar token JWT (válido por 24 horas)
        const token = jwt.sign(
            { usuario_id: user.id, nombre: user.nombre },
            SECRET_KEY,  
            { expiresIn: '24h' }
        );

        // Responder con datos básicos y el token
        res.status(200).json({
            usuario_id: user.id,
            nombre: user.nombre,
            token
        });

    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ message: "Error en el servidor al iniciar sesión" });
    }
};

export const GetGastos = async (req, res) => {
    try {
        // Obtener token del encabezado
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: "Acceso no autorizado, token requerido" });
        }

        // Verificar si el token es válido
        const token = authHeader.split(" ")[1];
        let decoded;
        try {
            decoded = jwt.verify(token, SECRET_KEY);
        } catch (err) {
            return res.status(403).json({ message: "Token inválido o expirado" });
        }

        // Obtener `usuario_id` del token
        const usuario_id = decoded.usuario_id;

        // Obtener el nombre del usuario
        const [userRows] = await pool.query(
            'SELECT nombre FROM cgg_Usuarios WHERE id = ?',
            [usuario_id]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const nombreUsuario = userRows[0].nombre;

        // Obtener los gastos e ingresos del usuario
        const [registros] = await pool.query(`
            SELECT r.id, r.fecha, c.categoria, c.subcategoria, c.tipo, r.monto, r.estatus 
            FROM cgg_Registros r
            INNER JOIN cgg_Catalogos c ON r.catalogo_id = c.id
            WHERE r.usuario_id = ? AND r.activo = 1`,  // Solo registros activos
            [usuario_id]
        );

        // Separar ingresos y gastos
        let totalIngresos = 0;
        let totalGastos = 0;
        
        registros.forEach(reg => {
            if (reg.tipo === "In") {
                totalIngresos += parseFloat(reg.monto);
            } else if (reg.tipo === "Out") {
                totalGastos += parseFloat(reg.monto);
                reg.monto = -Math.abs(reg.monto); // Mostrar en negativo
            }
        });

        const saldoTotal = totalIngresos - totalGastos;

        res.status(200).json({
            usuario_id,
            nombre: nombreUsuario,
            total_ingresos: totalIngresos.toFixed(2),
            total_gastos: totalGastos.toFixed(2),
            saldo_total: saldoTotal.toFixed(2),
            registros
        });

    } catch (error) {
        console.error("Error al obtener los registros:", error);
        res.status(500).json({ message: "Error en el servidor al obtener los registros" });
    }
};

export const AddGasto = async (req, res) => {
    try {
        // Obtener token del encabezado
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: "Acceso no autorizado, token requerido" });
        }

        // Verificar si el token es válido
        const token = authHeader.split(" ")[1];
        let decoded;
        try {
            decoded = jwt.verify(token, SECRET_KEY);
        } catch (err) {
            return res.status(403).json({ message: "Token inválido o expirado" });
        }

        // Obtener `usuario_id` del token
        const usuario_id = decoded.usuario_id;

        // Extraer datos del gasto
        const { fecha, categoria, subcategoria, monto, estatus, metodo_pago_usuario_id } = req.body;

        // Validar que **todos** los campos obligatorios estén presentes
        if (!fecha || !categoria || !subcategoria || !monto || !estatus) {
            return res.status(400).json({ message: "Todos los campos son obligatorios (Fecha, Categoría, Subcategoría, Monto, Estatus)" });
        }

        // Buscar el ID del **catálogo** con la categoría y subcategoría proporcionadas
        const [catalogo] = await pool.query(
            "SELECT id FROM cgg_Catalogos WHERE categoria = ? AND subcategoria = ?",
            [categoria, subcategoria]
        );

        if (catalogo.length === 0) {
            return res.status(400).json({ message: "La categoría o subcategoría no existen en el catálogo" });
        }

        const catalogo_id = catalogo[0].id;

        // Insertar el gasto en la base de datos con `catalogo_id`
        await pool.query(
            `INSERT INTO cgg_Registros (usuario_id, fecha, catalogo_id, subcatalogo_id, monto, estatus, metodo_pago_usuario_id, activo)
             VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
            [usuario_id, fecha, catalogo_id, catalogo_id, monto, estatus, metodo_pago_usuario_id || null] // `subcatalogo_id` es el mismo `catalogo_id`
        );

        res.status(201).json({ message: "Gasto registrado correctamente" });

    } catch (error) {
        console.error("Error al registrar el gasto:", error);
        res.status(500).json({ message: "Error en el servidor al registrar el gasto" });
    }
};

export const AddMetodoPago = async (req, res) => {
    try {
        // Obtener token del encabezado
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: "Acceso no autorizado, token requerido" });
        }

        // Verificar si el token es válido
        const token = authHeader.split(" ")[1];
        let decoded;
        try {
            decoded = jwt.verify(token, SECRET_KEY);
        } catch (err) {
            return res.status(403).json({ message: "Token inválido o expirado" });
        }

        // Extraer `usuario_id` del token
        const usuario_id = decoded.usuario_id;

        // Extraer datos del método de pago desde el cuerpo de la petición
        const { nombre, tipo, saldo_disponible = 0, limite_credito = null } = req.body;

        // Validaciones
        if (!nombre || !tipo) {
            return res.status(400).json({ message: "Nombre y tipo son obligatorios" });
        }

        // Insertar nuevo método de pago
        const [response] = await pool.query(
            'INSERT INTO cgg_MetodosPagoUsuario (usuario_id, nombre, tipo, saldo_disponible, limite_credito) VALUES (?, ?, ?, ?, ?)',
            [usuario_id, nombre, tipo, saldo_disponible, limite_credito]
        );

        res.status(201).json({ message: 'Método de pago agregado correctamente', metodo_id: response.insertId });

    } catch (error) {
        console.error("Error al agregar método de pago:", error);
        res.status(500).json({ message: "Error en el servidor al agregar el método de pago" });
    }
};

export const GetCatalogos = async (req, res) => {
    try {
        // Obtener los catálogos de ingresos y gastos
        const [catalogos] = await pool.query(`
            SELECT id, categoria, subcategoria, tipo 
            FROM cgg_Catalogos
        `);

        res.status(200).json({ catalogos });

    } catch (error) {
        console.error("Error al obtener los catálogos:", error);
        res.status(500).json({ message: "Error en el servidor al obtener los catálogos" });
    }
};

export const GetMetodosPago = async (req, res) => {
    try {
        // Obtener token del encabezado
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: "Acceso no autorizado, token requerido" });
        }

        // Verificar si el token es válido
        const token = authHeader.split(" ")[1];
        let decoded;
        try {
            decoded = jwt.verify(token, SECRET_KEY);
        } catch (err) {
            return res.status(403).json({ message: "Token inválido o expirado" });
        }

        // Obtener `usuario_id` del token
        const usuario_id = decoded.usuario_id;

        // Consultar los métodos de pago del usuario
        const [metodos] = await pool.query(`
            SELECT id, nombre, tipo, saldo_disponible, limite_credito 
            FROM cgg_MetodosPagoUsuario
            WHERE usuario_id = ?
        `, [usuario_id]);

        res.status(200).json({ metodos });

    } catch (error) {
        console.error("Error al obtener los métodos de pago:", error);
        res.status(500).json({ message: "Error en el servidor al obtener los métodos de pago" });
    }
};

export const GetGastosByFecha = async (req, res) => {
    try {
        // Obtener token del encabezado
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: "Acceso no autorizado, token requerido" });
        }

        // Verificar si el token es válido
        const token = authHeader.split(" ")[1];
        let decoded;
        try {
            decoded = jwt.verify(token, SECRET_KEY);
        } catch (err) {
            return res.status(403).json({ message: "Token inválido o expirado" });
        }

        // Obtener `usuario_id` del token
        const usuario_id = decoded.usuario_id;

        // Obtener la fecha del query param
        const { fecha } = req.query;
        let query = `
            SELECT r.id, r.fecha, c.categoria, c.subcategoria, r.monto, r.estatus 
            FROM cgg_Registros r
            INNER JOIN cgg_Catalogos c ON r.catalogo_id = c.id
            WHERE r.usuario_id = ?
        `;
        let params = [usuario_id];

        // Si hay fecha, agregar filtro
        if (fecha) {
            query += " AND r.fecha = ?";
            params.push(fecha);
        }

        const [gastosRows] = await pool.query(query, params);

        res.status(200).json({ gastos: gastosRows });

    } catch (error) {
        console.error("Error al obtener los gastos:", error);
        res.status(500).json({ message: "Error en el servidor al obtener los gastos" });
    }
};

export const UpdateGasto = async (req, res) => {
    try {
        // Obtener token del encabezado
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: "Acceso no autorizado, token requerido" });
        }

        // Verificar si el token es válido
        const token = authHeader.split(" ")[1];
        let decoded;
        try {
            decoded = jwt.verify(token, SECRET_KEY);
        } catch (err) {
            return res.status(403).json({ message: "Token inválido o expirado" });
        }

        // Obtener `usuario_id` del token
        const usuario_id = decoded.usuario_id;

        // Obtener el ID del gasto
        const { id } = req.params;
        const { monto, estatus, metodo_pago_usuario_id } = req.body;

        // Validaciones básicas
        if (!monto && !estatus && !metodo_pago_usuario_id) {
            return res.status(400).json({ message: "Debe proporcionar al menos un campo para actualizar" });
        }

        // Construir consulta dinámica
        let fields = [];
        let params = [];
        if (monto) {
            fields.push("monto = ?");
            params.push(monto);
        }
        if (estatus) {
            fields.push("estatus = ?");
            params.push(estatus);
        }
        if (metodo_pago_usuario_id) {
            fields.push("metodo_pago_usuario_id = ?");
            params.push(metodo_pago_usuario_id);
        }

        params.push(id, usuario_id);

        const query = `UPDATE cgg_Registros SET ${fields.join(", ")} WHERE id = ? AND usuario_id = ?`;
        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Gasto no encontrado o sin permisos" });
        }

        res.status(200).json({ message: "Gasto actualizado correctamente" });

    } catch (error) {
        console.error("Error al actualizar el gasto:", error);
        res.status(500).json({ message: "Error en el servidor al actualizar el gasto" });
    }
};

export const DeleteGasto = async (req, res) => {
    try {
        // Obtener token del encabezado
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: "Acceso no autorizado, token requerido" });
        }

        // Verificar token
        const token = authHeader.split(" ")[1];
        let decoded;
        try {
            decoded = jwt.verify(token, SECRET_KEY);
        } catch (err) {
            return res.status(403).json({ message: "Token inválido o expirado" });
        }

        // Obtener usuario_id
        const usuario_id = decoded.usuario_id;

        // Obtener el ID del gasto
        const { id } = req.params;

        // Marcar el gasto como inactivo
        const [result] = await pool.query(
            "UPDATE cgg_Registros SET activo = FALSE WHERE id = ? AND usuario_id = ?",
            [id, usuario_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Gasto no encontrado o sin permisos" });
        }

        res.status(200).json({ message: "Gasto eliminado correctamente (oculto de la lista)" });

    } catch (error) {
        console.error("Error al eliminar el gasto:", error);
        res.status(500).json({ message: "Error en el servidor al eliminar el gasto" });
    }
};

export const RestoreGasto = async (req, res) => {
    try {
        // Obtener token del encabezado
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: "Acceso no autorizado, token requerido" });
        }

        // Verificar token
        const token = authHeader.split(" ")[1];
        let decoded;
        try {
            decoded = jwt.verify(token, SECRET_KEY);
        } catch (err) {
            return res.status(403).json({ message: "Token inválido o expirado" });
        }

        // Obtener usuario_id
        const usuario_id = decoded.usuario_id;

        // Obtener el ID del gasto
        const { id } = req.params;

        // Restaurar el gasto (activo = TRUE)
        const [result] = await pool.query(
            "UPDATE cgg_Registros SET activo = TRUE WHERE id = ? AND usuario_id = ?",
            [id, usuario_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Gasto no encontrado o sin permisos" });
        }

        res.status(200).json({ message: "Gasto restaurado correctamente" });

    } catch (error) {
        console.error("Error al restaurar el gasto:", error);
        res.status(500).json({ message: "Error en el servidor al restaurar el gasto" });
    }
};
