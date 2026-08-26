// Este archivo crea la tabla de usuarios.
import { DataTypes } from "sequelize";
export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      "users",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        email: {
          type: DataTypes.STRING(160),
          allowNull: false,
        },
        password_hash: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      { transaction },
    );

    await queryInterface.sequelize.query(
      `
        ALTER TABLE users
        ADD CONSTRAINT users_valid_values
        CHECK (
          char_length(btrim(email)) > 0
          AND POSITION('@' IN email) > 1
          AND char_length(btrim(password_hash)) > 0
        );
      `,
      { transaction },
    );

    await queryInterface.sequelize.query(
      `CREATE UNIQUE INDEX users_email_lower_unique ON users (LOWER(email));`,
      { transaction },
    );
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable("users", { transaction });
  });
}
