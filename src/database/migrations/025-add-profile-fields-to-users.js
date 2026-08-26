// Este archivo agrega a usuarios los campos extra necesarios para mostrar el perfil.
import { DataTypes } from "sequelize";
export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.addColumn(
      "users",
      "display_name",
      {
        type: DataTypes.STRING(120),
        allowNull: true,
      },
      { transaction },
    );

    await queryInterface.addColumn(
      "users",
      "avatar",
      {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      { transaction },
    );

    await queryInterface.addColumn(
      "users",
      "bio",
      {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      { transaction },
    );

    await queryInterface.addColumn(
      "users",
      "location",
      {
        type: DataTypes.STRING(120),
        allowNull: true,
      },
      { transaction },
    );

    await queryInterface.addColumn(
      "users",
      "birth_date",
      {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      { transaction },
    );

    await queryInterface.sequelize.query(
      `
        UPDATE users
        SET
          display_name = CASE id
            WHEN 1 THEN 'Admin Club Prueba'
            WHEN 2 THEN 'Camila Torres'
            WHEN 3 THEN 'Ricardo Navarrete'
          END,
          avatar = CASE id
            WHEN 1 THEN '/images/avatars/club.svg'
            WHEN 2 THEN '/images/avatars/coach-1.svg'
            WHEN 3 THEN '/images/avatars/profile.svg'
          END,
          bio = CASE id
            WHEN 1 THEN 'Administracion general del club y gestion del equipo.'
            WHEN 2 THEN 'Entrenadora principal enfocada en el desarrollo competitivo del plantel.'
            WHEN 3 THEN 'Jugador y referente del equipo. Enfocado en competir, entrenar y seguir fortaleciendo la identidad de Club Prueba dentro y fuera de la cancha.'
          END,
          location = CASE id
            WHEN 1 THEN 'Club Prueba'
            WHEN 2 THEN 'Santiago, Chile'
            WHEN 3 THEN 'Santiago, Chile'
          END,
          birth_date = CASE id
            WHEN 3 THEN DATE '1998-07-21'
            ELSE NULL
          END
        WHERE id IN (1, 2, 3);
      `,
      { transaction },
    );

    await queryInterface.changeColumn(
      "users",
      "display_name",
      {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      { transaction },
    );

    await queryInterface.sequelize.query(
      `
        ALTER TABLE users
        ADD CONSTRAINT users_display_name_valid
        CHECK (char_length(btrim(display_name)) > 0);
      `,
      { transaction },
    );
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.removeColumn("users", "birth_date", { transaction });
    await queryInterface.removeColumn("users", "location", { transaction });
    await queryInterface.removeColumn("users", "bio", { transaction });
    await queryInterface.removeColumn("users", "avatar", { transaction });
    await queryInterface.removeColumn("users", "display_name", { transaction });
  });
}
