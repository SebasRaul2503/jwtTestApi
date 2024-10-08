const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { sql, poolPromise} = require('../../database/connection');

/*
    Imaginemos que queremos registrar un usuario en una Base de Datos (estamos usando ms sql server)
    para lo cual sera necesario pasar la data que necesita la empresa, como:
    nombre
    correo
    contraseña
    rol (para efectos simples, trabajaremos con rol 2 que es nuestro rol de usuario comun en BD)

    El mandar datos al servidor significa que tendremos que usar un metodo POST
    para ingresar estos datos.
    Imaginemos nuestro caso, estos seran nuestros datos:
    Sebastian Apellido
    correoSebastian@mail.com
    y la contraseña segura sera: sebas*The$One04#

    Para pasarlos a base de datos, deberemos asegurarnos que
    los datos del correo, sean realmente un correo, mientras que
    la contraseña cumpla con los requisitos de tener longitud
    minima de 10 caracteres, un caracter especial, un numero y
    letras mayusculas y minisculas.

    en base de datos, a modo de ejemplo, usaremos un 
    Vamos al codigo
*/
router.post('/agregarUsuario', async(req, res) => {
    try{
        //cuerpo de la solicitud
        const { NOMBRE, CORREO, CONTRASENA} = req.body;

        // Validaciones de correo y contraseña
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(CORREO)) {
            return res.status(400).send('El correo no tiene un formato valido.');
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
        if (!passwordRegex.test(CONTRASENA)) {
            return res.status(400).send('La contraseña no cumple con los requisitos minimos.');
        }

        //se encrypta la contraseña con bcrypt
        const hashedPassword = await bcrypt.hash(CONTRASENA, 10);

        const pool = await poolPromise;

        await pool.request()
        .input('nombre', sql.NVarChar, NOMBRE)
        .input('email', sql.NVarChar, CORREO)
        .input('password', sql.NVarChar, hashedPassword)
        .input('rol_id', sql.Int, 2) // id 2 = Usuario
        .execute('sp_RegistrarUsuario');// sp correspondiente

        res.status(200).send('Usuario agregado exitosamente.');
        /*
            la ruta seria:
            http://localhost:3000/usuarios/agregarUsuario
            tipo de solicitud: POST
            cuerpo en JSON:
            {
                "NOMBRE": "Sebastian Apellido",
                "CORREO": "correoSebastian@mail.com"
                "CONTRASENA": secure74*drowssap
                "ID_ROL": 2
            }
        */
    }
    catch{
        res.status(500).send('Error al agregar el usuario');
    }
});



/*
    Imaginemos que necesitamos obtener data de un usuario en especifico
    (Esto obviamente no lo haria cualquier usuario en una aplicacion, solo
     una persona que tenga permitido el acceso a esta informacion con credenciales,
     como por ejemplo, el usuario con sus credenciales)
    Para esto, usaremos metodos POST para poder obtener toda la data del usuario
    Ejemplo inicial:

    Necesitamos pasar:
    - email (correo)
    - contraseña (password)

    Necesitamos retornar:
    - id_usuario
    - nombre
    - correo
    - rol

    Para ello, usaremos un procedimiento almacenado que
    verifique la existencia del correo mientras que el
    backend (la api), se encarga de validar la contraseña
*/
router.post('/loginUsuario', async (req, res) => {
    try {
        const { CORREO, CONTRASENA } = req.body;

        const pool = await poolPromise;

        const result = await pool.request()
            .input('email', sql.NVarChar, CORREO)
            .execute('sp_IniciarSesion');

        const user = result.recordset[0];

        if (user && user.password) {
            const validPassword = await bcrypt.compare(CONTRASENA, user.password);

            if (validPassword) { // Contraseña valida = devolvemos la data del usuario
                res.status(200).json({// sin jwt
                    message: 'Inicio de sesion exitoso',
                    user: {
                        id: user.id,
                        nombre: user.nombre,
                        email: user.email,
                        rol_id: user.rol_id
                    }
                });
            }
        } else {
            // Usuario inexistente o credenciales incorrectas
            res.status(401).send('Usuario o contraseña incorrectos');
        }

        /*
            la ruta seria:
            http://localhost:3000/usuarios/loginUsuario
            tipo de solicitud: POST
            cuerpo en JSON:
            {
                "CORREO": "correoSebastian@mail.com"
                "CONTRASENA": secure74*drowssap
            }
        */
    } catch (error) {
        res.status(500).send('Error en el inicio de sesion');
    }
});



/*
    Mismo ejemplo que el anterior, pero de manera mas segura, usando JSON Web Token
*/
router.post('/loginUsuarioJwt', async(req, res) =>{
    try{
        const { CORREO, CONTRASENA } = req.body;

        const pool = await poolPromise;

        const result = await pool.request()
        .input('email', sql.NVarChar, CORREO)
        .execute('sp_IniciarSesion');

        const user = result.recordset[0];

        if (user && user.password) {
            const validPassword = await bcrypt.compare(CONTRASENA, user.password);

            if (validPassword) {

                const token = jwt.sign( // se devuelve un token jwt
                    {
                        id: user.id,
                        nombre: user.nombre,
                        email: user.email,
                        rol_id: user.rol_id
                    },
                    process.env.SECRET_KEY,
                    {
                        expiresIn: '1h'
                    } // Configuraciones adicionales del token
                );

                res.status(200).json({
                    message: 'Inicio de sesión exitoso',
                    token: token
                });
            }
        } else {
            // Usuario inexistente o credenciales incorrectas
            res.status(401).send('Usuario o contraseña incorrectos');
        }
    }
    catch (error){
        console.error(error);
        res.status(500).send('Error en el inicio de sesion');
    }
});

module.exports = router;