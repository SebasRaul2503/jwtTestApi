const sql = require('mssql');
require('dotenv').config();

// Configuracion para la utilizacion de MS SQL Server
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true // Deja esto en true para desarrollo local
  }
};

const poolPromise = sql.connect(config)
  .then(pool => {
    console.log('Conexion correcta a SQL Server');
    return pool;
  })
  .catch(err => {
    console.error('Conexion Fallida, error a detalle: ', err);
    throw err;
  });

module.exports = {
  sql, poolPromise
};
