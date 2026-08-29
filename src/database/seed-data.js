// Este archivo concentra los datos semilla usados por las migraciones de carga inicial.
export const categorySeeds = [
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
];

export const userSeeds = [
  {
    id: 1,
    email: "admin@clubmanager.dev",
    password_hash: "3b612c75a7b5048a435fb6ec81e52ff92d6d795a8b5a9c17070f6a63c97a53b2",
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 2,
    email: "coach@clubmanager.dev",
    password_hash: "f42fb01782c73deeda29d5130c88c10ed5f2d6d1468c2aeacc672ffd1a5e05b9",
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 3,
    email: "ricardo@clubmanager.dev",
    password_hash: "247519973b4bbeb9979d08e2b4902004bccdb105017ae17af5047bbd506d5660",
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

export const roleSeeds = [
  { id: 1, name: "admin" },
  { id: 2, name: "coach" },
  { id: 3, name: "player" },
];

export const userRoleSeeds = [
  { user_id: 1, role_id: 1 },
  { user_id: 2, role_id: 2 },
  { user_id: 3, role_id: 3 },
];

export const playerSeeds = [
  { id: 1, user_id: null, name: "Matias Rojas", position: "Base", number: 4, avatar: "/images/avatars/player-1.svg", bio: null, location: null, birth_date: null, team: null, primary_category_id: 1, created_at: new Date(), updated_at: new Date() },
  { id: 2, user_id: null, name: "Vicente Salazar", position: "Escolta", number: 7, avatar: "/images/avatars/player-2.svg", bio: null, location: null, birth_date: null, team: null, primary_category_id: 1, created_at: new Date(), updated_at: new Date() },
  { id: 3, user_id: null, name: "Benjamin Fuentes", position: "Alero", number: 9, avatar: "/images/avatars/player-3.svg", bio: null, location: null, birth_date: null, team: null, primary_category_id: 1, created_at: new Date(), updated_at: new Date() },
  { id: 4, user_id: null, name: "Joaquin Morales", position: "Ala-pivot", number: 11, avatar: "/images/avatars/player-4.svg", bio: null, location: null, birth_date: null, team: null, primary_category_id: 1, created_at: new Date(), updated_at: new Date() },
  { id: 5, user_id: null, name: "Tomas Araya", position: "Pivot", number: 13, avatar: "/images/avatars/player-5.svg", bio: null, location: null, birth_date: null, team: null, primary_category_id: 1, created_at: new Date(), updated_at: new Date() },
  { id: 6, user_id: null, name: "Diego Contreras", position: "Base", number: 5, avatar: "/images/avatars/player-6.svg", bio: null, location: null, birth_date: null, team: null, primary_category_id: 1, created_at: new Date(), updated_at: new Date() },
  { id: 7, user_id: null, name: "Cristobal Herrera", position: "Escolta", number: 8, avatar: "/images/avatars/player-7.svg", bio: null, location: null, birth_date: null, team: null, primary_category_id: 2, created_at: new Date(), updated_at: new Date() },
  { id: 8, user_id: null, name: "Lucas Navarro", position: "Alero", number: 10, avatar: "/images/avatars/player-8.svg", bio: null, location: null, birth_date: null, team: null, primary_category_id: 2, created_at: new Date(), updated_at: new Date() },
  { id: 9, user_id: null, name: "Ignacio Mella", position: "Ala-pivot", number: 12, avatar: "/images/avatars/player-9.svg", bio: null, location: null, birth_date: null, team: null, primary_category_id: 2, created_at: new Date(), updated_at: new Date() },
  { id: 10, user_id: null, name: "Felipe Bustos", position: "Pivot", number: 14, avatar: "/images/avatars/player-10.svg", bio: null, location: null, birth_date: null, team: null, primary_category_id: 2, created_at: new Date(), updated_at: new Date() },
  { id: 11, user_id: null, name: "Nicolas Paredes", position: "Alero", number: 15, avatar: "/images/avatars/player-11.svg", bio: null, location: null, birth_date: null, team: null, primary_category_id: 2, created_at: new Date(), updated_at: new Date() },
  { id: 12, user_id: null, name: "Sebastian Carrasco", position: "Escolta", number: 18, avatar: "/images/avatars/player-12.svg", bio: null, location: null, birth_date: null, team: null, primary_category_id: 2, created_at: new Date(), updated_at: new Date() },
];

export const playerCategorySeeds = [
  { player_id: 1, category_id: 1 }, { player_id: 1, category_id: 2 },
  { player_id: 2, category_id: 1 }, { player_id: 2, category_id: 2 },
  { player_id: 3, category_id: 1 }, { player_id: 3, category_id: 2 },
  { player_id: 4, category_id: 1 }, { player_id: 4, category_id: 2 },
  { player_id: 5, category_id: 1 }, { player_id: 5, category_id: 2 },
  { player_id: 6, category_id: 1 },
  { player_id: 7, category_id: 2 },
  { player_id: 8, category_id: 2 },
  { player_id: 9, category_id: 2 },
  { player_id: 10, category_id: 2 },
  { player_id: 11, category_id: 2 },
  { player_id: 12, category_id: 2 },
];

export const championshipSeeds = [
  { id: 1, name: "Liga Regional", season: "2026", category_id: 1, description: "Campeonato oficial del circuito regional para planteles adultos del club.", primary_venue: "Gimnasio Municipal", is_variable_venue: false, status: "active", start_date: "2026-08-01", end_date: "2026-11-20", created_at: new Date(), updated_at: new Date() },
  { id: 2, name: "Copa Metropolitana", season: "2026", category_id: 2, description: "Torneo competitivo abierto para jugadores habilitados en todo competidor.", primary_venue: "Arena Sur", is_variable_venue: true, status: "active", start_date: "2026-08-10", end_date: "2026-12-01", created_at: new Date(), updated_at: new Date() },
  { id: 3, name: "Torneo de Apertura", season: "2026", category_id: 1, description: "Competencia de apertura con calendario propio y partidos en sedes mixtas.", primary_venue: "Club Prueba", is_variable_venue: true, status: "upcoming", start_date: "2026-09-01", end_date: "2026-12-15", created_at: new Date(), updated_at: new Date() },
];

export const playerChampionshipSeeds = [
  { player_id: 1, championship_id: 1 }, { player_id: 2, championship_id: 1 }, { player_id: 3, championship_id: 1 }, { player_id: 4, championship_id: 1 }, { player_id: 5, championship_id: 1 }, { player_id: 6, championship_id: 1 },
  { player_id: 7, championship_id: 2 }, { player_id: 8, championship_id: 2 }, { player_id: 9, championship_id: 2 }, { player_id: 10, championship_id: 2 }, { player_id: 11, championship_id: 2 }, { player_id: 12, championship_id: 2 },
  { player_id: 1, championship_id: 3 }, { player_id: 2, championship_id: 3 }, { player_id: 3, championship_id: 3 }, { player_id: 4, championship_id: 3 },
];

export const matchSeeds = [
  { id: 1, championship_id: 1, opponent: "Halcones", date: "2026-08-03", time: "19:30", location: "Gimnasio Municipal", condition: "local", status: "finished", result: "72-68", created_at: new Date(), updated_at: new Date() },
  { id: 2, championship_id: null, opponent: "Titanes", date: "2026-08-07", time: "20:00", location: "Polideportivo Norte", condition: "visita", status: "finished", result: "64-70", created_at: new Date(), updated_at: new Date() },
  { id: 3, championship_id: 1, opponent: "Guerreros", date: "2026-08-20", time: "19:00", location: "Club Prueba", condition: "local", status: "upcoming", result: "Pendiente", created_at: new Date(), updated_at: new Date() },
  { id: 4, championship_id: 2, opponent: "Leones", date: "2026-08-24", time: "18:30", location: "Arena Sur", condition: "visita", status: "upcoming", result: "Pendiente", created_at: new Date(), updated_at: new Date() },
  { id: 5, championship_id: 3, opponent: "Panteras", date: "2026-08-29", time: "20:30", location: "Club Prueba", condition: "local", status: "upcoming", result: "Pendiente", created_at: new Date(), updated_at: new Date() },
];

export const trainingSeeds = [
  { id: 1, category_id: 1, training_type: "tecnico", date: "2026-08-18", time: "18:00", location: "Club Prueba", created_at: new Date(), updated_at: new Date() },
  { id: 2, category_id: 1, training_type: "fisico", date: "2026-08-19", time: "19:00", location: "Club Prueba", created_at: new Date(), updated_at: new Date() },
  { id: 3, category_id: 2, training_type: "tactico", date: "2026-08-21", time: "18:30", location: "Cancha Central", created_at: new Date(), updated_at: new Date() },
  { id: 4, category_id: 2, training_type: "mixto", date: "2026-08-26", time: "18:00", location: "Club Prueba", created_at: new Date(), updated_at: new Date() },
  { id: 5, category_id: 2, training_type: "tecnico", date: "2026-08-28", time: "19:30", location: "Cancha Auxiliar", created_at: new Date(), updated_at: new Date() },
];
