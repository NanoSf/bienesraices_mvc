import { check, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';

import Usuario from '../models/Usuario.js';
import { generarId, generarJWT } from '../helpers/tokens.js';
import { emailRegistro, emailOlvidePassword } from '../helpers/email.js';

const formularioLogin = (req, res) => {
    res.render('auth/login.pug', {
        pagina: 'Iniciar Sesión',
        csrfToken: req.csrfToken()
    });
};

const autenticar = async(req, res) => {
    //* Validacion
    await check('email').isEmail().withMessage('El email es obligatorio').run(req);
    await check('password').notEmpty().withMessage('El Password es Obligatorio').run(req);

    //* Obteniendo el resultado de las validaciones
    let resultado = validationResult(req);

    //* Verificar que el formulario no tenga errores
    if (!resultado.isEmpty()) {
        return res.render('auth/login.pug', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
        });
    }

    const {email, password} = req.body;
    //* Comprobar si el usuario existe
    const usuario = await Usuario.findOne({where: {email}});

    if (!usuario) {
        return res.render('auth/login.pug', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El usuario no existe'}],
        });
    }

    if (!usuario.confirmado) {
        return res.render('auth/login.pug', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'Tu Cuenta no ha sido Confirmada'}],
        });
    }

    //* Revisar el password
    if(!usuario.verificarPassword(password)){
        return res.render('auth/login.pug', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El Password es Incorrecto'}],
        });
    }

    //* Autenticar
    const token = generarJWT({id: usuario.id, nombre: usuario.nombre});

    //* Almacenat Token en un cookie
    return res.cookie('_token',token, {
        httpOnly: true,
        secure: true,
        sameSite: true
    }).redirect('/mis-propiedades');
}

const cerrarSesion = (req,res) => {
    return res.clearCookie('_token').status(200).redirect('/auth/login');
}

const formularioRegistro = (req, res) => {
    
    res.render('auth/registro.pug', {
        pagina: 'Crear cuenta',
        csrfToken: req.csrfToken()
    });
};

const registrar= async (req, res) => {
    
    //* Validando
    await check('nombre').notEmpty().withMessage('El Nombre es obligatorio').run(req);
    await check('email').isEmail().withMessage('Eso no parese un email').run(req);
    await check('password').isLength({min: 6}).withMessage('El password debe ser de almenos 6 caracteres').run(req);
    await check('repetir_password').equals(req.body.password).withMessage('Los Passwords no coinciden').run(req);

    //* Obteniendo el resultado de las validaciones
    let resultado = validationResult(req);

    //* Verificar que el formulario no tenga errores
    if (!resultado.isEmpty()) {
        return res.render('auth/registro.pug', {
            pagina: 'Crear cuenta',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        });
    }

    //* Extraer los datos
    const {nombre, email, password} = req.body;

    //* Verificar que el usuario no este duplicado
    const existeUsuario = await Usuario.findOne({where: {email}});
    
    if (existeUsuario) {
        return res.render('auth/registro.pug', {
            pagina: 'Crear cuenta',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El Usuario ya esta Registrado'}],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        });
    }

    //* Almacenar usuario
    const usuario = await Usuario.create({
        nombre, 
        email,
        password,
        token: generarId()
    });

    //* Envia email de confirmacion
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    });

    //* Mostrar mensaje de confirmacion
    res.render('../views/templates/mensaje.pug', {
        pagina: 'Cuenta Creada Correctamente',
        mensaje: 'Hemos Enviado un Email de Confirmacion, presiona en el enlace'
    });


}

const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-password.pug', {
        pagina: 'Recuperar tu acceso a Bienes Raices',
        csrfToken: req.csrfToken()
    });
};

//* Funcion que comprueba la cuenta
const confirmar = async (req,res) => {
    const {token} = req.params;
    
    //* Verificar si el token es valido
    const usuario = await Usuario.findOne({where: {token}});

    
    if (!usuario) {
        return res.render('auth/confirmar-cuenta.pug',{
            pagina: 'Error al confirmar tu cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error: true
        })
    }

    //* Confirmar
    usuario.token = null;
    usuario.confirmado = true;
    await usuario.save();

    return res.render('auth/confirmar-cuenta.pug',{
        pagina: 'Cuenta confirmada',
        mensaje: 'La cuenta se confirmo correctamente',
        error: false
    })
}

//* olvide contraseña
const resetPassword = async (req, res) => {
    //* Validando
    await check('email').isEmail().withMessage('Eso no parese un email').run(req);
 
    //* Obteniendo el resultado de las validaciones
    let resultado = validationResult(req);
 
    //* Verificar que el formulario no tenga errores
    if (!resultado.isEmpty()) {
        return res.render('auth/olvide-password.pug', {
            pagina: 'Recuperar tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        });
    }

    //* Buscar al usuario
    const {email} = req.body;

    const usuario = await Usuario.findOne({where: {email}});

    if(!usuario){
        return res.render('auth/olvide-password.pug', {
            pagina: 'Recuperar tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El email no pertenece a ningun usuario'}]
        });
    }

    //* Generar un token y enviar un email
    usuario.token = generarId();
    await usuario.save();

    //* Enviar un email
    emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token
    });

    //* Reenderizar email
    res.render('../views/templates/mensaje.pug', {
        pagina: 'Restablece tu Password',
        mensaje: 'Hemos Enviado un Email con las instrucciones'
    });
};

const comprobarToken = async (req,res) =>{
    const {token} = req.params;
    const usuario = await Usuario.findOne({where: {token}});
    
    if (!usuario) {
        return res.render('auth/confirmar-cuenta.pug',{
            pagina: 'Reestablece tu Password',
            mensaje: 'Hubo un error al validar tu infomarmacion intenta de nuevo',
            error: true
        })
    }

    //* Mostrar formulario para modificar password
    res.render('auth/reset-password.pug',{
        pagina: 'Reestablece Tu Password',
        csrfToken: req.csrfToken(),
    });
}

const nuevoPassword = async (req,res) =>{
    //* Validando el password
    await check('password').isLength({min: 6}).withMessage('El password debe ser de almenos 6 caracteres').run(req);
 
    //* Obteniendo el resultado de las validaciones
    let resultado = validationResult(req);

    //* Verificar que el formulario no tenga errores
    if (!resultado.isEmpty()) {
        return res.render('auth/reset-password.pug', {
            pagina: 'Reestablece tu password',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        });
    }
    
    const {token} = req.params;
    const {password} = req.body;
    
    //* Identificar quien hace el cambio
    const usuario = await Usuario.findOne({where: {token}});
    
    //* Hashear el nuevo password
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt);
    usuario.token = null;
    console.log('EINERRR');
    await usuario.save();
    
    res.render('auth/confirmar-cuenta.pug',{
        pagina: 'Password Restablecido',
        mensaje: 'El password se guardó correctamente'
    });
}


export {
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
}