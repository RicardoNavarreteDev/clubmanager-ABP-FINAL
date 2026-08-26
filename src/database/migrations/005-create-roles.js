// Este archivo crea la tabla de roles.
import { DataTypes } from "sequelize";
export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      "roles",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(40),
          allowNull: false,
        },
      },
      { transaction },
    );

    await queryInterface.sequelize.query(
      `
        ALTER TABLE roles
        ADD CONSTRAINT roles_valid_values
        CHECK (char_length(btrim(name)) > 0);
      `,
      { transaction },
    );

    await queryInterface.sequelize.query(
      `CREATE UNIQUE INDEX roles_name_lower_unique ON roles (LOWER(name));`,
      { transaction },
    );
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable("roles", { transaction });
  });
}
