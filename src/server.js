// Este archivo inicia el servidor HTTP usando la app configurada en app.js.
import "dotenv/config";
import app from './app.js';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "tu_clave_super_secreta") {
  console.error("Define JWT_SECRET en .env con una clave segura de al menos 32 caracteres.");
  process.exit(1);
}

if (String(process.env.JWT_SECRET).length < 32) {
  console.error("JWT_SECRET es demasiado corto. Usa al menos 32 caracteres.");
  process.exit(1);
}

// Usa el puerto configurado o 3000 como valor de respaldo.
const PORT = process.env.PORT || 3000;

// Inicia el servidor HTTP y deja la app escuchando solicitudes.
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
