import { DataTypes } from "sequelize";

export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      "categories",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(60),
          allowNull: false,
        },
        gender_scope: {
          type: DataTypes.STRING(30),
          allowNull: false,
        },
        min_age: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        max_age: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
      },
      { transaction },
    );

    await queryInterface.sequelize.query(
      `
        ALTER TABLE categories
        ADD CONSTRAINT categories_valid_values
        CHECK (
          char_length(btrim(name)) > 0
          AND char_length(btrim(gender_scope)) > 0
          AND min_age >= 0
          AND (
            max_age IS NULL
            OR (max_age >= 0 AND max_age >= min_age)
          )
        );
      `,
      { transaction },
    );

    await queryInterface.sequelize.query(
      `
        CREATE UNIQUE INDEX categories_name_lower_unique
        ON categories (LOWER(name));
      `,
      { transaction },
    );
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable("categories", { transaction });
  });
}