# Backend Progress

## Estado Actual

El backend ya tiene una primera base real de persistencia con PostgreSQL + Sequelize + Umzug.

## Migraciones Y Seeds Ya Creados

Primera fase completada:
- `categories`
- `users`
- `roles`
- `user_roles`
- `players`
- `player_categories`
- `championships`
- `player_championships`
- `matches`
- `trainings`

Extensiones agregadas:
- `rosterStatus` en `players`
- `invitations`
- seed de perfil real para Ricardo en `players`

## Modelos Sequelize Disponibles
- `Category`
- `User`
- `Role`
- `UserRole`
- `Player`
- `PlayerCategory`
- `Championship`
- `PlayerChampionship`
- `Match`
- `Training`
- `Invitation`

## Associations
Archivo:

```text
src/models/associations.js
```

Incluye asociaciones base entre:
- users / players
- users / roles
- players / categories
- players / championships
- championships / categories
- championships / matches
- categories / trainings
- invitations / roles
- invitations / players
- invitations / categories

## Services Ya Disponibles
- `categories.service.js`
- `players.service.js`
- `championships.service.js`
- `matches.service.js`
- `trainings.service.js`
- `player-championships.service.js`
- `users.service.js`
- `roles.service.js`
- `invitations.service.js`
- `profile.service.js`

## Lectura Por Flags
Variables de entorno ya contempladas:
- `DB_READ_CATEGORIES`
- `DB_READ_PLAYERS`
- `DB_READ_CHAMPIONSHIPS`
- `DB_READ_MATCHES`
- `DB_READ_TRAININGS`
- `DB_READ_PLAYER_CHAMPIONSHIPS`
- `DB_READ_INVITATIONS`
- `DB_READ_USERS`
- `DB_READ_ROLES`
- `DB_READ_PROFILE`
- `DB_PROFILE_USER_ID`

## Qué Ya Se Probó
Ya se validó funcionamiento visual con lectura real desde DB para:
- categorías
- jugadores
- campeonatos
- partidos
- entrenamientos
- relaciones `player_championships`

## Dominio Cerrado Hasta Ahora

### Player
- todo jugador existe como fila en `players`
- un jugador puede estar:
  - `invited`
  - `active`
  - `inactive`
- un jugador puede existir sin campeonatos
- campeonatos se resuelven por `player_championships`

### Roles e invitaciones
- `admin` invita `player`, `coach`, `admin`
- `coach` invita solo `player`
- `player` no invita
- el rol lo define quien invita
- la categoría del jugador la define `admin` o `coach`
- el nombre inicial lo define quien invita

### Perfil
- `/perfil` representa a la persona autenticada
- todos los usuarios deben tener perfil
- no solo los jugadores
- si el usuario tiene rol `player`, se enriquece con datos de `players`
- si tiene múltiples roles, deben mostrarse juntos
- `coach` y `admin` también requieren perfil aunque no tengan ficha en `players`

## Próximo Slice Recomendado

### 1. Invitaciones reales
Consumir `invitations.service.js` desde un flujo real.

Primer objetivo:
- `getInvitationByToken(token)`
- validación de invitación
- aceptación de invitación

### 2. Perfil real
Consolidar `profile.service.js` como fuente principal de `/perfil`.

Punto clave ya definido:
- el perfil debe existir para cualquier usuario autenticado
- no puede depender únicamente de `players`

### 3. Escritura real
Después de perfil/invitaciones:
- cambiar correo
- cambiar contraseña
- editar perfil

## Riesgo O Inconsistencia Resuelta
Se corrigió el problema conceptual donde `profile.json` apuntaba a un `playerId` incoherente con la base visual.

Ahora Ricardo tiene una fila real en `players` y puede usarse como base de transición hacia un perfil real desde DB.
