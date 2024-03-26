import Propiedad from './Propiedad.js';
import Categoria from './Categoria.js';
import Precio from './Precio.js';
import Usuario from './Usuario.js';
import Mensaje from './mensaje.js';

//* Manera uno de hacerlo
// Precio.hasOne(Propiedad);

//* Manera dos de hacerlo
Propiedad.belongsTo(Precio, {foreignKey: 'precioId'});
Propiedad.belongsTo(Categoria, {foreignKey: 'categoriaId'});
Propiedad.belongsTo(Usuario, {foreignKey: 'usuarioId'});
Propiedad.hasMany(Mensaje, {foreignKey: 'propiedadId'})


//* Llaves foraneas mensajes
Mensaje.belongsTo(Propiedad, {foreignKey: 'propiedadId'});
Mensaje.belongsTo(Usuario, {foreignKey: 'usuarioId'});

export{
    Propiedad,
    Precio,
    Categoria,
    Usuario,
    Mensaje
}