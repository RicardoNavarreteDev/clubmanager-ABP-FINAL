// Este archivo inserta las categorias iniciales del sistema.
export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.bulkInsert(
      "categories",
      [
        {
          id: 1,
          name: "adulto",
          gender_scope: "mixto",
          min_age: 18,
          max_age: 34,
        },
        {
          id: 2,
          name: "todo competidor",
          gender_scope: "mixto",
          min_age: 18,
          max_age: null,
        },
      ],
      { transaction },
    );

    await queryInterface.sequelize.query(
      "SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));",
      { transaction },
    );
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.sequelize.query(
      "DELETE FROM categories WHERE id IN (1, 2);",
      { transaction },
    );
  });
}
