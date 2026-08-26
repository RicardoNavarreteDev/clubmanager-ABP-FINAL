// Este archivo inserta los campeonatos iniciales del sistema.
import { championshipSeeds } from "../seed-data.js";
export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.bulkInsert("championships", championshipSeeds, {
      transaction,
    });
    await queryInterface.sequelize.query(
      "SELECT setval('championships_id_seq', (SELECT MAX(id) FROM championships));",
      { transaction },
    );
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.sequelize.query("DELETE FROM championships;", {
      transaction,
    });
  });
}
