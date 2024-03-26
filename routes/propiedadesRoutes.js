import express from "express";
import {body} from 'express-validator';
import {
    admin, 
    crear, 
    guardar, 
    eliminar, 
    cambiarEstado,
    agregarImagenes,
    almacenarImagen,
    editar,
    guardarCambios,
    mostrarPropiedad,
    enviarMensaje,
    verMensajes
} from "../controllers/propiedadControllers.js";
import protegerRuta from "../middleware/protegerRuta.js";
import upload from '../middleware/subirImagen.js';
import identificarUsuario from "../middleware/identificarUsuario.js";

const router = express.Router();

router.get('/mis-propiedades', protegerRuta, admin);
router.get('/propiedades/crear', protegerRuta, crear);
router.post('/propiedades/crear', protegerRuta,
    body('titulo').notEmpty().withMessage('El Titulo del Anuncio Es Obligatorio'),
    body('descripcion')
        .notEmpty().withMessage('La descripcion no puede ir vacia')
        .isLength({max: 200}).withMessage('La descripcion es demaciado larga'),
    body('categoria').isNumeric().withMessage('Selecciona una categoria'),
    body('precio').isNumeric().withMessage('Selecciona un rango precio'),
    body('habitaciones').isNumeric().withMessage('Selecciona la cantidad de habitaciones'),
    body('estacionamiento').isNumeric().withMessage('Selecciona la cantidad de estacionamientos'),
    body('wc').isNumeric().withMessage('Selecciona la cantidad de baños'),
    body('lat').notEmpty().withMessage('Ubica la propiedad en el mapa'),
    guardar
);
router.get('/propiedades/agregar-imagen/:id', protegerRuta, agregarImagenes);
router.post('/propiedades/agregar-imagen/:id', 
    protegerRuta,
    upload.single('imagen'),
    almacenarImagen
);

router.get('/propiedades/editar/:id', protegerRuta, editar)
router.post('/propiedades/editar/:id', protegerRuta,
    body('titulo').notEmpty().withMessage('El Titulo del Anuncio Es Obligatorio'),
    body('descripcion')
        .notEmpty().withMessage('La descripcion no puede ir vacia')
        .isLength({max: 200}).withMessage('La descripcion es demaciado larga'),
    body('categoria').isNumeric().withMessage('Selecciona una categoria'),
    body('precio').isNumeric().withMessage('Selecciona un rango precio'),
    body('habitaciones').isNumeric().withMessage('Selecciona la cantidad de habitaciones'),
    body('estacionamiento').isNumeric().withMessage('Selecciona la cantidad de estacionamientos'),
    body('wc').isNumeric().withMessage('Selecciona la cantidad de baños'),
    body('lat').notEmpty().withMessage('Ubica la propiedad en el mapa'),
    guardarCambios
);

router.post('/propiedades/eliminar/:id', protegerRuta, eliminar);

router.put('/propiedades/:id', 
    protegerRuta,
    cambiarEstado
)

//* Area publica
router.get('/propiedad/:id', 
    identificarUsuario,
    mostrarPropiedad
);

router.post('/propiedad/:id',
    identificarUsuario,
    body('mensaje').isLength({min: 10}).withMessage('El mensaje no puede ir vacio o es muy corto'),
    enviarMensaje
);

router.get('/mensajes/:id',
    protegerRuta,
    verMensajes
);

export default router;