// Este archivo completa los datos del perfil semilla del jugador Ricardo.
export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.bulkInsert(
      "players",
      [
        {
          id: 13,
          user_id: 3,
          name: "Ricardo Navarrete",
          position: null,
          number: null,
          avatar: "/images/avatars/profile.svg",
          bio: "Jugador y referente del equipo. Enfocado en competir, entrenar y seguir fortaleciendo la identidad de Club Prueba dentro y fuera de la cancha.",
          location: "Santiago, Chile",
          birth_date: "1998-07-21",
          team: "Club Prueba",
          roster_status: "active",
          primary_category_id: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      { transaction },
    );

    await queryInterface.bulkInsert(
      "player_categories",
      [
        { player_id: 13, category_id: 1 },
      ],
      { transaction },
    );

    await queryInterface.bulkInsert(
      "player_championships",
      [
        { player_id: 13, championship_id: 1 },
        { player_id: 13, championship_id: 3 },
      ],
      { transaction },
    );

    await queryInterface.sequelize.query(
      "SELECT setval('players_id_seq', (SELECT MAX(id) FROM players));",
      { transaction },
    );
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.sequelize.query(
      "DELETE FROM player_championships WHERE player_id = 13;",
      { transaction },
    );
    await queryInterface.sequelize.query(
      "DELETE FROM player_categories WHERE player_id = 13;",
      { transaction },
    );
    await queryInterface.sequelize.query(
      "DELETE FROM players WHERE id = 13;",
      { transaction },
    );
  });
}
