import { Router } from "express";
import { 
    CreateUser, 
    AddMetodoPago, 
    Login, 
    GetGastos, 
    GetCatalogos, 
    AddGasto, 
    GetGastosByFecha, 
    UpdateGasto, 
    DeleteGasto, 
    RestoreGasto,
    GetMetodosPago
} from '../controllers/ControlGastos.controllers.js';

const router = Router();

// Usuarios
router.post('/CGG/CreateUser', CreateUser);
router.post('/CGG/Login', Login);

// Métodos de pago
router.post('/CGG/AddMetodoPago', AddMetodoPago);

// Gastos
router.post('/CGG/AddGasto', AddGasto);
router.get('/CGG/GetGastos', GetGastos);
router.get('/CGG/GetGastosByFecha', GetGastosByFecha); // Filtrar por fecha
router.put('/CGG/UpdateGasto/:id', UpdateGasto); // Modificar gasto
router.delete('/CGG/DeleteGasto/:id', DeleteGasto); // Eliminar (marcar como inactivo)
router.put('/CGG/RestoreGasto/:id', RestoreGasto); // Restaurar un gasto eliminado

// Catálogos
router.get('/CGG/GetCatalogos', GetCatalogos);
// Rutas de métodos de pago
router.get('/CGG/GetMetodosPago', GetMetodosPago);
export default router;
