# jwtTestApi (gestion simple de usuarios)

Esta API proporciona funcionalidades basicas (demasiado basicas, en serio) para el registro y autenticación de usuarios. Esta desarrollada en Node.js y utiliza SQL Server como base de datos.

## Rutas de la API

- **POST /usuarios/agregarUsuario**: Registra un nuevo usuario en la base de datos.
- **POST /usuarios/loginUsuario**: Autentica a un usuario utilizando sus credenciales (usuario y contraseña).
- **POST /usuarios/loginUsuarioJwt**: Autentica a un usuario y devuelve un token JWT para sesiones basadas en tokens.

## Requisitos

- Node.js (se uso la version 20.17.0)
- SQL Server (se uso la version 2022)
- npm (Node Package Manager)

## Instalación

1. Clonar el repositorio
2. Navegar hacia nodeApi, que es la carpeta en la cual se encuentra el proyecto Node.js
3. En la linea de comandos, sera necesario instalar las dependencias con **npm install**
4. Tambien sera necesario crear la base de datos, el archivo se encuentra en **/nodeApi/databaseCreation/SQLQuery1.sql**, contiene la mini-base de datos que utilice para esta API.
5. Finalmente, solo hara falta correr el proyecto en la linea de comandos con **node app.js**
