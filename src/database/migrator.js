// Este archivo configura Umzug para descubrir y ejecutar las migraciones del proyecto.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SequelizeStorage, Umzug } from "umzug";
import sequelize from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrator = new Umzug({
  migrations: {
    glob: ["migrations/*.js", { cwd: __dirname }],
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

export default migrator;
