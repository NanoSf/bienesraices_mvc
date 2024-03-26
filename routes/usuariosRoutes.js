import express from 'express'; 
import { 
    formularioLogin, 
    formularioRegistro,
    formularioOlvidePassword,
    registrar,
    confirmar,
    resetPassword,
    comprobarToken,
    nuevoPassword,
    autenticar,
    cerrarSesion
} from '../controllers/usuarioController.js';
// Crear la app
const router = express.Router();

//Routing
//! Se puede hacer de esta manera
// router.get('/', function(req,res){
//     res.json({msg: "Respuesta de Tipo Get"});
// });

// router.post('/', function(req,res){
//     res.json({msg: "Respuesta de Tipo Post"});
// });

//! Cuando comparte la misma ruta pero diferente tipo de peticion REST
// router.route('/')
//         .get((req, res) => {
//             res.json({msg: "Respuesta de Tipo Get"});
//         })
//         .post((req, res) => {
//             res.json({msg: "Respuesta de Tipo Post"});
//         });

router.get('/login', formularioLogin);
router.post('/login', autenticar);

//* Cerrar Sesión
router.post('/cerrar-sesion', cerrarSesion)

router.get('/registro', formularioRegistro);
router.post('/registro', registrar);

router.get('/confirmar/:token', confirmar);

router.get('/olvide-password', formularioOlvidePassword);
router.post('/olvide-password', resetPassword);

//* Almacena el nuevo password
router.get('/olvide-password/:token', comprobarToken);
router.post('/olvide-password/:token', nuevoPassword);

export default router;