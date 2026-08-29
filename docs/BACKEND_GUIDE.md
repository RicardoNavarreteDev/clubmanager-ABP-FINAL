# Backend Guide

## Objetivo

Definir una guía clara para construir el backend de `ClubManager` sin perder consistencia con el dominio ya definido ni romper el contrato actual de las vistas.

Este documento sirve para:
- ordenar la transición desde JSON hacia PostgreSQL + Sequelize
- dejar reglas de trabajo para controladores, servicios y persistencia
- evitar decisiones improvisadas fuera del alcance del proyecto
- mantener una base sana para comenzar la etapa backend

## Estado Actual

Hoy el proyecto funciona como una aplicación Express server-rendered con Handlebars.

La estructura principal es:
- `src/server.js` inicia el servidor
- `src/app.js` configura Express y monta rutas
- `src/routes/` define rutas por sección
- `src/controllers/` prepara datos para las vistas
- `src/services/json.service.js` centraliza la lectura mock desde `src/data/`
- `public/` contiene assets y comportamiento frontend compartido

La persistencia real todavía no está activa para la app. Los datos visibles siguen viniendo de JSON, aunque ya existe base inicial para Sequelize y migraciones.

## Fuente De Verdad

La fuente de verdad del dominio es:

```text
DOMAIN_MODEL.md
```

Toda decisión backend debe respetar:
- entidades ya definidas
- relaciones ya definidas
- reglas de negocio ya definidas
- orden de migración ya definido

Si hay conflicto entre la implementación actual y el modelo de dominio, debe priorizarse el modelo de dominio.

## Principios Backend

### 1. Cambios pequeños y verificables
La migración a base de datos debe hacerse por etapas, no como un reemplazo total de una sola vez.

### 2. Controladores livianos
Los controladores deben:
- orquestar datos
- transformar datos para la vista
- decidir qué renderizar o responder

No deben:
- leer archivos directamente
- construir acceso a base de datos inline
- mezclar demasiada lógica de negocio

### 3. Servicios como frontera de datos
La capa de servicios debe ser el punto de acceso a persistencia.

Hoy:
- la persistencia pasa por `json.service.js`

Después:
- la persistencia debe pasar por servicios/repositorios basados en Sequelize

La idea es cambiar la fuente de datos sin reescribir la app completa.

### 4. Mantener estable el contrato de las vistas
Mientras la app siga siendo server-rendered, los controllers deben seguir entregando a Handlebars un shape compatible con lo que las vistas esperan.

### 5. No agregar alcance fuera del dominio actual
Por ahora no corresponde agregar:
- JWT
- permisos finos
- API REST pública completa
- uploads
- tiempo real
- features no definidas en `DOMAIN_MODEL.md`

## Arquitectura Recomendada

## Capas

### Rutas
Responsables de:
- declarar endpoints
- delegar al controller adecuado

### Controladores
Responsables de:
- pedir datos a servicios
- ensamblar view models
- renderizar vistas o responder JSON cuando corresponda

### Servicios
Responsables de:
- encapsular acceso a persistencia
- resolver consultas de dominio simples
- mantener la transición JSON -> DB lo más aislada posible

### Persistencia
Fase actual:
- JSON mock

Fase objetivo:
- PostgreSQL
- Sequelize
- migraciones con Umzug

## Estrategia De Migración

La migración recomendada ya está definida y debe mantenerse en este orden:

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

Quedan fuera de la primera fase:
- `match_callups`
- `invitations`
- `posts`
- `announcements`

## Primera Regla De Migración

No mover todo al mismo tiempo.

Cada etapa debería:
1. crear tabla/migración
2. definir modelo si hace falta
3. crear acceso vía servicio
4. usar ese servicio desde un controller pequeño
5. verificar que la vista siga funcionando

## Reglas De Modelado

### Naming
- usar nombres de dominio ya definidos
- no inventar nombres alternativos si ya existe uno en `DOMAIN_MODEL.md`

### Relaciones
Respetar relaciones mínimas:
- `users` 1:1 `players`
- `users` N:M `roles`
- `players` N:M `categories`
- `players` N:M `championships`
- `championships` 1:N `matches`
- `categories` 1:N `trainings`

### Reglas importantes
- un jugador tiene `primaryCategoryId`
- un jugador debe tener `rosterStatus`
- un jugador pertenece al menos a una categoría
- `championshipId` en `matches` es opcional
- `matches.status` solo puede ser `upcoming` o `finished`
- entrenamientos usan `categoryId` y `trainingType`

## Reglas De Servicios

Los servicios backend nuevos deberían:
- tener nombres claros y concretos
- devolver datos listos para controller
- no mezclar formateo de vista innecesario
- mantener una API pequeña y estable

Ejemplos razonables:
- `getPlayersWithCategory()`
- `getChampionshipsWithPlayersCount()`
- `getEventsViewData()`

Evitar por ahora:
- mega servicios genéricos
- una capa de abstracción excesiva sin necesidad

## Reglas De Controladores

Los controllers deberían:
- llamar uno o pocos servicios
- construir campos derivados necesarios para la vista
- evitar lógica de persistencia directa

Ejemplo correcto:
- obtener campeonatos
- derivar badges o labels de estado
- renderizar la vista

Ejemplo incorrecto:
- consultar DB directamente
- mezclar múltiples responsabilidades de dominio y persistencia

## Validación Backend

Aunque el frontend ya tenga validaciones visuales, el backend debe volver a validar cuando haya escritura real.

Validar especialmente:
- campos requeridos
- formato de email
- longitud mínima de contraseña
- consistencia entre entidades relacionadas
- estados válidos
- referencias existentes (`categoryId`, `playerId`, etc.)

## Manejo De Errores

Separar conceptualmente:
- error de validación
- error de dominio
- error de infraestructura

En esta etapa no hace falta una gran jerarquía de errores, pero sí:
- mensajes claros en consola
- no filtrar detalles sensibles al usuario
- mantener el servidor en estado consistente

## Estrategia De Respuesta

Mientras la app siga renderizando vistas:
- priorizar `res.render(...)`
- entregar a las vistas datos ya preparados

Rutas JSON deberían reservarse a:
- `status`
- futuros endpoints internos si realmente hacen falta

## Alcance Inmediato Recomendado

La primera etapa backend real debería enfocarse en entidades que:
- ya se usan mucho en la UI
- tienen modelo claro
- son fáciles de validar manualmente

Mi recomendación:

1. `categories`
2. `players`
3. `championships`

Razón:
- ya existen en las vistas principales
- tienen relaciones claras
- permiten migrar partes visibles sin tocar aún autenticación ni escritura compleja

## Primer Slice Recomendado

El primer slice backend ideal es:

### Slice 1
- asegurar migración de `categories`
- definir acceso consistente a categorías
- preparar el paso siguiente para `players`

### Slice 2
- modelar `players`
- reemplazar en una ruta concreta la fuente JSON por la capa DB o por una transición controlada

### Slice 3
- modelar `championships`
- mantener la UI estable mientras se reemplaza la fuente mock

## Qué No Hacer Mañana

- no migrar posts/comentarios todavía
- no mezclar frontend y backend en el mismo cambio si no hace falta
- no introducir autenticación nueva
- no crear una API REST enorme antes de tener bien la persistencia base

## Estados Del Roster

`players` debe distinguir claramente el estado del jugador dentro del equipo.

Valor recomendado para `rosterStatus`:
- `invited`
- `active`
- `inactive`

Interpretación:
- `invited`: invitación enviada, cuenta todavía no completada
- `active`: jugador activo en el roster actual
- `inactive`: jugador existente, pero fuera del roster activo

## Invitaciones

La entidad `invitations` debe modelar el flujo real de acceso al sistema.

## Reglas De Roles E Invitaciones

### Quién puede invitar
- `admin` puede invitar `player`, `coach` y `admin`
- `coach` puede invitar solo `player`
- `player` no puede invitar a nadie

### Qué define quien invita
La invitación define de forma explícita:
- `name`
- `email`
- `role`

Si el rol es `player`, además define:
- `primaryCategoryId`
- categorías adicionales si corresponde

### Qué no define el invitado
El invitado no define:
- su rol
- su categoría principal
- sus categorías habilitadas

Eso siempre queda controlado por `admin` o `coach`.

### Regla De Relación Entre User y Player
- Todo usuario con rol `player` debe tener una fila real en `players`
- No todo `user` necesita ser `player`
- `coach` y `admin` pueden no tener `player`

### Regla De Creación Del Player
Si una persona es invitada como `player`, su fila en `players` debe crearse o reservarse desde el momento de la invitación.

Estado inicial recomendado:
- `rosterStatus = invited`
- `userId = null`

### Jugadores Sin Campeonato
Un `player` puede existir sin estar inscrito en campeonatos.

Eso no lo saca del sistema.

La inscripción competitiva se resuelve mediante:
- `player_championships`

Los entrenamientos siguen dependiendo de categorías, no de campeonatos.

## Flujo De Invitación Recomendado

### Invitación de jugador
1. `admin` o `coach` crea la invitación
2. define:
   - nombre
   - correo
   - rol `player`
   - categoría principal
   - categorías adicionales si aplica
3. el sistema crea o reserva la fila en `players`
4. `players.rosterStatus = invited`
5. se crea `invitations`
6. el usuario recibe un link con token
7. el usuario acepta la invitación
8. completa datos faltantes
9. se crea `user`
10. se vincula `players.userId = user.id`
11. se asigna el rol al usuario
12. `players.rosterStatus = active`

### Invitación de coach o admin
1. `admin` crea la invitación
2. define:
   - nombre
   - correo
   - rol
3. se crea `invitations`
4. el usuario acepta
5. completa datos mínimos
6. se crea `user`
7. se asigna el rol

En estos casos no hace falta `player` obligatorio.

## Flujo De Aceptación

### Validación inicial
Al abrir el link de invitación, el backend debe verificar:
1. que la invitación exista
2. que el token coincida
3. que `status = pending`
4. que no esté vencida
5. que no haya sido cancelada

### Datos que completa el invitado

#### Siempre
- `password`

#### Si el rol es `player`
- `birthDate`
- `avatar`
- `bio`
- `location`

#### Si el rol es `coach` o `admin`
- `password`
- `avatar` opcional
- datos básicos si más adelante se habilitan

### Qué hace el backend al aceptar
1. crea `user`
2. asigna `user_roles`
3. si hay `playerId`:
   - vincula `players.userId`
   - completa datos faltantes
   - cambia `rosterStatus = active`
4. marca invitación como:
   - `status = accepted`
   - `acceptedAt = now`

## Perfil General De Usuario

`/perfil` debe representar a la persona autenticada, no solo al jugador.

### Regla
- todos los usuarios tienen perfil, siempre
- si además tienen rol `player`, el perfil se enriquece con datos de `players`
- si tienen múltiples roles, el perfil debe mostrarlos juntos
- `coach` y `admin` también deben tener perfil aunque no tengan fila en `players`

Ejemplos válidos:
- `Admin`
- `Coach`
- `Jugador`
- `Admin · Jugador`
- `Coach · Jugador`

### Fuente esperada de `/perfil`
Debe salir de la combinación de:
- `users`
- `roles`
- `players` si existe vínculo
- relaciones auxiliares como categorías/campeonatos cuando se necesiten en la UI

### Implicación de diseño
Como todos los usuarios deben tener perfil aunque no sean jugadores, el sistema necesitará distinguir entre:
- datos de cuenta (`users`)
- datos deportivos (`players`)
- datos de perfil general para cualquier usuario

En la etapa actual, `players` sigue concentrando gran parte del perfil visible del jugador.
Para `coach` y `admin` sin ficha deportiva, más adelante habrá que decidir entre:
1. extender `users` con campos de perfil
2. crear una entidad específica de perfil general de usuario

Por ahora, la regla cerrada es:
- todo usuario tiene perfil
- no todo perfil depende de `players`

## Nombre Del Jugador

### Regla
El nombre inicial del jugador lo define quien invita.

El usuario puede solicitar cambiarlo después, pero no debería cambiarlo libremente sin validación administrativa.

### Dirección recomendada
No implementar cambio libre de `players.name` todavía.

Cuando se construya este flujo, resolverlo con:
- validación de `admin`
- o una futura tabla de solicitudes de cambio

Información mínima esperada:
- email
- nombre
- rol asignado por admin
- categoría principal si el rol es jugador
- token
- estado
- expiración

Flujo recomendado:
1. admin crea invitación
2. define rol y, si corresponde, categoría del jugador
3. usuario acepta vía correo
4. completa datos faltantes
5. se crea la cuenta real y se vincula con `player` si aplica

## Archivos Clave A Revisar Antes De Implementar

- `src/config/db.js`
- `src/database/migrator.js`
- `src/database/migrate.js`
- `src/database/undo.js`
- `src/database/migrations/001-create-categories.js`
- `src/services/json.service.js`
- `DOMAIN_MODEL.md`

## Criterio De Avance

Una etapa backend está bien hecha si:
1. respeta `DOMAIN_MODEL.md`
2. no rompe las vistas
3. mantiene separación razonable entre controller y persistencia
4. se puede verificar manualmente
5. deja una base mejor que la anterior

## Estado Final Deseado

El backend debería evolucionar hacia:
- servicios claros
- persistencia real con Sequelize
- migraciones trazables
- frontend estable mientras cambia la fuente de datos

## Siguiente Paso

Después de esta guía, el paso correcto es:
1. revisar la base actual de Sequelize/migraciones
2. definir el primer slice real
3. implementarlo con el menor cambio correcto posible

## Estado Actual Del Proyecto

Ya existe base backend para:
- `categories`
- `players`
- `championships`
- `matches`
- `trainings`
- `player_championships`
- `invitations`

También existen:
- modelos Sequelize base
- services de lectura con flags de transición JSON/DB
- `rosterStatus` en `players`
- una primera vinculación real del perfil de Ricardo con DB

Lo siguiente recomendado antes de escritura real es:
1. consumir `invitations` en un flujo real de aceptación
2. consolidar `/perfil` como perfil general del usuario autenticado
3. luego construir escritura real para settings y edición de perfil
