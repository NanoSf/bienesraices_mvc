import { unlink } from "node:fs/promises";
import { validationResult } from "express-validator";
import { Precio, Categoria, Propiedad, Mensaje, Usuario } from "../models/index.js";
import { log } from "node:console";
import { esVendedor, formatearFecha } from "../helpers/index.js";


const admin = async (req, res) => {
    //* Leer queryString
    const { pagina: paginaActual } = req.query;
    const expresion = /^[1-9]$/;

    if (!expresion.test(paginaActual)) {
        return res.redirect("/mis-propiedades?pagina=1");
    }

    try {
        const { id } = req.usuario;

        //* Limites y Offset para el paginador
        const limit = 10;
        const offset = ((paginaActual * limit) - limit);

        const [propiedades, total] = await Promise.all([
            Propiedad.findAll({
                limit,
                offset,
                where: {
                    usuarioId: id,
                },
                include: [
                    { model: Categoria, as: "categoria" },
                    { model: Precio, as: "precio" },
                    { model: Mensaje, as: "mensajes" }
                ]
            }),
            Propiedad.count({
                where: {
                    usuarioId: id
                }
            })
        ])
        
        res.render("propiedades/admin.pug", {
            pagina: "Mis Propiedades",
            propiedades,
            csrfToken: req.csrfToken(),
            paginas: Math.ceil(total / limit),
            paginaActual: Number(paginaActual),
            total,
            offset,
            limit
        });
    } catch (error) {
        console.log(error);
    }
};

/** Formulario para crear una nueva propiedad **/
const crear = async (req, res) => {
    //* Consultar modelo de Precio y Categoria
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll(),
    ]);

    res.render("propiedades/crear.pug", {
        pagina: "Crear Propiedad",
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: {},
    });
};

const guardar = async (req, res) => {
    //* Resultado Validacion
    let resultado = validationResult(req);

    if (!resultado.isEmpty()) {
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll(),
        ]);

        return res.render("propiedades/crear.pug", {
            pagina: "Crear propiedad",
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body,
        });
    }

    // Crear un registro
    const {
        titulo,
        descripcion,
        habitaciones,
        estacionamiento,
        wc,
        calle,
        lat,
        lng,
        precio: precioId,
        categoria: categoriaId,
    } = req.body;
    const { id: usuarioId } = req.usuario;
    try {
        const propiedadGuardada = await Propiedad.create({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId,
            usuarioId,
            imagen: "",
        });

        const { id } = propiedadGuardada;

        res.redirect(`/propiedades/agregar-imagen/${id}`);
    } catch (error) {
        console.log(error);
    }
};

const cambiarEstado = async (req,res) => {
    const { id } = req.params;

    //* Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    if (!propiedad) {
        return res.redirect("/mis-propiedades");
    }

    //* Revisar que quien visita la URL, es quien creo la propiedad
    if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect("/mis-propiedades");
    }

    //* Actualizar
    propiedad.publicado = !propiedad.publicado;
    await propiedad.save();

    res.json({
        resultado: 'ok'
    });
}

const eliminar = async (req, res) => {
    const { id } = req.params;

    //* Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    if (!propiedad) {
        return res.redirect("/mis-propiedades");
    }

    //* Revisar que quien visita la URL, es quien creo la propiedad
    if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect("/mis-propiedades");
    }

    //* Eliminar imagen asociada
    await unlink(`public/uploads/${propiedad.imagen}`);

    //* Eliminar la propiedad
    await propiedad.destroy();
    res.redirect("/mis-propiedades");
};

const agregarImagenes = async (req, res) => {
    const { id } = req.params;

    //* Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    if (!propiedad) {
        return res.redirect("/mis-propiedades");
    }
    //* Validar que no este publicada
    if (propiedad.publicado) {
        return res.redirect("/mis-propiedades");
    }

    //* Validar que la propiedad pertenece a quien pertenece esta pagina
    if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect("/mis-propiedades");
    }

    res.render("propiedades/agregar-imagen.pug", {
        pagina: `Agregar Imagen: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        propiedad,
    });
};

const almacenarImagen = async (req, res, next) => {
    const { id } = req.params;

    //* Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    if (!propiedad) {
        return res.redirect("/mis-propiedades");
    }
    //* Validar que no este publicada
    if (propiedad.publicado) {
        return res.redirect("/mis-propiedades");
    }

    //* Validar que la propiedad pertenece a quien pertenece esta pagina
    if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect("/mis-propiedades");
    }

    try {
        //* Almacenar la imagen y publicar la propiedad
        propiedad.imagen = req.file.filename;
        propiedad.publicado = 1;

        await propiedad.save();

        next();
    } catch (error) {
        console.log(error);
    }
};

const editar = async (req, res) => {
    const { id } = req.params;
    //* Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    if (!propiedad) {
        return res.redirect("/mis-propiedades");
    }

    //* Revisar que quien visita la URL, es quien creo la propiedad
    if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect("/mis-propiedades");
    }

    //* Consultar modelo de Precio y Categoria
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll(),
    ]);

    res.render("propiedades/editar.pug", {
        pagina: `Editar Propiedad: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: propiedad,
    });
};

const guardarCambios = async (req, res) => {
    //* Verificar la validacion
    let resultado = validationResult(req);

    if (!resultado.isEmpty()) {
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll(),
        ]);

        return res.render("propiedades/editar.pug", {
            pagina: "Editar Propiedad",
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            datos: req.body,
            errores: resultado.array(),
        });
    }

    //* Validar que la propiedad exista
    const { id } = req.params;
    const propiedad = await Propiedad.findByPk(id);

    if (!propiedad) {
        return res.redirect("/mis-propiedades");
    }

    //* Revisar que quien visita la URL, es quien creo la propiedad
    if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect("/mis-propiedades");
    }

    //* Reescribir el objeto y actualizar
    try {
        const {
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precio: precioId,
            categoria: categoriaId,
        } = req.body;
        propiedad.set({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId,
        });

        await propiedad.save();
        res.redirect("/mis-propiedades");
    } catch (error) {
        console.log(error);
    }
};

//* Muestra una propiedad
const mostrarPropiedad = async (req, res) => {
    const { id } = req.params;

    //* Comprobar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            { model: Categoria, as: "categoria" },
            { model: Precio, as: "precio" },
        ],
    });

    if (!propiedad || !propiedad.publicado) {
        return res.redirect("/404");
    }



    res.render("propiedades/mostrar.pug", {
        propiedad,
        pagina: propiedad.titulo,
        csrfToken: req.csrfToken(),
        usuario: req.usuario,
        esVendedor: esVendedor(req.usuario?.id,propiedad.usuarioId)
    });
};


const enviarMensaje = async (req, res) => {
    const { id } = req.params;

    //* Comprobar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            { model: Categoria, as: "categoria" },
            { model: Precio, as: "precio" },
        ],
    });

    if (!propiedad) {
        return res.redirect("/404");
    }

    //* Renderizar los errores
    let resultado = validationResult(req);

    if (!resultado.isEmpty()) {
        return res.render("propiedades/mostrar.pug", {
            propiedad,
            pagina: propiedad.titulo,
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            esVendedor: esVendedor(req.usuario?.id,propiedad.usuarioId),
            errores: resultado.array()
        });
    }

    const { mensaje } = req.body;
    const { id: propiedadId } = req.params;
    const { id: usuarioId } = req.usuario;

    //* Almacenar mensaje
    await Mensaje.create({
        mensaje,
        propiedadId,
        usuarioId
    })


    res.redirect('/');
};


//* Leer mensajes recibidos
const verMensajes = async (req,res) => {
    const { id } = req.params;

    //* Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id,{
        include: [{
            model: Mensaje, as: 'mensajes',
            include: [
                {model: Usuario.scope('eliminarPassword'), as: 'usuario'}
            ]
        }]
    });

    if (!propiedad) {
        return res.redirect("/mis-propiedades");
    }

    //* Revisar que quien visita la URL, es quien creo la propiedad
    if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect("/mis-propiedades");
    }

    res.render('propiedades/mensajes.pug', {
        pagina: 'Mensajes',
        mensajes: propiedad.mensajes,
        formatearFecha
    })
}

export {
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
};
