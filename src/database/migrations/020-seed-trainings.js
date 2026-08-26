// Este archivo inserta los entrenamientos iniciales del sistema.
import { trainingSeeds } from "../seed-data.js";
export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.bulkInsert("trainings", trainingSeeds, { transaction });
    await queryInterface.sequelize.query(
      "SELECT setval('trainings_id_seq', (SELECT MAX(id) FROM trainings));",
      { transaction },
    );
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.sequelize.query("DELETE FROM trainings;", { transaction });
  });
}
