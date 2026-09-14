# ClubManager

Aplicacion web para gestionar clubes deportivos, jugadores, categorias, campeonatos, partidos, invitaciones y publicaciones internas.

Repositorio: <https://github.com/RicardoNavarreteDev/clubmanager-ABP-FINAL/tree/main>

## Tecnologias

- Node.js 18 o superior y Express 5
- Handlebars para vistas renderizadas en el servidor
- PostgreSQL y Sequelize
- Umzug para migraciones
- JWT en cookie `HttpOnly` y soporte de `Authorization: Bearer`
- Multer para imagenes
- Swagger UI para documentar la API

## Requisitos

- Node.js 18 o superior
- npm
- PostgreSQL
- Git, si se instala desde el repositorio

El proyecto fija Node.js 18 en `.nvmrc`, aunque tambien funciona con versiones posteriores compatibles.

## Instalacion

1. Clonar el repositorio e instalar las dependencias:

```bash
git clone https://github.com/RicardoNavarreteDev/clubmanager-ABP-FINAL.git
cd clubmanager-ABP-FINAL
npm install
```

2. Crear un usuario y una base PostgreSQL. Ejecutar como usuario administrador de PostgreSQL:

```sql
CREATE ROLE clubmanager_app WITH LOGIN PASSWORD 'cambia_esta_password';
CREATE DATABASE clubmanager OWNER clubmanager_app;
```

3. Crear `.env` a partir de `.env.example`.

Linux o macOS:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

4. Ajustar al menos estos valores en `.env`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clubmanager
DB_USER=clubmanager_app
DB_PASSWORD=cambia_esta_password
JWT_SECRET=genera_una_clave_aleatoria_de_32_o_mas_caracteres
JWT_EXPIRES_IN=1d
NODE_ENV=development
DB_SSL=false
```

`JWT_SECRET` es obligatorio y debe tener al menos 32 caracteres. El servidor no arranca si falta o es demasiado corto.

5. Aplicar todas las migraciones:

```bash
npm run db:migrate
```

6. Iniciar la aplicacion:

```bash
npm start
```

Abrir <http://localhost:3000>.

## Primer Acceso

La instalacion no crea cuentas ni invitaciones con passwords o tokens conocidos.

1. Abrir la landing en `/`.
2. Elegir `Crear club`.
3. Completar los datos del administrador, del club y de su primera categoria.
4. Al finalizar se inicia sesion y se abre `/dashboard`.

El club nuevo comienza sin jugadores, partidos, campeonatos, invitaciones ni publicaciones. El flujo recomendado para incorporar integrantes usa invitaciones creadas por un administrador o coach. El endpoint administrativo `POST /api/users` tambien permite crear directamente una cuenta `player` y su ficha en la primera categoria del club.

## Variables De Entorno

El archivo `.env.example` contiene la configuracion completa:

```env
APP_DEMO_MODE=true
DB_READ_CATEGORIES=true
DB_READ_PLAYERS=true
DB_READ_CHAMPIONSHIPS=true
DB_READ_MATCHES=true
DB_READ_TRAININGS=true
DB_READ_PLAYER_CHAMPIONSHIPS=true
DB_READ_INVITATIONS=true
DB_READ_USERS=true
DB_READ_ROLES=true
DB_READ_PROFILE=true
DB_PROFILE_USER_ID=3
WHATSAPP_NUMBER=
```

La aplicacion conserva servicios hibridos JSON y Sequelize. Los flags `DB_READ_*` determinan el origen de lectura de cada modulo; en invitaciones y usuarios, desactivar el flag deshabilita tambien sus operaciones de base de datos. Para evaluar todos los flujos persistentes se recomienda mantener los flags en `true`.

`DB_SSL=true` habilita SSL para PostgreSQL. `WHATSAPP_NUMBER` es opcional y debe incluir codigo de pais si se utiliza.

## Scripts

| Comando | Descripcion |
| --- | --- |
| `npm run dev` | Inicia el servidor con recarga mediante Nodemon. |
| `npm start` | Inicia el servidor con Node.js. |
| `npm run db:migrate` | Aplica las migraciones pendientes. |
| `npm run db:migrate:undo` | Revierte la ultima migracion. |

## Arquitectura

```text
src/
|-- app.js                    # Configuracion HTTP y montaje de rutas
|-- server.js                 # Entrypoint
|-- config/                   # PostgreSQL y Swagger
|-- data/                     # Datos JSON de respaldo
|-- database/
|   |-- migrations/           # Esquema y datos iniciales
|   `-- migrator.js           # Configuracion de Umzug
|-- middlewares/              # Auth, logs, uploads y errores
|-- models/                   # Modelos Sequelize
|-- modules/                  # Rutas, controladores y servicios por dominio
|-- shared/                   # Errores, respuestas, seguridad y JSON
`-- views/                    # Vistas Handlebars

public/
|-- css/
|-- images/
|-- js/
`-- uploads/                  # Directorios vacios para archivos locales
```

`DOMAIN_MODEL.md` documenta las entidades, relaciones y reglas de negocio.

## Roles Y Seguridad

- `admin`: administra el club, usuarios, categorias, campeonatos, partidos e invitaciones.
- `coach`: consulta usuarios y gestiona informacion deportiva e invitaciones permitidas.
- `player`: accede al panel, perfil, plantel, eventos y feed de su club.
- Cada JWT queda asociado a una membresia y a un club activo.
- Un token deja de ser valido si esa membresia ya no existe.
- Aceptar una invitacion de una cuenta existente exige su password actual.
- Las invitaciones usan tokens aleatorios y siempre pertenecen al club que las emitio.
- Las passwords nuevas se guardan con `bcryptjs`; el login migra hashes SHA-256 legacy cuando corresponde.
- Helmet, rate limiting, limites de body y validacion de uploads estan habilitados.

No se deben publicar `.env`, credenciales PostgreSQL, secretos JWT, logs ni uploads realizados durante pruebas.

## Rutas Web

Publicas:

- `GET /`: landing.
- `GET|POST /login`: inicio de sesion.
- `GET|POST /registro`: registro mediante invitacion.
- `GET|POST /crear-club`: alta del primer club o de otro club para una cuenta autenticada.
- `GET /status`: estado del servidor y registro en `logs/log.txt`.

Con sesion:

- `GET /dashboard`
- `GET /jugadores`
- `GET /eventos`
- `GET /campeonatos`
- `GET /perfil`
- `GET /gestion/invitaciones`
- `GET|POST /gestion/categorias`
- `GET /campeonatos/nuevo` y `POST /campeonatos`
- `GET /gestion/partidos/nuevo` y `POST /gestion/partidos`
- `POST /clubs/:clubId/activar`
- `POST /logout`

Las rutas de gestion verifican los roles correspondientes.

## API

La documentacion interactiva esta disponible en <http://localhost:3000/api-docs>.

Autenticacion:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/me/avatar`
- `PUT /api/auth/me/profile`
- `PUT /api/auth/me/email`
- `PUT /api/auth/me/password`

Usuarios:

- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

Jugadores e invitaciones:

- `GET /api/players`
- `GET /api/players/:id`
- `PUT /api/players/:id`
- `PATCH /api/players/:id/status`
- `GET /api/invitations`
- `GET /api/invitations/:id`
- `GET /api/invitations/token/:token`
- `POST /api/invitations`
- `PATCH /api/invitations/:id/status`

Feed:

- `GET|POST /api/feed`
- `POST /api/feed/:postId/likes`
- `POST /api/feed/:postId/votes`
- `POST /api/feed/:postId/comments`
- `POST /api/feed/:postId/comments/:commentId/replies`

Excepto login, registro y consulta de una invitacion por token, la API exige autenticacion. Las operaciones de escritura aceptan `Authorization: Bearer <token>`.

Las respuestas JSON siguen esta estructura:

```json
{
  "status": "success",
  "message": "Operacion completada correctamente",
  "data": {}
}
```

## Verificacion Manual

El proyecto no incluye actualmente una suite automatizada. Antes de entregar o desplegar se debe comprobar:

1. `npm install` en una carpeta limpia.
2. `npm run db:migrate` sobre una base vacia.
3. Creacion del primer club e inicio de sesion.
4. `/`, `/status`, `/dashboard`, `/jugadores`, `/eventos`, `/campeonatos` y `/perfil`.
5. Creacion y aceptacion de una invitacion.
6. Cambio entre dos clubes de una misma cuenta.
7. Respuestas `401` y `403` de las rutas privadas segun sesion y rol.
8. `404` HTML para una URL web inexistente y `404` JSON bajo `/api`.
9. Creacion de `logs/log.txt` al visitar `/status`.

## Evidencias

![Servidor en funcionamiento](public/images/servidorCorriendo.png)

![Pagina principal](public/images/paginaPrincipal.png)

![Dashboard](public/images/rutaJugadores.png)

![Documentacion de arquitectura](public/images/arquitectura.png)

![Pagina 404](public/images/error404.png)

## Limitaciones Conocidas

- La persistencia sigue en transicion y combina JSON con PostgreSQL segun el modulo.
- No hay recuperacion automatica de passwords por correo; debe intervenir el administrador del club.
- Las citaciones de partidos permanecen modeladas solo en JSON para una fase posterior.
- No existe una suite automatizada de tests, lint o typecheck; la validacion actual es manual.

## Licencia

Proyecto academico. No se declara una licencia de redistribucion.
