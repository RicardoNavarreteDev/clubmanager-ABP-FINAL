// Este archivo ejecuta todas las migraciones pendientes contra la base de datos.
import sequelize from "../config/db.js";
import migrator from "./migrator.js";

try {
  await sequelize.authenticate();

  const migrations = await migrator.up();

  if (migrations.length === 0) {
    console.log("No hay migraciones pendientes.");
  } else {
    console.log(`Migraciones aplicadas: ${migrations.length}`);
  }
} catch (error) {
  console.error("Error al ejecutar migraciones:", error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
