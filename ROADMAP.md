# ClubManager - Roadmap de Continuacion

## Objetivo actual

La interfaz mock ya está funcional: `/`, `/jugadores`, `/eventos`, `/campeonatos` y `/perfil` leen datos desde `src/data/` a través de `src/services/json.service.js`.

La prioridad es iniciar el Módulo 7: migrar progresivamente a PostgreSQL + Sequelize. No se incorporarán JWT, permisos, cargas ni API REST durante esta fase.

## Decisiones ya definidas

- `posts` y `announcements` iran juntos en `src/data/posts.json` usando el campo `type`
- `/eventos` sera una sola pagina con tres bloques:
  - partidos jugados
  - proximos partidos
  - entrenamientos
- `/` sera una pagina con:
  - bienvenida o resumen
  - estadisticas
  - feed de publicaciones y anuncios
- `status` de partidos:
  - `finished`
  - `upcoming`
- `condition` de partidos:
  - `local`
  - `visita`
- `category` de entrenamientos:
  - `tecnico`
  - `tactico`
  - `fisico`
  - `mixto`
- cantidades iniciales recomendadas:
  - 12 jugadores
  - 5 partidos
  - 5 entrenamientos
  - 6 posts, con 2 anuncios
- login, permisos, JWT y usuarios reales se dejan para una etapa posterior

## Modelo de datos acordado

### Players

Campos:

- `id`
- `name`
- `position`
- `number`
- `avatar`

### Matches

Campos:

- `id`
- `opponent`
- `date`
- `time`
- `location`
- `condition`
- `status`
- `result`

### Trainings

Campos:

- `id`
- `date`
- `time`
- `location`
- `category`

### Posts

Campos:

- `id`
- `type`
- `author`
- `role`
- `date`
- `content`
- `avatar`
- `likes`
- `comments`

## Reglas de consistencia

- Usar nombres de campos en ingles
- Usar `id` numerico
- Usar fechas en formato `YYYY-MM-DD`
- Usar horas en formato `HH:MM`
- Usar rutas tipo `/images/...` para avatares o placeholders
- No escribir en JSON desde formularios; la persistencia real se implementara despues
- La capa mock actual ya fue adaptada para parecerse al modelo relacional futuro: `categoryId`, `primaryCategoryId`, `categoryIds`, `championshipId`, `isVariableVenue`

## Fases de trabajo

### Fase 1 - Datos base

Objetivo:

- crear la fuente de datos mock que alimentara la aplicacion

Archivos:

- `src/data/players.json`
- `src/data/matches.json`
- `src/data/trainings.json`
- `src/data/posts.json`

Resultado esperado:

- datos consistentes y suficientes para las tres paginas principales

### Fase 2 - Servicio de lectura

Objetivo:

- centralizar lectura de JSON en un solo lugar

Archivo:

- `src/services/json.service.js`

Responsabilidad:

- leer archivos JSON con `fs/promises`
- parsear datos
- manejar errores basicos
- devolver datos listos para los controladores

Resultado esperado:

- los controladores no leen archivos directamente

### Fase 3 - Pagina de Jugadores dinamica

Objetivo:

- reemplazar la vista de prueba por datos reales

Archivos a tocar:

- `src/controllers/players.controller.js`
- `src/views/players.handlebars`

Resultado esperado:

- `/jugadores` muestra los 12 jugadores desde JSON

### Fase 4 - Pagina de Eventos

Objetivo:

- crear la seccion completa de eventos

Archivos:

- `src/controllers/events.controller.js`
- `src/routes/events.routes.js`
- `src/views/events.handlebars`
- `src/app.js`

Resultado esperado:

- `/eventos` funcional con partidos jugados, proximos partidos y entrenamientos

Estado actual de esta fase:

- `src/controllers/events.controller.js` ya existe y separa `playedMatches` y `pendingMatches`
- `src/routes/events.routes.js` ya existe
- `src/app.js` ya monta `/eventos`
- `src/views/events.handlebars` ya esta conectada y la pagina responde

### Fase 5 - Home dinamica

Objetivo:

- transformar `/` en una pagina con contenido real

Archivos:

- `src/controllers/home.controller.js`
- `src/views/home.handlebars`

Responsabilidad:

- cargar `players`, `matches`, `trainings` y `posts`
- calcular estadisticas
- renderizar publicaciones y anuncios diferenciados

Resultado esperado:

- Home deja de ser estatica y refleja datos reales

Estado actual de esta fase:

- `src/controllers/home.controller.js` ya calcula `stats`
- `src/views/home.handlebars` ya muestra resumen, bloque tipo publicar y feed
- Home ya esta conectada a `players`, `matches`, `trainings` y `posts`

### Fase 5.5 - Campeonatos

Objetivo:

- introducir campeonatos como nueva seccion del dominio antes de pasar a base de datos real

Archivos ya creados:

- `src/data/championships.json`
- `src/data/player-championships.json`
- `src/services/json.service.js` ya incluye `getChampionships()` y `getPlayerChampionships()`

Siguiente secuencia:

1. `src/controllers/championships.controller.js`
2. `src/routes/championships.routes.js`
3. `src/views/championships.handlebars`
4. conectar `/campeonatos` en `src/app.js`
5. agregar `Campeonatos` al sidebar

Estado actual de esta fase:

- todo el flujo base de campeonatos ya existe y carga en la app
- la siguiente evolucion ya no es visual, sino de persistencia real en DB

### Fase 6 - Layout del dashboard

Objetivo:

- construir la estructura visual reutilizable del proyecto

Archivos probables:

- `src/views/layouts/main.handlebars`
- luego parciales si de verdad se justifican

Orden recomendado:

1. mejorar `main.handlebars`
2. decidir si ya conviene extraer parciales
3. recien despues crear parciales como `sidebar`, `agenda`, `mobile-header` y `mobile-nav`

### Fase 7 - Formularios demostrativos

Objetivo:

- simular interacciones sin persistencia real

Archivos probables:

- vistas
- `public/js/modals.js`
- `public/js/forms.js`

Resultado esperado:

- UX mas completa sin escribir en archivos JSON

### Fase 8 - Responsive

Objetivo:

- adaptar la interfaz a movil

Resultado esperado:

- pagina usable en desktop y movil

### Fase 9 - Migración a Módulo 7

Objetivo:

- sustituir los datos JSON por persistencia real, sin cambiar todavía las rutas ni las vistas

Secuencia de implementación y aprendizaje:

1. Crear la conexión en `src/config/db.js` desde variables `DB_*`, sin exponer credenciales ni incluir `.env` en Git.
2. Verificar conectividad con PostgreSQL antes de crear modelos.
3. Definir modelos y asociaciones base: `Category`, `User`, `Role`, `UserRole`, `Player`, `PlayerCategory`.
4. Crear el esquema mediante migraciones o una sincronización explícitamente controlada; no usar `sync({ force: true })` fuera de una base local desechable.
5. Cargar semillas reproducibles desde los JSON actuales y validar claves foráneas y relaciones N:M.
6. Migrar primero las consultas de categorías y jugadores; mantener intacto el contrato que consumen `players.handlebars` y el resto de vistas.
7. Repetir con campeonatos, partidos y entrenamientos; dejar `match_callups`, invitaciones y posts para una fase posterior.
8. Probar manualmente todas las rutas existentes, `/status` y el 404 tras cada bloque.

Preparacion ya realizada:

- `categories.json` creado
- `match-callups.json` creado
- `players.json` usa `primaryCategoryId` y `categoryIds`
- `trainings.json` usa `categoryId`
- `championships.json` usa `categoryId`, `description`, `isVariableVenue`, `startDate`, `endDate`
- `matches.json` usa `championshipId` nullable y estados `upcoming` / `finished`
- la documentacion del modelo quedo en `DOMAIN_MODEL.md`

## Orden exacto recomendado

1. `src/data/players.json`
2. `src/data/matches.json`
3. `src/data/trainings.json`
4. `src/data/posts.json`
5. `src/services/json.service.js`
6. `/jugadores` dinamico
7. `/eventos`
8. `/` dinamico
9. layout/dashboard
10. modales y validaciones
11. responsive
12. base de datos real

## Siguiente paso inmediato

Preparar PostgreSQL y comprobar una conexión segura desde `src/config/db.js`. Solo tras confirmar esa conexión se crearán los modelos base.
