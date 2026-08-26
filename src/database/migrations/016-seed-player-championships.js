// Este archivo inserta las relaciones iniciales entre jugadores y campeonatos.
import { playerChampionshipSeeds } from "../seed-data.js";
export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.bulkInsert(
      "player_championships",
      playerChampionshipSeeds,
      { transaction },
    );
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.sequelize.query("DELETE FROM player_championships;", {
      transaction,
    });
  });
}
