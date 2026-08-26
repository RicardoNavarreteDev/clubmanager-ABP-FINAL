// Este archivo inserta los jugadores iniciales del sistema.
import { playerSeeds } from "../seed-data.js";
export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.bulkInsert("players", playerSeeds, { transaction });
    await queryInterface.sequelize.query(
      "SELECT setval('players_id_seq', (SELECT MAX(id) FROM players));",
      { transaction },
    );
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.sequelize.query("DELETE FROM players;", { transaction });
  });
}
