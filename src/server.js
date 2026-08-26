// Este archivo inicia el servidor HTTP usando la app configurada en app.js.
import app from './app.js';
import dotenv from 'dotenv';

// Carga las variables de entorno definidas en .env.
dotenv.config();

// Usa el puerto configurado o 3000 como valor de respaldo.
const PORT = process.env.PORT || 3000;

// Inicia el servidor HTTP y deja la app escuchando solicitudes.
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
