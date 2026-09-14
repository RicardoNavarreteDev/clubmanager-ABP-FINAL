const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "ClubManager API",
    version: "1.0.0",
    description: "API REST del proyecto ClubManager para autenticacion, usuarios, jugadores, invitaciones y feed social. Spec manual mantenido en src/config/swagger.js.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor local",
    },
  ],
  tags: [
    { name: "Auth", description: "Autenticacion y sesion" },
    { name: "Users", description: "Gestion administrativa de usuarios" },
    { name: "Players", description: "Consulta y actualizacion de jugadores" },
    { name: "Invitations", description: "Invitaciones para ingreso al club" },
    { name: "Feed", description: "Feed social persistente del club" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ApiSuccess: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          message: { type: "string" },
          data: { nullable: true },
        },
      },
      ApiError: {
        type: "object",
        properties: {
          status: { type: "string", example: "error" },
          message: { type: "string" },
          data: { nullable: true, example: null },
        },
      },
      LoginPayload: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "admin@clubmanager.dev" },
          password: { type: "string", example: "secreta123" },
        },
      },
      UpdateProfilePayload: {
        type: "object",
        properties: {
          displayName: { type: "string", example: "Usuario Actualizado" },
          bio: { type: "string", nullable: true, example: "Bio actualizada" },
          location: { type: "string", nullable: true, example: "Santiago" },
          birthDate: { type: "string", format: "date", nullable: true, example: "2000-01-02" },
        },
      },
      ChangeEmailPayload: {
        type: "object",
        required: ["currentEmail", "newEmail", "confirmEmail"],
        properties: {
          currentEmail: { type: "string", format: "email", example: "user@clubmanager.dev" },
          newEmail: { type: "string", format: "email", example: "user.nuevo@clubmanager.dev" },
          confirmEmail: { type: "string", format: "email", example: "user.nuevo@clubmanager.dev" },
        },
      },
      ChangePasswordPayload: {
        type: "object",
        required: ["currentPassword", "newPassword", "confirmPassword"],
        properties: {
          currentPassword: { type: "string", example: "secreta123" },
          newPassword: { type: "string", example: "nuevaSecreta123" },
          confirmPassword: { type: "string", example: "nuevaSecreta123" },
        },
      },
      RegisterPayload: {
        type: "object",
        required: ["token", "name", "birthDate", "password", "confirmPassword", "position"],
        properties: {
          token: { type: "string", example: "token_aleatorio_recibido_en_la_invitacion" },
          name: { type: "string", example: "Jugador Prueba" },
          birthDate: { type: "string", format: "date", example: "1999-04-20" },
          password: { type: "string", example: "secreta123" },
          confirmPassword: { type: "string", example: "secreta123" },
          position: { type: "string", example: "Base" },
          number: { type: "integer", nullable: true, example: 9 },
          avatar: { type: "string", nullable: true, example: "/images/avatars/player-1.svg" },
          bio: { type: "string", nullable: true, example: "Jugador de prueba para el flujo de registro." },
        },
      },
      UserPayload: {
        type: "object",
        required: ["email", "displayName", "password"],
        properties: {
          email: { type: "string", format: "email", example: "nuevo.usuario@clubmanager.dev" },
          displayName: { type: "string", example: "Nuevo Usuario" },
          password: { type: "string", example: "secreta123" },
          avatar: { type: "string", nullable: true, example: "/images/avatars/player-1.svg" },
          bio: { type: "string", nullable: true, example: "Perfil administrativo" },
          location: { type: "string", nullable: true, example: "Santiago" },
          birthDate: { type: "string", format: "date", nullable: true, example: "1990-01-15" },
          isActive: { type: "boolean", example: true },
        },
      },
      UserUpdatePayload: {
        type: "object",
        properties: {
          displayName: { type: "string", example: "Usuario Actualizado" },
          password: { type: "string", example: "nuevaSecreta123" },
          avatar: { type: "string", nullable: true, example: "/images/avatars/player-2.svg" },
          bio: { type: "string", nullable: true, example: "Bio actualizada" },
          location: { type: "string", nullable: true, example: "Valparaiso" },
          birthDate: { type: "string", format: "date", nullable: true, example: "1991-02-20" },
          isActive: { type: "boolean", example: true },
        },
      },
      PlayerUpdatePayload: {
        type: "object",
        properties: {
          name: { type: "string", example: "Jugador Actualizado" },
          position: { type: "string", nullable: true, example: "Escolta" },
          number: { type: "integer", nullable: true, example: 7 },
          avatar: { type: "string", nullable: true, example: "/images/avatars/player-7.svg" },
          bio: { type: "string", nullable: true, example: "Descripcion deportiva" },
          location: { type: "string", nullable: true, example: "Concepcion" },
          birthDate: { type: "string", format: "date", nullable: true, example: "2002-07-10" },
        },
      },
      PlayerStatusPayload: {
        type: "object",
        required: ["rosterStatus"],
        properties: {
          rosterStatus: {
            type: "string",
            enum: ["invited", "active", "inactive"],
            example: "active",
          },
        },
      },
      InvitationPayload: {
        type: "object",
        required: ["email", "name", "roleId"],
        properties: {
          email: { type: "string", format: "email", example: "nuevo.jugador@clubmanager.dev" },
          name: { type: "string", example: "Nuevo Jugador" },
          roleId: { type: "integer", example: 3 },
          playerId: { type: "integer", nullable: true, example: null },
          primaryCategoryId: { type: "integer", nullable: true, example: 1 },
          expiresAt: { type: "string", format: "date-time", nullable: true },
        },
      },
      InvitationStatusPayload: {
        type: "object",
        required: ["status"],
        properties: {
          status: {
            type: "string",
            enum: ["pending", "accepted", "expired", "cancelled"],
            example: "cancelled",
          },
        },
      },
      CreatePostPayload: {
        type: "object",
        required: ["type", "content"],
        properties: {
          type: {
            type: "string",
            enum: ["text", "photo", "poll", "event", "announcement"],
            example: "text",
          },
          content: { type: "string", example: "Gran entrenamiento de hoy" },
          pollOptions: {
            type: "array",
            items: { type: "string" },
            example: ["Opcion A", "Opcion B"],
          },
        },
      },
      CommentPayload: {
        type: "object",
        required: ["content"],
        properties: {
          content: { type: "string", example: "Buen partido equipo" },
        },
      },
      VotePayload: {
        type: "object",
        required: ["optionId"],
        properties: {
          optionId: { type: "integer", example: 1 },
        },
      },
    },
  },
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Registrar usuario con invitacion",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterPayload" },
            },
          },
        },
        responses: {
          201: { description: "Registro completado" },
          400: { description: "Datos invalidos" },
          404: { description: "Invitacion no encontrada" },
          409: { description: "Invitacion no disponible o usuario existente" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Iniciar sesion",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginPayload" },
            },
          },
        },
        responses: {
          200: { description: "Sesion iniciada" },
          401: { description: "Credenciales invalidas" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Obtener sesion autenticada",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Sesion actual" },
          401: { description: "Token invalido o ausente" },
        },
      },
    },
    "/api/auth/me/avatar": {
      post: {
        tags: ["Auth"],
        summary: "Subir avatar del usuario autenticado",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["avatar"],
                properties: {
                  avatar: {
                    type: "string",
                    format: "binary",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Avatar actualizado" },
          400: { description: "Archivo invalido" },
          401: { description: "Token invalido o ausente" },
          413: { description: "Archivo demasiado grande" },
        },
      },
    },
    "/api/auth/me/profile": {
      put: {
        tags: ["Auth"],
        summary: "Actualizar perfil del usuario autenticado",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateProfilePayload" },
            },
          },
        },
        responses: {
          200: { description: "Perfil actualizado" },
          400: { description: "Datos invalidos" },
          401: { description: "Token invalido o ausente" },
        },
      },
    },
    "/api/auth/me/email": {
      put: {
        tags: ["Auth"],
        summary: "Actualizar correo del usuario autenticado",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ChangeEmailPayload" },
            },
          },
        },
        responses: {
          200: { description: "Correo actualizado" },
          400: { description: "Datos invalidos" },
          409: { description: "Email duplicado" },
        },
      },
    },
    "/api/auth/me/password": {
      put: {
        tags: ["Auth"],
        summary: "Actualizar password del usuario autenticado",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ChangePasswordPayload" },
            },
          },
        },
        responses: {
          200: { description: "Password actualizada" },
          400: { description: "Datos invalidos" },
        },
      },
    },
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "Listar usuarios",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "email", schema: { type: "string" } },
          { in: "query", name: "displayName", schema: { type: "string" } },
          { in: "query", name: "isActive", schema: { type: "boolean" } },
        ],
        responses: {
          200: { description: "Listado de usuarios" },
          403: { description: "Sin permisos" },
        },
      },
      post: {
        tags: ["Users"],
        summary: "Crear usuario",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserPayload" },
            },
          },
        },
        responses: {
          201: { description: "Usuario creado" },
          409: { description: "Email duplicado" },
        },
      },
    },
    "/api/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Obtener usuario por id",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Usuario encontrado" },
          404: { description: "Usuario no encontrado" },
        },
      },
      put: {
        tags: ["Users"],
        summary: "Actualizar usuario por id",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserUpdatePayload" },
            },
          },
        },
        responses: {
          200: { description: "Usuario actualizado" },
          404: { description: "Usuario no encontrado" },
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Eliminar usuario por id",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Usuario eliminado" },
          404: { description: "Usuario no encontrado" },
        },
      },
    },
    "/api/players": {
      get: {
        tags: ["Players"],
        summary: "Listar jugadores",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "name", schema: { type: "string" } },
          { in: "query", name: "primaryCategoryId", schema: { type: "integer" } },
          { in: "query", name: "rosterStatus", schema: { type: "string", enum: ["invited", "active", "inactive"] } },
        ],
        responses: {
          200: { description: "Listado de jugadores" },
        },
      },
    },
    "/api/players/{id}": {
      get: {
        tags: ["Players"],
        summary: "Obtener jugador por id",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Jugador encontrado" },
          404: { description: "Jugador no encontrado" },
        },
      },
      put: {
        tags: ["Players"],
        summary: "Actualizar ficha del jugador",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PlayerUpdatePayload" },
            },
          },
        },
        responses: {
          200: { description: "Jugador actualizado" },
          403: { description: "Sin permisos" },
        },
      },
    },
    "/api/players/{id}/status": {
      patch: {
        tags: ["Players"],
        summary: "Cambiar estado de roster del jugador",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PlayerStatusPayload" },
            },
          },
        },
        responses: {
          200: { description: "Estado actualizado" },
          403: { description: "Sin permisos" },
        },
      },
    },
    "/api/invitations": {
      get: {
        tags: ["Invitations"],
        summary: "Listar invitaciones",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "email", schema: { type: "string" } },
          { in: "query", name: "roleId", schema: { type: "integer" } },
          { in: "query", name: "status", schema: { type: "string", enum: ["pending", "accepted", "expired", "cancelled"] } },
        ],
        responses: {
          200: { description: "Listado de invitaciones" },
          403: { description: "Sin permisos" },
        },
      },
      post: {
        tags: ["Invitations"],
        summary: "Crear invitacion",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/InvitationPayload" },
            },
          },
        },
        responses: {
          201: { description: "Invitacion creada" },
          400: { description: "Payload invalido" },
          403: { description: "Sin permisos para ese rol" },
          409: { description: "Ya existe usuario o invitacion" },
        },
      },
    },
    "/api/invitations/{id}": {
      get: {
        tags: ["Invitations"],
        summary: "Obtener invitacion por id",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Invitacion encontrada" },
          404: { description: "Invitacion no encontrada" },
        },
      },
    },
    "/api/invitations/token/{token}": {
      get: {
        tags: ["Invitations"],
        summary: "Obtener invitacion por token",
        parameters: [{ in: "path", name: "token", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Invitacion encontrada" },
          404: { description: "Invitacion no encontrada" },
        },
      },
    },
    "/api/invitations/{id}/status": {
      patch: {
        tags: ["Invitations"],
        summary: "Cambiar estado de invitacion",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/InvitationStatusPayload" },
            },
          },
        },
        responses: {
          200: { description: "Estado actualizado" },
          404: { description: "Invitacion no encontrada" },
        },
      },
    },
    "/api/feed": {
      get: {
        tags: ["Feed"],
        summary: "Listar feed del club con paginacion",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", default: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", default: 20 } },
        ],
        responses: {
          200: { description: "Feed obtenido" },
          401: { description: "Token invalido o ausente" },
        },
      },
      post: {
        tags: ["Feed"],
        summary: "Crear publicacion (texto, foto, encuesta, evento o aviso)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["type", "content"],
                properties: {
                  type: {
                    type: "string",
                    enum: ["text", "photo", "poll", "event", "announcement"],
                  },
                  content: { type: "string" },
                  pollOptions: {
                    type: "array",
                    items: { type: "string" },
                  },
                  image: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Publicacion creada" },
          400: { description: "Payload invalido" },
          401: { description: "Token invalido o ausente" },
          413: { description: "Imagen demasiado grande (max 4 MB)" },
        },
      },
    },
    "/api/feed/{postId}/likes": {
      post: {
        tags: ["Feed"],
        summary: "Alternar like en una publicacion",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "postId", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Reaccion actualizada" },
          404: { description: "Publicacion no encontrada" },
        },
      },
    },
    "/api/feed/{postId}/votes": {
      post: {
        tags: ["Feed"],
        summary: "Votar en una encuesta",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "postId", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/VotePayload" },
            },
          },
        },
        responses: {
          200: { description: "Voto registrado" },
          404: { description: "Publicacion u opcion no encontrada" },
        },
      },
    },
    "/api/feed/{postId}/comments": {
      post: {
        tags: ["Feed"],
        summary: "Comentar una publicacion",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "postId", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CommentPayload" },
            },
          },
        },
        responses: {
          201: { description: "Comentario creado" },
          404: { description: "Publicacion no encontrada" },
        },
      },
    },
    "/api/feed/{postId}/comments/{commentId}/replies": {
      post: {
        tags: ["Feed"],
        summary: "Responder un comentario",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "postId", required: true, schema: { type: "integer" } },
          { in: "path", name: "commentId", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CommentPayload" },
            },
          },
        },
        responses: {
          201: { description: "Respuesta creada" },
          404: { description: "Publicacion o comentario no encontrado" },
        },
      },
    },
  },
};

export default swaggerSpec;
