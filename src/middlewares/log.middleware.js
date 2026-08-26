// Este archivo guarda en disco cada acceso a la ruta /status.
import { appendFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// En ES Modules reconstruimos __filename y __dirname manualmente.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Desde src/middlewares subimos hasta la raiz y apuntamos a logs/log.txt.
const logFilePath = path.join(__dirname, "../../logs/log.txt");

export const logRouteAccess = async (req, res, next) => {
  const now = new Date();

  // Guardamos una linea simple con fecha, hora y ruta visitada.
  const logLine = `${now.toLocaleDateString()} ${now.toLocaleTimeString()} - ${req.originalUrl}\n`;

  // appendFile agrega el texto al final del archivo sin borrar lo anterior.
  await appendFile(logFilePath, logLine);

  // next() permite que Express siga hacia el siguiente middleware o handler.
  next();
};
