# ClubManager - Modelo de Dominio y Preparacion DB

## Objetivo

Dejar definido el modelo funcional del proyecto antes de migrar a PostgreSQL + Sequelize.

Este archivo resume las decisiones tomadas para que la transicion desde JSON hacia base de datos sea consistente.

## Reglas de negocio ya definidas

- El sistema actual trabaja con un solo club por instalacion.
- Las categorias del club las definen `admin` o `coach`.
- Un jugador debe pertenecer al menos a una categoria.
- Un jugador puede pertenecer a varias categorias.
- Un jugador puede participar en varios campeonatos.
- Un jugador puede no participar en ningun campeonato y solo entrenar.
- Cada campeonato pertenece al club y a una categoria.
- Cada campeonato tiene sus propios partidos y jugadores inscritos.
- Existen partidos de campeonato y tambien amistosos.
- Por eso `championshipId` en partidos debe ser opcional.
- Las citaciones son por partido y por ahora no se usaran en entrenamientos.
- Los entrenamientos actuales son generales por categoria, no por campeonato.
- Todo jugador que entra al dashboard tendra cuenta de usuario creada via invitacion.
- El perfil pertenece al usuario y esta ligado a un `playerId`.

## Roles

Roles base definidos:

- `admin`
- `coach`
- `player`

Notas:

- Un usuario puede tener mas de un rol.
- `admin` define roles.
- `admin` y `coach` pueden invitar jugadores.
- `admin` y `coach` pueden definir categoria y campeonatos de cada jugador.
- `admin` y `coach` pueden editar citaciones.

## Estado actual de los JSON

### `players.json`

Cada jugador ya quedo adaptado para reflejar una categoria principal y categorias habilitadas:

- `primaryCategoryId`
- `categoryIds`

### `categories.json`

Archivo nuevo que normaliza categorias.

Valores iniciales actuales:

- `adulto`
- `todo competidor`

### `championships.json`

Cada campeonato ya incluye:

- `categoryId`
- `description`
- `primaryVenue`
- `isVariableVenue`
- `startDate`
- `endDate`
- `status`

### `player-championships.json`

Representa la relacion muchos-a-muchos entre jugadores y campeonatos.

### `matches.json`

Cada partido ahora contempla:

- `championshipId` nullable
- `status` alineado a futuro:
  - `upcoming`
  - `finished`

Si `championshipId` es `null`, el partido es amistoso.

### `trainings.json`

Cada entrenamiento ahora distingue:

- `categoryId` -> categoria del grupo
- `trainingType` -> tipo tecnico del entrenamiento

### `match-callups.json`

Archivo nuevo preparado para la futura persistencia de citaciones.

Estados definidos:

- `pending`
- `confirmed`
- `declined`

## Modelo relacional minimo recomendado

### Tablas base

- `users`
- `roles`
- `user_roles`
- `players`
- `categories`
- `player_categories`
- `championships`
- `player_championships`
- `matches`
- `match_callups`
- `trainings`

### Relaciones clave

- `users` 1:1 `players`
- `users` N:M `roles`
- `players` N:M `categories`
- `players` N:M `championships`
- `championships` 1:N `matches`
- `matches` 1:N `match_callups`
- `categories` 1:N `trainings`

## Entidades y campos sugeridos

### `users`

- `id`
- `email`
- `passwordHash`
- `isActive`
- `createdAt`
- `updatedAt`

### `roles`

- `id`
- `name`

### `user_roles`

- `userId`
- `roleId`

### `players`

- `id`
- `userId`
- `name`
- `position`
- `number`
- `avatar`
- `bio`
- `location`
- `birthDate`
- `team`
- `primaryCategoryId`
- `createdAt`
- `updatedAt`

### `categories`

- `id`
- `name`
- `genderScope`
- `minAge`
- `maxAge`

### `player_categories`

- `playerId`
- `categoryId`

### `championships`

- `id`
- `name`
- `categoryId`
- `description`
- `primaryVenue`
- `isVariableVenue`
- `status`
- `startDate`
- `endDate`
- `createdAt`
- `updatedAt`

### `player_championships`

- `playerId`
- `championshipId`

### `matches`

- `id`
- `championshipId` nullable
- `opponent`
- `date`
- `time`
- `location`
- `condition`
- `status`
- `result`
- `createdAt`
- `updatedAt`

### `match_callups`

- `id`
- `matchId`
- `playerId`
- `status`
- `createdAt`
- `updatedAt`

### `trainings`

- `id`
- `categoryId`
- `trainingType`
- `date`
- `time`
- `location`
- `createdAt`
- `updatedAt`

## Alcance recomendado para la primera migracion a DB

Migrar primero:

1. `categories`
2. `users`
3. `roles`
4. `user_roles`
5. `players`
6. `player_categories`
7. `championships`
8. `player_championships`
9. `matches`
10. `trainings`

Dejar para una segunda fase:

- `match_callups`
- `invitations`
- `posts`
- `announcements`

## Impacto actual en vistas y controladores

La app ya fue adaptada para que las vistas no dependan de strings viejos en los JSON:

- jugadores muestran `categoryName`
- entrenamientos muestran `categoryName`
- campeonatos muestran `categoryName`
- partidos muestran `championshipName` o `Amistoso`

Esto permite cambiar la persistencia despues sin rehacer la UI completa.
