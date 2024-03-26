// const express = require('express'); // Commond JS
import express from 'express'; //Para este tipo de import "type": "module",  en el package.js;
import csurf from 'csurf';
import cookieParser from 'cookie-parser';
import usuarioRoutes from './routes/usuariosRoutes.js';
import propiedadesRoutes from './routes/propiedadesRoutes.js';
import appRoutes from './routes/appRoutes.js';
import apiRoutes from './routes/apiRoutes.js';

import db from './config/db.js';
// Crear la app
const app = express();

// Habilitar lectura de datos de formularios
app.use(express.urlencoded({extended: true}));


// Habilitar cookie parserr
app.use(cookieParser());

// Habilitar el CSRF
app.use(csurf({cookie: true}))

// Conexion a la base de datos
try {
    await db.authenticate();
    db.sync();
    console.log('Conexion correcta a la base de datos');
} catch (error) {
    console.log('Error: ', error);
}
//Habilitar Pug --> Template Engine
app.set('view engine', 'pug')
app.set('view engine', './views');

// Carpeta publica
app.use(express.static('public'));

//! Routing
app.use('/', appRoutes)
app.use('/auth', usuarioRoutes);
app.use('/', propiedadesRoutes);
app.use('/api', apiRoutes);

// Definir un puerto y arrancar el proyecto
const port = process.env.PORT || 3000;
app.listen(port, () =>{
    console.log(`El servidor esta funcionando en el puerto ${port}`);
})