// Este archivo crea y exporta la conexion principal de Sequelize contra PostgreSQL.
import "dotenv/config";
import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
    dialect: "postgres",
    logging: false,
    pool: {
      max: 10,
      min: 0,
      idle: 10000,
      acquire: 30000,
    },
    dialectOptions: process.env.DB_SSL === "true" ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  },
);

export default sequelize;
