// Este archivo revierte la ultima migracion aplicada en la base de datos.
import sequelize from "../config/db.js";
import migrator from "./migrator.js";

try {
  await sequelize.authenticate();

  const migration = await migrator.down();

  if (!migration) {
    console.log("No hay migraciones para revertir.");
  } else {
    console.log(`Migración revertida: ${migration.name}`);
  }
} catch (error) {
  console.error("Error al revertir migración:", error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
