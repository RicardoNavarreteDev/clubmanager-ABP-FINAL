// Este archivo inserta los partidos iniciales del sistema.
import { matchSeeds } from "../seed-data.js";
export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.bulkInsert("matches", matchSeeds, { transaction });
    await queryInterface.sequelize.query(
      "SELECT setval('matches_id_seq', (SELECT MAX(id) FROM matches));",
      { transaction },
    );
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.sequelize.query("DELETE FROM matches;", { transaction });
  });
}
