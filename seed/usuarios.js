import bcrypt from 'bcrypt';

const usuarios = [{
    nombre: 'Einer',
    email: 'einer@correo.com',
    confirmado: 1,
    password: bcrypt.hashSync('12345', 10)
}]

export default usuarios;