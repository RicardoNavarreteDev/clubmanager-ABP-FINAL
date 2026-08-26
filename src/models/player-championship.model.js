// Este archivo define el modelo Sequelize de la relacion entre jugadores y campeonatos.
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const PlayerChampionship = sequelize.define(
  "PlayerChampionship",
  {
    playerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: "player_id",
    },
    championshipId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: "championship_id",
    },
  },
  {
    tableName: "player_championships",
    timestamps: false,
  },
);

export default PlayerChampionship;
