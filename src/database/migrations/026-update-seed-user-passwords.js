// Este archivo actualiza las passwords seed de admin, coach y player para poder probar login real.
export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.sequelize.query(
      `
        UPDATE users
        SET
          password_hash = CASE id
            WHEN 1 THEN '3b612c75a7b5048a435fb6ec81e52ff92d6d795a8b5a9c17070f6a63c97a53b2'
            WHEN 2 THEN 'f42fb01782c73deeda29d5130c88c10ed5f2d6d1468c2aeacc672ffd1a5e05b9'
            WHEN 3 THEN '247519973b4bbeb9979d08e2b4902004bccdb105017ae17af5047bbd506d5660'
          END,
          updated_at = NOW()
        WHERE id IN (1, 2, 3);
      `,
      { transaction },
    );
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.sequelize.query(
      `
        UPDATE users
        SET
          password_hash = CASE id
            WHEN 1 THEN 'seed_admin_hash'
            WHEN 2 THEN 'seed_coach_hash'
            WHEN 3 THEN 'seed_player_hash'
          END,
          updated_at = NOW()
        WHERE id IN (1, 2, 3);
      `,
      { transaction },
    );
  });
}
