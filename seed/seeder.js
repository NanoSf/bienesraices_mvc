import {exit} from 'node:process';
import categorias from "./categorias.js";
import precios from './precios.js';
import usuarios from './usuarios.js';
import {Categoria, Precio, Usuario} from '../models/index.js';
import db from "../config/db.js";

const importatDatos = async () => {
    try {
        //* Autenticar
        await db.authenticate();

        //* Generar las columnas
        await db.sync();

        //* Insertar los datos
        await Promise.all([Categoria.bulkCreate(categorias),Precio.bulkCreate(precios)], Usuario.bulkCreate(usuarios));

        exit();
    } catch (error) {
       console.log(error); 
       exit(1);
    }
}

const eliminarDatos = async () => {
    try {
        //* Manera uno de hacerlo
        // await Promise.all([
        //     Categoria.destroy({where: {}, truncate: true}),
        //     Precio.destroy({where: {}, truncate: true})
        // ]);

        //* Manera dos de hacerlo
        await db.sync({force: true});
        console.log('Datos Eliminados Correctamente');
        exit();
    } catch (error) {
        console.log(error);
        exit(1);
    }
}

if(process.argv[2] == '-i'){
    importatDatos();
}

if(process.argv[2] == '-e'){
    eliminarDatos();
}


