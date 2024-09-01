const express = require('express');
const cors = require('cors'); // se usa cors para permitir conexiones locales
const app = express();
const PORT = 3000;

const userRoutes = require('./routes/users/userRoutes');

app.use(express.json());
app.use(cors());
app.use('/usuarios', userRoutes);

// Correr el Servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
