// Este archivo define el modelo Sequelize de la relacion entre jugadores y categorias.
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const PlayerCategory = sequelize.define(
  "PlayerCategory",
  {
    playerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: "player_id",
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: "category_id",
    },
  },
  {
    tableName: "player_categories",
    timestamps: false,
  },
);

export default PlayerCategory;
