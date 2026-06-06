# VTRNA API — Documentación Completa

> **Versión:** 1.0  
> **Base URL:** `/api`  
> **Autenticación:** Bearer JWT (Auth0)

---

## Tabla de Contenidos

- [VTRNA API — Documentación Completa](#vtrna-api--documentación-completa)
  - [Tabla de Contenidos](#tabla-de-contenidos)
  - [Autenticación](#autenticación)
  - [Módulos](#módulos)
    - [Health Check](#health-check)
      - [`GET /api`](#get-api)
      - [`GET /health`](#get-health)
    - [Authentication](#authentication)
      - [`GET /api/auth/sync-user` 🔒](#get-apiauthsync-user-)
    - [Posts](#posts)
      - [`POST /api/post` 🔒](#post-apipost-)
      - [`PATCH /api/post` 🔒](#patch-apipost-)
      - [`DELETE /api/post/{id_post}` 🔒](#delete-apipostid_post-)
      - [`GET /api/post/{id_post}` 🔒](#get-apipostid_post-)
      - [`GET /api/post/saved/{id_user}` 🔒](#get-apipostsavedid_user-)
    - [Tags](#tags)
      - [`GET /api/tag` 🔒](#get-apitag-)
    - [Interactions](#interactions)
      - [`POST /api/interaction/{id_post}` 🔒](#post-apiinteractionid_post-)
      - [`DELETE /api/interaction/{id_post}` 🔒](#delete-apiinteractionid_post-)
    - [Images](#images)
      - [`POST /api/image/user/{id_user}` 🔒](#post-apiimageuserid_user-)
      - [`DELETE /api/image/user/{id_user}` 🔒](#delete-apiimageuserid_user-)
      - [`POST /api/image/post/{id_post}` 🔒](#post-apiimagepostid_post-)
      - [`DELETE /api/image/post/{id_post}` 🔒](#delete-apiimagepostid_post-)
    - [Offers](#offers)
      - [`GET /api/offer` 🔒](#get-apioffer-)
      - [`POST /api/offer` 🔒](#post-apioffer-)
      - [`PATCH /api/offer` 🔒](#patch-apioffer-)
  - [Schemas](#schemas)
    - [UserDto](#userdto)
    - [PostDto](#postdto)
    - [NewPostDto](#newpostdto)
    - [PatchPostDto](#patchpostdto)
    - [InteractionDto](#interactiondto)
    - [InteractionRequestDto](#interactionrequestdto)
    - [TagsByCategoryDto](#tagsbycategorydto)
    - [NewImageDto](#newimagedto)
    - [DeleteImageDto](#deleteimagedto)
    - [OfferDto](#offerdto)
    - [NewOfferDto](#newofferdto)
    - [PatchOfferDto](#patchofferdto)
    - [SimpleResponseDto](#simpleresponsedto)
  - [Enumeraciones](#enumeraciones)
    - [UserStatus](#userstatus)
    - [PostStatus](#poststatus)
    - [InteractionType](#interactiontype)
    - [OfferStatus](#offerstatus)

---

## Autenticación

La API utiliza **JWT Bearer Token** emitido por **Auth0**.

Incluir en cada request protegido:

```http
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

Los endpoints marcados con 🔒 requieren autenticación.

---

## Módulos

---

### Health Check

Endpoints para verificar la disponibilidad del servicio.

---

#### `GET /api`

**Mostrar bienvenida**

Retorna un mensaje de bienvenida.

**Ejemplo de request**

```http
GET /api
```

**Respuestas**

| Código | Descripción | Cuerpo |
|--------|-------------|--------|
| `200` | Mensaje retornado correctamente | `"Hello World!"` |

**Ejemplo de respuesta `200`**

```json
"Hello World!"
```

---

#### `GET /health`

**Verificar el estado de la aplicación**

Retorna el estado actual de la API y su disponibilidad.

**Ejemplo de request**

```http
GET /health
```

**Respuestas**

| Código | Descripción | Cuerpo |
|--------|-------------|--------|
| `200` | La aplicación está funcionando correctamente | `{ status, timestamp }` |
| `503` | El servicio no está disponible | — |

**Ejemplo de respuesta `200`**

```json
{
  "status": "ok",
  "timestamp": "2026-04-20T10:00:00Z"
}
```

**Ejemplo de respuesta `503`**

```json
{
  "status": "error",
  "timestamp": "2026-04-20T10:00:00Z"
}
```

---

### Authentication

Endpoints para sincronizar el usuario autenticado con Auth0.

---

#### `GET /api/auth/sync-user` 🔒

**Sincronización del usuario autenticado (Auth0 → DB)**

Operación idempotente que sincroniza el usuario del JWT con la base de datos.

**Comportamiento**

| Caso | Acción |
|------|--------|
| Existe por `providerAuth0` (`sub`) | Actualiza el `email` si cambió y retorna el usuario |
| Existe por `email` sin `providerAuth0` | Vincula el `providerAuth0` y retorna el usuario |
| No existe | Crea un nuevo usuario con `username` único y lo retorna |

**Fuente de datos del JWT**

| Campo | Fuente |
|-------|--------|
| `providerAuth0` | `sub` (Auth0) |
| `email` | Normalizado: lowercase + trim |
| `name` | Auth0 (fallback: prefijo del email) |

**Notas**
- No requiere body.
- No expone datos sensibles.
- Garantiza consistencia entre Auth0 y la base de datos.

**Ejemplo de request**

```http
GET /api/auth/sync-user
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuestas**

| Código | Descripción | Schema |
|--------|-------------|--------|
| `200` | Usuario sincronizado correctamente | [`UserDto`](#userdto) |
| `401` | Token JWT inválido o ausente | — |

**Ejemplo de respuesta `200`**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Florencia",
  "username": "florencia_23",
  "email": "florencia@example.com",
  "providerAuth0": "auth0|64f9a1b2c3d4e5f6a7b8c9d0",
  "bio": "Vendo cosas que ya no uso.",
  "photoUrl": "https://res.cloudinary.com/vtrna/image/upload/v1/users/a1b2c3d4.jpg",
  "contactInfo": {
    "instagram": "@florencia_vende"
  },
  "status": "Activo",
  "createdAtUtcMinus3": "2026-01-15T14:30:00.000Z",
  "updatedAtUtcMinus3": "2026-03-20T09:00:00.000Z",
  "posts": [],
  "interactions": []
}
```

**Ejemplo de respuesta `401`**

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

### Posts

Endpoints para gestionar publicaciones de venta.

---

#### `POST /api/post` 🔒

**Crear una publicación**

Crea una nueva publicación. El vendedor se obtiene del JWT.

**Ejemplo de request**

```http
POST /api/post
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Silla gamer usada",
  "description": "Silla en buen estado, poco uso. Modelo DXRacer, altura ajustable.",
  "priceClp": 80000,
  "isNegotiable": true
}
```

**Body** `application/json` — [`NewPostDto`](#newpostdto)

```json
{
  "title": "Silla gamer usada",
  "description": "Silla en buen estado, poco uso. Modelo DXRacer, altura ajustable.",
  "priceClp": 80000,
  "isNegotiable": true
}
```

**Respuestas**

| Código | Descripción | Schema |
|--------|-------------|--------|
| `201` | La publicación fue creada | [`PostDto`](#postdto) |

**Ejemplo de respuesta `201`**

```json
{
  "id": "f7e6d5c4-b3a2-1098-fedc-ba9876543210",
  "sellerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "buyerId": null,
  "seller": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Florencia",
    "username": "florencia_23",
    "email": "florencia@example.com",
    "providerAuth0": "auth0|64f9a1b2c3d4e5f6a7b8c9d0",
    "bio": "Vendo cosas que ya no uso.",
    "photoUrl": "https://res.cloudinary.com/vtrna/image/upload/v1/users/a1b2c3d4.jpg",
    "contactInfo": {},
    "status": "Activo",
    "createdAtUtcMinus3": "2026-01-15T14:30:00.000Z",
    "updatedAtUtcMinus3": "2026-03-20T09:00:00.000Z",
    "posts": [],
    "interactions": []
  },
  "buyer": null,
  "title": "Silla gamer usada",
  "description": "Silla en buen estado, poco uso. Modelo DXRacer, altura ajustable.",
  "priceClp": 80000,
  "isNegotiable": true,
  "status": "Sin publicar",
  "isActive": true,
  "isDeleted": false,
  "imagesUrls": null,
  "createdAtUtcMinus3": "2026-05-10T11:00:00.000Z",
  "interactions": []
}
```

---

#### `PATCH /api/post` 🔒

**Actualizar una publicación**

Actualiza los campos de una publicación existente. Solo el vendedor puede modificarla.

**Ejemplo de request**

```http
PATCH /api/post
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "id": "f7e6d5c4-b3a2-1098-fedc-ba9876543210",
  "title": "Silla gamer DXRacer - oferta",
  "priceClp": 70000,
  "status": "Publicado"
}
```

**Body** `application/json` — [`PatchPostDto`](#patchpostdto)

```json
{
  "id": "f7e6d5c4-b3a2-1098-fedc-ba9876543210",
  "title": "Silla gamer DXRacer - oferta",
  "priceClp": 70000,
  "status": "Publicado"
}
```

**Respuestas**

| Código | Descripción | Schema |
|--------|-------------|--------|
| `200` | La publicación fue actualizada | [`PostDto`](#postdto) |

**Ejemplo de respuesta `200`**

```json
{
  "id": "f7e6d5c4-b3a2-1098-fedc-ba9876543210",
  "sellerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "buyerId": null,
  "seller": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Florencia",
    "username": "florencia_23",
    "email": "florencia@example.com",
    "providerAuth0": "auth0|64f9a1b2c3d4e5f6a7b8c9d0",
    "status": "Activo",
    "createdAtUtcMinus3": "2026-01-15T14:30:00.000Z",
    "updatedAtUtcMinus3": "2026-03-20T09:00:00.000Z",
    "posts": [],
    "interactions": []
  },
  "buyer": null,
  "title": "Silla gamer DXRacer - oferta",
  "description": "Silla en buen estado, poco uso. Modelo DXRacer, altura ajustable.",
  "priceClp": 70000,
  "isNegotiable": true,
  "status": "Publicado",
  "isActive": true,
  "isDeleted": false,
  "imagesUrls": "[\"https://res.cloudinary.com/vtrna/image/upload/v1/posts/silla1.jpg\"]",
  "createdAtUtcMinus3": "2026-05-10T11:00:00.000Z",
  "interactions": []
}
```

---

#### `DELETE /api/post/{id_post}` 🔒

**Eliminar una publicación**

Elimina (soft delete) una publicación por su ID. El campo `isDeleted` pasa a `true`.

**Parámetros de ruta**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id_post` | `string` | ID de la publicación |

**Ejemplo de request**

```http
DELETE /api/post/f7e6d5c4-b3a2-1098-fedc-ba9876543210
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuestas**

| Código | Descripción | Schema |
|--------|-------------|--------|
| `200` | La publicación fue eliminada | [`PostDto`](#postdto) |

**Ejemplo de respuesta `200`**

```json
{
  "id": "f7e6d5c4-b3a2-1098-fedc-ba9876543210",
  "sellerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "buyerId": null,
  "seller": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Florencia",
    "username": "florencia_23",
    "email": "florencia@example.com",
    "providerAuth0": "auth0|64f9a1b2c3d4e5f6a7b8c9d0",
    "status": "Activo",
    "createdAtUtcMinus3": "2026-01-15T14:30:00.000Z",
    "updatedAtUtcMinus3": "2026-03-20T09:00:00.000Z",
    "posts": [],
    "interactions": []
  },
  "buyer": null,
  "title": "Silla gamer DXRacer - oferta",
  "description": "Silla en buen estado, poco uso.",
  "priceClp": 70000,
  "isNegotiable": true,
  "status": "Sin publicar",
  "isActive": false,
  "isDeleted": true,
  "imagesUrls": null,
  "createdAtUtcMinus3": "2026-05-10T11:00:00.000Z",
  "interactions": []
}
```

---

#### `GET /api/post/{id_post}` 🔒

**Obtener una publicación**

Obtiene una publicación por su ID, incluyendo sus relaciones (vendedor, comprador, interacciones).

**Parámetros de ruta**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id_post` | `string` | ID de la publicación |

**Ejemplo de request**

```http
GET /api/post/f7e6d5c4-b3a2-1098-fedc-ba9876543210
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuestas**

| Código | Descripción | Schema |
|--------|-------------|--------|
| `200` | La publicación fue obtenida | [`PostDto`](#postdto) |

**Ejemplo de respuesta `200`**

```json
{
  "id": "f7e6d5c4-b3a2-1098-fedc-ba9876543210",
  "sellerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "buyerId": null,
  "seller": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Florencia",
    "username": "florencia_23",
    "email": "florencia@example.com",
    "providerAuth0": "auth0|64f9a1b2c3d4e5f6a7b8c9d0",
    "bio": "Vendo cosas que ya no uso.",
    "photoUrl": "https://res.cloudinary.com/vtrna/image/upload/v1/users/a1b2c3d4.jpg",
    "contactInfo": { "instagram": "@florencia_vende" },
    "status": "Activo",
    "createdAtUtcMinus3": "2026-01-15T14:30:00.000Z",
    "updatedAtUtcMinus3": "2026-03-20T09:00:00.000Z",
    "posts": [],
    "interactions": []
  },
  "buyer": null,
  "title": "Silla gamer DXRacer - oferta",
  "description": "Silla en buen estado, poco uso. Modelo DXRacer, altura ajustable.",
  "priceClp": 70000,
  "isNegotiable": true,
  "status": "Publicado",
  "isActive": true,
  "isDeleted": false,
  "imagesUrls": "[\"https://res.cloudinary.com/vtrna/image/upload/v1/posts/silla1.jpg\",\"https://res.cloudinary.com/vtrna/image/upload/v1/posts/silla2.jpg\"]",
  "createdAtUtcMinus3": "2026-05-10T11:00:00.000Z",
  "interactions": [
    {
      "id": "int-001",
      "userId": "b9c8d7e6-f5a4-3210-9876-543210fedcba",
      "postId": "f7e6d5c4-b3a2-1098-fedc-ba9876543210",
      "type": "Liked",
      "createdAtUtcMinus3": "2026-05-11T09:30:00.000Z"
    }
  ]
}
```

---

#### `GET /api/post/saved/{id_user}` 🔒

**Obtener publicaciones guardadas por usuario**

Retorna todas las publicaciones que un usuario guardó mediante una interacción de tipo `Saved`.

**Parámetros de ruta**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id_user` | `string` | ID del usuario |

**Ejemplo de request**

```http
GET /api/post/saved/a1b2c3d4-e5f6-7890-abcd-ef1234567890
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuestas**

| Código | Descripción | Schema |
|--------|-------------|--------|
| `200` | Publicaciones guardadas obtenidas | `Array<`[`PostDto`](#postdto)`>` |

**Ejemplo de respuesta `200`**

```json
[
  {
    "id": "f7e6d5c4-b3a2-1098-fedc-ba9876543210",
    "sellerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "buyerId": null,
    "seller": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "Florencia",
      "username": "florencia_23",
      "email": "florencia@example.com",
      "providerAuth0": "auth0|64f9a1b2c3d4e5f6a7b8c9d0",
      "status": "Activo",
      "createdAtUtcMinus3": "2026-01-15T14:30:00.000Z",
      "updatedAtUtcMinus3": "2026-03-20T09:00:00.000Z",
      "posts": [],
      "interactions": []
    },
    "buyer": null,
    "title": "Silla gamer DXRacer",
    "description": "Poco uso, excelente estado.",
    "priceClp": 70000,
    "isNegotiable": true,
    "status": "Publicado",
    "isActive": true,
    "isDeleted": false,
    "imagesUrls": "[\"https://res.cloudinary.com/vtrna/image/upload/v1/posts/silla1.jpg\"]",
    "createdAtUtcMinus3": "2026-05-10T11:00:00.000Z",
    "interactions": []
  },
  {
    "id": "e1d2c3b4-a5f6-7890-abcd-123456789abc",
    "sellerId": "c3d4e5f6-a7b8-9012-cdef-34567890abcd",
    "buyerId": null,
    "seller": {
      "id": "c3d4e5f6-a7b8-9012-cdef-34567890abcd",
      "name": "Martina",
      "username": "martina_tienda",
      "email": "martina@example.com",
      "providerAuth0": "auth0|74g0b2c3d4e5f6a7b8c9e1",
      "status": "Activo",
      "createdAtUtcMinus3": "2026-02-01T10:00:00.000Z",
      "updatedAtUtcMinus3": "2026-04-10T15:00:00.000Z",
      "posts": [],
      "interactions": []
    },
    "buyer": null,
    "title": "Escritorio de madera",
    "description": "1.40m, buen estado, sin rayones.",
    "priceClp": 45000,
    "isNegotiable": false,
    "status": "Publicado",
    "isActive": true,
    "isDeleted": false,
    "imagesUrls": null,
    "createdAtUtcMinus3": "2026-05-08T16:00:00.000Z",
    "interactions": []
  }
]
```

**Ejemplo de respuesta `200` (lista vacía)**

```json
[]
```

---

### Tags

Endpoints para obtener etiquetas de clasificación.

---

#### `GET /api/tag` 🔒

**Obtener todos los tags agrupados por categoría**

Retorna un mapa de categorías con sus etiquetas disponibles para clasificar publicaciones.

**Ejemplo de request**

```http
GET /api/tag
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuestas**

| Código | Descripción | Schema |
|--------|-------------|--------|
| `200` | Los tags fueron obtenidos | [`TagsByCategoryDto`](#tagsbycategorydto) |

**Ejemplo de respuesta `200`**

```json
{
  "tags": {
    "Electrónica": ["Celulares", "Computadores", "Tablets", "Accesorios", "Audio"],
    "Ropa": ["Hombre", "Mujer", "Niños", "Calzado", "Accesorios de moda"],
    "Hogar": ["Muebles", "Electrodomésticos", "Decoración", "Jardín"],
    "Deportes": ["Bicicletas", "Ropa deportiva", "Equipamiento", "Suplementos"],
    "Libros y educación": ["Textos universitarios", "Literatura", "Cursos", "Material escolar"]
  }
}
```

---

### Interactions

Endpoints para gestionar interacciones de usuarios con publicaciones (likes, guardados, etc.).

---

#### `POST /api/interaction/{id_post}` 🔒

**Crear una nueva interacción**

Registra una interacción del usuario autenticado sobre un post específico.

**Parámetros de ruta**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id_post` | `string` | ID del post sobre el que se interactúa |

**Body** `application/json` — [`InteractionRequestDto`](#interactionrequestdto)

**Tipos de interacción disponibles:** `Liked` | `Saved` | `Offered` | `Purchased`

**Ejemplo de request — dar like**

```http
POST /api/interaction/f7e6d5c4-b3a2-1098-fedc-ba9876543210
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "type": "Liked"
}
```

**Ejemplo de request — guardar publicación**

```http
POST /api/interaction/f7e6d5c4-b3a2-1098-fedc-ba9876543210
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "type": "Saved"
}
```

**Respuestas**

| Código | Descripción | Schema |
|--------|-------------|--------|
| `201` | La interacción fue creada | [`InteractionDto`](#interactiondto) |

**Ejemplo de respuesta `201`**

```json
{
  "id": "int-abc-001",
  "userId": "b9c8d7e6-f5a4-3210-9876-543210fedcba",
  "postId": "f7e6d5c4-b3a2-1098-fedc-ba9876543210",
  "type": "Liked",
  "user": {
    "id": "b9c8d7e6-f5a4-3210-9876-543210fedcba",
    "name": "Carlos",
    "username": "carlos_99",
    "email": "carlos@example.com",
    "providerAuth0": "auth0|55a1b2c3d4e5f6a7b8c9",
    "bio": null,
    "photoUrl": null,
    "contactInfo": {},
    "status": "Activo",
    "createdAtUtcMinus3": "2026-02-10T08:00:00.000Z",
    "updatedAtUtcMinus3": "2026-02-10T08:00:00.000Z",
    "posts": [],
    "interactions": []
  },
  "post": {
    "id": "f7e6d5c4-b3a2-1098-fedc-ba9876543210",
    "sellerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "Silla gamer DXRacer",
    "description": "Poco uso, excelente estado.",
    "priceClp": 70000,
    "isNegotiable": true,
    "status": "Publicado",
    "isActive": true,
    "isDeleted": false,
    "imagesUrls": null,
    "createdAtUtcMinus3": "2026-05-10T11:00:00.000Z",
    "interactions": []
  },
  "createdAtUtcMinus3": "2026-05-12T13:45:00.000Z"
}
```

---

#### `DELETE /api/interaction/{id_post}` 🔒

**Eliminar una interacción**

Elimina una interacción existente del usuario autenticado sobre un post.

**Parámetros de ruta**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id_post` | `string` | ID del post |

**Body** `application/json` — [`InteractionRequestDto`](#interactionrequestdto)

**Ejemplo de request — quitar like**

```http
DELETE /api/interaction/f7e6d5c4-b3a2-1098-fedc-ba9876543210
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "type": "Liked"
}
```

**Ejemplo de request — quitar guardado**

```http
DELETE /api/interaction/f7e6d5c4-b3a2-1098-fedc-ba9876543210
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "type": "Saved"
}
```

**Respuestas**

| Código | Descripción | Schema |
|--------|-------------|--------|
| `200` | La interacción fue eliminada | [`SimpleResponseDto`](#simpleresponsedto) |

**Ejemplo de respuesta `200`**

```json
{
  "message": "Interaction of type Liked deleted successfully"
}
```

---

### Images

Endpoints para gestionar imágenes de usuarios y publicaciones. Usa **Cloudinary** como almacenamiento.

---

#### `POST /api/image/user/{id_user}` 🔒

**Subir imagen de perfil de usuario**

Sube una nueva imagen de perfil. Si el usuario ya tiene una, será reemplazada. Solo se procesa el primer archivo del array.

**Parámetros de ruta**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id_user` | `string` | ID del usuario |

**Body** `multipart/form-data` — [`NewImageDto`](#newimagedto)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `images` | `file[]` | Archivo(s) de imagen. Solo se procesa el primero. |

**Ejemplo de request (curl)**

```bash
curl -X POST "https://api.vtrna.com/api/image/user/a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "images=@/ruta/local/foto_perfil.jpg"
```

**Respuestas**

| Código | Descripción | Schema |
|--------|-------------|--------|
| `201` | Imagen subida exitosamente | [`SimpleResponseDto`](#simpleresponsedto) |
| `400` | Archivo inválido o no proporcionado | — |
| `403` | No puedes cambiar la imagen de otro usuario | — |

**Ejemplo de respuesta `201`**

```json
{
  "message": "Profile image uploaded successfully"
}
```

**Ejemplo de respuesta `400`**

```json
{
  "statusCode": 400,
  "message": "No file provided or invalid file format"
}
```

**Ejemplo de respuesta `403`**

```json
{
  "statusCode": 403,
  "message": "Forbidden: You cannot change another user's image"
}
```

---

#### `DELETE /api/image/user/{id_user}` 🔒

**Eliminar foto de perfil**

Limpia el campo `photoUrl` del usuario. No elimina el archivo de Cloudinary.

**Parámetros de ruta**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id_user` | `string` | ID del usuario |

**Ejemplo de request**

```http
DELETE /api/image/user/a1b2c3d4-e5f6-7890-abcd-ef1234567890
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuestas**

| Código | Descripción | Schema |
|--------|-------------|--------|
| `200` | Foto de perfil eliminada exitosamente | [`SimpleResponseDto`](#simpleresponsedto) |
| `403` | No puedes eliminar la foto de otro usuario | — |

**Ejemplo de respuesta `200`**

```json
{
  "message": "Profile photo deleted successfully"
}
```

**Ejemplo de respuesta `403`**

```json
{
  "statusCode": 403,
  "message": "Forbidden: You cannot delete another user's photo"
}
```

---

#### `POST /api/image/post/{id_post}` 🔒

**Subir imágenes a una publicación**

Sube múltiples imágenes para una publicación. **Reemplaza** todas las imágenes actuales por las nuevas.

**Parámetros de ruta**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id_post` | `string` | ID de la publicación |

**Body** `multipart/form-data` — [`NewImageDto`](#newimagedto)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `images` | `file[]` | Lista de archivos de imagen |

**Ejemplo de request (curl)**

```bash
curl -X POST "https://api.vtrna.com/api/image/post/f7e6d5c4-b3a2-1098-fedc-ba9876543210" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "images=@/ruta/local/silla_frente.jpg" \
  -F "images=@/ruta/local/silla_lado.jpg" \
  -F "images=@/ruta/local/silla_detalle.jpg"
```

**Respuestas**

| Código | Descripción | Schema |
|--------|-------------|--------|
| `201` | Imágenes subidas y vinculadas exitosamente | [`SimpleResponseDto`](#simpleresponsedto) |
| `403` | Solo el vendedor puede subir imágenes | — |
| `404` | La publicación no existe o fue eliminada | — |

**Ejemplo de respuesta `201`**

```json
{
  "message": "Images uploaded and linked to post successfully"
}
```

**Ejemplo de respuesta `403`**

```json
{
  "statusCode": 403,
  "message": "Forbidden: Only the seller can upload images for this post"
}
```

**Ejemplo de respuesta `404`**

```json
{
  "statusCode": 404,
  "message": "Post not found or has been deleted"
}
```

---

#### `DELETE /api/image/post/{id_post}` 🔒

**Eliminar imágenes específicas de una publicación**

Elimina únicamente las imágenes cuyos URLs se indiquen en el body. El resto de imágenes se conservan.

**Parámetros de ruta**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id_post` | `string` | ID de la publicación |

**Body** `application/json` — [`DeleteImageDto`](#deleteimagedto)

**Ejemplo de request**

```http
DELETE /api/image/post/f7e6d5c4-b3a2-1098-fedc-ba9876543210
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "urls": [
    "https://res.cloudinary.com/vtrna/image/upload/v1/posts/silla_lado.jpg",
    "https://res.cloudinary.com/vtrna/image/upload/v1/posts/silla_detalle.jpg"
  ]
}
```

**Respuestas**

| Código | Descripción | Schema |
|--------|-------------|--------|
| `200` | Imágenes eliminadas exitosamente | [`SimpleResponseDto`](#simpleresponsedto) |
| `403` | Solo el vendedor puede eliminar imágenes | — |
| `404` | La publicación no existe | — |

**Ejemplo de respuesta `200`**

```json
{
  "message": "Images deleted successfully from post"
}
```

**Ejemplo de respuesta `403`**

```json
{
  "statusCode": 403,
  "message": "Forbidden: Only the seller can delete images from this post"
}
```

---

### Offers

Endpoints para gestionar ofertas de compra sobre publicaciones.

---

#### `GET /api/offer` 🔒

**Retorna las ofertas entrantes o salientes del usuario**

Dependiendo del query param `incoming`, retorna las ofertas recibidas o realizadas por el usuario autenticado.

**Query Parameters**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `incoming` | `any` | No | Si tiene valor distinto de `0` o falso, retorna ofertas **realizadas** por el usuario. De lo contrario, retorna ofertas **recibidas**. |

**Ejemplo de request — ofertas recibidas (como vendedor)**

```http
GET /api/offer
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Ejemplo de request — ofertas realizadas (como comprador)**

```http
GET /api/offer?incoming=1
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuestas**

| Código | Descripción | Schema |
|--------|-------------|--------|
| `200` | Las ofertas | `Array<`[`OfferDto`](#offerdto)`>` |

**Ejemplo de respuesta `200` — ofertas recibidas**

```json
[
  {
    "id": "ofr-001-abc",
    "buyerId": "b9c8d7e6-f5a4-3210-9876-543210fedcba",
    "buyer": {
      "id": "b9c8d7e6-f5a4-3210-9876-543210fedcba",
      "name": "Carlos",
      "username": "carlos_99",
      "email": "carlos@example.com",
      "providerAuth0": "auth0|55a1b2c3d4e5f6a7b8c9",
      "status": "Activo",
      "createdAtUtcMinus3": "2026-02-10T08:00:00.000Z",
      "updatedAtUtcMinus3": "2026-02-10T08:00:00.000Z",
      "posts": [],
      "interactions": []
    },
    "postId": "f7e6d5c4-b3a2-1098-fedc-ba9876543210",
    "post": {
      "id": "f7e6d5c4-b3a2-1098-fedc-ba9876543210",
      "sellerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Silla gamer DXRacer",
      "description": "Poco uso.",
      "priceClp": 70000,
      "isNegotiable": true,
      "status": "Publicado",
      "isActive": true,
      "isDeleted": false,
      "imagesUrls": null,
      "createdAtUtcMinus3": "2026-05-10T11:00:00.000Z",
      "interactions": []
    },
    "priceClp": 60000,
    "comment": "¿Aceptas 60.000? Puedo ir a buscarla hoy.",
    "status": "pendiente",
    "createdAtUtcMinus3": "2026-05-13T10:00:00.000Z"
  }
]
```

**Ejemplo de respuesta `200` — lista vacía**

```json
[]
```

---

#### `POST /api/offer` 🔒

**Crear una oferta**

El comprador es el usuario autenticado. Crea una oferta sobre una publicación existente.

**Body** `application/json` — [`NewOfferDto`](#newofferdto)

**Ejemplo de request**

```http
POST /api/offer
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "postId": "f7e6d5c4-b3a2-1098-fedc-ba9876543210",
  "priceClp": 60000,
  "comment": "¿Aceptas 60.000? Puedo ir a buscarla hoy."
}
```

**Ejemplo de request — sin comentario**

```http
POST /api/offer
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "postId": "f7e6d5c4-b3a2-1098-fedc-ba9876543210",
  "priceClp": 65000
}
```

**Respuestas**

| Código | Descripción | Schema |
|--------|-------------|--------|
| `201` | La oferta fue creada | [`SimpleResponseDto`](#simpleresponsedto) |

**Ejemplo de respuesta `201`**

```json
{
  "message": "Offer created successfully"
}
```

---

#### `PATCH /api/offer` 🔒

**Modificar el estado de una oferta**

Actualiza el estado de una oferta. Las transiciones válidas dependen del rol del usuario (comprador o vendedor).

**Transiciones de estado válidas**

```
pendiente
  └─► aceptada          (vendedor)
  └─► rechazada         (vendedor)

aceptada
  └─► comprador confirmó  (comprador)
  └─► vendedor confirmó   (vendedor)

comprador confirmó + vendedor confirmó
  └─► exitosa           (cualquiera de los dos)
```

**Body** `application/json` — [`PatchOfferDto`](#patchofferdto)

**Ejemplo de request — vendedor acepta la oferta**

```http
PATCH /api/offer
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "id": "ofr-001-abc",
  "status": "aceptada"
}
```

**Ejemplo de request — vendedor rechaza la oferta**

```http
PATCH /api/offer
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "id": "ofr-001-abc",
  "status": "rechazada"
}
```

**Ejemplo de request — comprador confirma la transacción**

```http
PATCH /api/offer
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "id": "ofr-001-abc",
  "status": "comprador confirmó"
}
```

**Ejemplo de request — vendedor confirma la transacción**

```http
PATCH /api/offer
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "id": "ofr-001-abc",
  "status": "vendedor confirmó"
}
```

**Ejemplo de request — marcar como exitosa (ambas partes ya confirmaron)**

```http
PATCH /api/offer
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "id": "ofr-001-abc",
  "status": "exitosa"
}
```

**Respuestas**

| Código | Descripción | Schema |
|--------|-------------|--------|
| `200` | La oferta fue modificada | [`SimpleResponseDto`](#simpleresponsedto) |

**Ejemplo de respuesta `200`**

```json
{
  "message": "Offer status updated successfully"
}
```

---

## Schemas

---

### UserDto

Representa un usuario de la plataforma.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | `string` | Sí | ID único del usuario |
| `name` | `string` | Sí | Nombre del usuario |
| `username` | `string` | Sí | Nombre de usuario único |
| `email` | `string` | Sí | Email normalizado |
| `providerAuth0` | `string` | Sí | Identificador de Auth0 (`sub`) |
| `bio` | `string` | No | Descripción del perfil |
| `photoUrl` | `string` | No | URL de la foto de perfil |
| `contactInfo` | `object` | No | Información de contacto adicional |
| `status` | `enum` | Sí | Estado del usuario. Ver [UserStatus](#userstatus) |
| `createdAtUtcMinus3` | `datetime` | Sí | Fecha de creación (UTC-3) |
| `updatedAtUtcMinus3` | `datetime` | Sí | Fecha de última actualización (UTC-3) |
| `posts` | `PostDto[]` | Sí | Publicaciones del usuario |
| `interactions` | `InteractionDto[]` | Sí | Interacciones del usuario |

**Ejemplo**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Florencia",
  "username": "florencia_23",
  "email": "florencia@example.com",
  "providerAuth0": "auth0|64f9a1b2c3d4e5f6a7b8c9d0",
  "bio": "Vendo cosas que ya no uso.",
  "photoUrl": "https://res.cloudinary.com/vtrna/image/upload/v1/users/a1b2c3d4.jpg",
  "contactInfo": { "instagram": "@florencia_vende" },
  "status": "Activo",
  "createdAtUtcMinus3": "2026-01-15T14:30:00.000Z",
  "updatedAtUtcMinus3": "2026-03-20T09:00:00.000Z",
  "posts": [],
  "interactions": []
}
```

---

### PostDto

Representa una publicación de venta.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | `string` | Sí | ID único de la publicación |
| `sellerId` | `string` | Sí | ID del vendedor |
| `buyerId` | `string` | No | ID del comprador (cuando se concreta) |
| `seller` | `UserDto` | Sí | Datos del vendedor |
| `buyer` | `UserDto` | No | Datos del comprador |
| `title` | `string` | Sí | Título de la publicación |
| `description` | `string` | Sí | Descripción del artículo |
| `priceClp` | `number` | Sí | Precio en pesos chilenos |
| `isNegotiable` | `boolean` | Sí | Si el precio es negociable |
| `status` | `enum` | Sí | Estado de la publicación. Ver [PostStatus](#poststatus) |
| `isActive` | `boolean` | Sí | Si la publicación está activa |
| `isDeleted` | `boolean` | Sí | Si la publicación fue eliminada (soft delete) |
| `imagesUrls` | `string` | No | URLs de imágenes (JSON serializado) |
| `createdAtUtcMinus3` | `datetime` | Sí | Fecha de creación (UTC-3) |
| `interactions` | `InteractionDto[]` | Sí | Interacciones sobre la publicación |

**Ejemplo**

```json
{
  "id": "f7e6d5c4-b3a2-1098-fedc-ba9876543210",
  "sellerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "buyerId": null,
  "seller": { "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "name": "Florencia", "username": "florencia_23", "..." : "..." },
  "buyer": null,
  "title": "Silla gamer DXRacer",
  "description": "Poco uso, excelente estado.",
  "priceClp": 70000,
  "isNegotiable": true,
  "status": "Publicado",
  "isActive": true,
  "isDeleted": false,
  "imagesUrls": "[\"https://res.cloudinary.com/vtrna/image/upload/v1/posts/silla1.jpg\"]",
  "createdAtUtcMinus3": "2026-05-10T11:00:00.000Z",
  "interactions": []
}
```

---

### NewPostDto

Body para crear una publicación.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `title` | `string` | Sí | Título de la publicación |
| `description` | `string` | Sí | Descripción del artículo |
| `priceClp` | `number` | Sí | Precio en CLP |
| `isNegotiable` | `boolean` | Sí | Si el precio es negociable |

**Ejemplo**

```json
{
  "title": "Silla gamer usada",
  "description": "Silla en buen estado, poco uso. Modelo DXRacer, altura ajustable.",
  "priceClp": 80000,
  "isNegotiable": true
}
```

---

### PatchPostDto

Body para actualizar una publicación. Solo `id` es obligatorio; el resto son opcionales.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | `string` | Sí | ID de la publicación a actualizar |
| `title` | `string` | No | Nuevo título |
| `description` | `string` | No | Nueva descripción |
| `priceClp` | `number` | No | Nuevo precio en CLP |
| `isNegotiable` | `boolean` | No | Nuevo valor de negociabilidad |
| `status` | `enum` | No | Nuevo estado. Ver [PostStatus](#poststatus) |

**Ejemplo — actualizar precio y publicar**

```json
{
  "id": "f7e6d5c4-b3a2-1098-fedc-ba9876543210",
  "priceClp": 65000,
  "status": "Publicado"
}
```

**Ejemplo — solo cambiar título**

```json
{
  "id": "f7e6d5c4-b3a2-1098-fedc-ba9876543210",
  "title": "Silla gamer DXRacer negociable"
}
```

---

### InteractionDto

Representa una interacción de un usuario sobre una publicación.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | `string` | Sí | ID único de la interacción |
| `userId` | `string` | Sí | ID del usuario |
| `postId` | `string` | Sí | ID del post |
| `type` | `enum` | Sí | Tipo de interacción. Ver [InteractionType](#interactiontype) |
| `user` | `UserDto` | Sí | Datos del usuario |
| `post` | `PostDto` | Sí | Datos del post |
| `createdAtUtcMinus3` | `datetime` | Sí | Fecha de creación (UTC-3) |

**Ejemplo**

```json
{
  "id": "int-abc-001",
  "userId": "b9c8d7e6-f5a4-3210-9876-543210fedcba",
  "postId": "f7e6d5c4-b3a2-1098-fedc-ba9876543210",
  "type": "Liked",
  "user": { "id": "b9c8d7e6-...", "name": "Carlos", "username": "carlos_99", "...": "..." },
  "post": { "id": "f7e6d5c4-...", "title": "Silla gamer DXRacer", "...": "..." },
  "createdAtUtcMinus3": "2026-05-12T13:45:00.000Z"
}
```

---

### InteractionRequestDto

Body para crear o eliminar una interacción.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `type` | `enum` | Sí | Tipo de interacción. Ver [InteractionType](#interactiontype) |

**Ejemplos**

```json
{ "type": "Liked" }
```

```json
{ "type": "Saved" }
```

---

### TagsByCategoryDto

Mapa de categorías con sus etiquetas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `tags` | `Record<string, string[]>` | Objeto donde cada clave es una categoría y el valor es un array de etiquetas |

**Ejemplo**

```json
{
  "tags": {
    "Electrónica": ["Celulares", "Computadores", "Tablets"],
    "Hogar": ["Muebles", "Electrodomésticos"]
  }
}
```

---

### NewImageDto

Body para subir imágenes (multipart/form-data).

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `images` | `binary[]` | Sí | Lista de archivos de imagen para subir a Cloudinary |

**Ejemplo (multipart/form-data)**

```
Content-Type: multipart/form-data; boundary=----FormBoundary

------FormBoundary
Content-Disposition: form-data; name="images"; filename="foto.jpg"
Content-Type: image/jpeg

<binary content>
------FormBoundary--
```

---

### DeleteImageDto

Body para eliminar imágenes específicas.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `urls` | `string[]` | Sí | Lista de URLs de las imágenes a eliminar |

**Ejemplo**

```json
{
  "urls": [
    "https://res.cloudinary.com/vtrna/image/upload/v1/posts/silla_lado.jpg",
    "https://res.cloudinary.com/vtrna/image/upload/v1/posts/silla_detalle.jpg"
  ]
}
```

---

### OfferDto

Representa una oferta de compra.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | `string` | Sí | ID único de la oferta |
| `buyerId` | `string` | Sí | ID del comprador |
| `buyer` | `UserDto` | Sí | Datos del comprador |
| `postId` | `string` | Sí | ID de la publicación |
| `post` | `PostDto` | Sí | Datos de la publicación |
| `priceClp` | `number` | Sí | Precio ofertado en CLP |
| `comment` | `string` | No | Comentario adjunto a la oferta |
| `status` | `string` | Sí | Estado actual de la oferta. Ver [OfferStatus](#offerstatus) |
| `createdAtUtcMinus3` | `datetime` | Sí | Fecha de creación (UTC-3) |

**Ejemplo**

```json
{
  "id": "ofr-001-abc",
  "buyerId": "b9c8d7e6-f5a4-3210-9876-543210fedcba",
  "buyer": {
    "id": "b9c8d7e6-f5a4-3210-9876-543210fedcba",
    "name": "Carlos",
    "username": "carlos_99",
    "email": "carlos@example.com",
    "providerAuth0": "auth0|55a1b2c3d4e5f6a7b8c9",
    "status": "Activo",
    "createdAtUtcMinus3": "2026-02-10T08:00:00.000Z",
    "updatedAtUtcMinus3": "2026-02-10T08:00:00.000Z",
    "posts": [],
    "interactions": []
  },
  "postId": "f7e6d5c4-b3a2-1098-fedc-ba9876543210",
  "post": {
    "id": "f7e6d5c4-b3a2-1098-fedc-ba9876543210",
    "title": "Silla gamer DXRacer",
    "priceClp": 70000,
    "status": "Publicado",
    "isActive": true,
    "isDeleted": false,
    "createdAtUtcMinus3": "2026-05-10T11:00:00.000Z"
  },
  "priceClp": 60000,
  "comment": "¿Aceptas 60.000? Puedo ir a buscarla hoy.",
  "status": "aceptada",
  "createdAtUtcMinus3": "2026-05-13T10:00:00.000Z"
}
```

---

### NewOfferDto

Body para crear una oferta.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `postId` | `string` | Sí | ID de la publicación sobre la que se oferta |
| `priceClp` | `number` | Sí | Precio ofertado en CLP |
| `comment` | `string` | No | Comentario opcional para el vendedor |

**Ejemplo con comentario**

```json
{
  "postId": "f7e6d5c4-b3a2-1098-fedc-ba9876543210",
  "priceClp": 60000,
  "comment": "¿Aceptas 60.000? Puedo ir a buscarla hoy."
}
```

**Ejemplo sin comentario**

```json
{
  "postId": "f7e6d5c4-b3a2-1098-fedc-ba9876543210",
  "priceClp": 65000
}
```

---

### PatchOfferDto

Body para modificar el estado de una oferta.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | `string` | Sí | ID de la oferta a modificar |
| `status` | `string` | Sí | Nuevo estado. Ver [OfferStatus](#offerstatus) |

**Ejemplo — aceptar**

```json
{ "id": "ofr-001-abc", "status": "aceptada" }
```

**Ejemplo — rechazar**

```json
{ "id": "ofr-001-abc", "status": "rechazada" }
```

**Ejemplo — comprador confirma**

```json
{ "id": "ofr-001-abc", "status": "comprador confirmó" }
```

**Ejemplo — vendedor confirma**

```json
{ "id": "ofr-001-abc", "status": "vendedor confirmó" }
```

---

### SimpleResponseDto

Respuesta genérica de confirmación.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `message` | `string` | Sí | Mensaje descriptivo del resultado |

**Ejemplo**

```json
{
  "message": "Operation completed successfully"
}
```

---

## Enumeraciones

---

### UserStatus

| Valor | Descripción |
|-------|-------------|
| `En proceso de registro` | El usuario no ha completado su perfil |
| `Inactivo` | El usuario está registrado pero inactivo |
| `Activo` | El usuario está activo y puede operar normalmente |
| `Eliminado` | El usuario fue dado de baja (soft delete) |

---

### PostStatus

| Valor | Descripción |
|-------|-------------|
| `Sin publicar` | La publicación fue creada pero no está visible |
| `Publicado` | La publicación está visible y disponible |
| `Reservado` | La publicación tiene una oferta aceptada en curso |
| `Vendido` | La transacción fue completada |

---

### InteractionType

| Valor | Descripción |
|-------|-------------|
| `Liked` | El usuario le dio "me gusta" a la publicación |
| `Saved` | El usuario guardó la publicación |
| `Offered` | El usuario realizó una oferta (se gestiona internamente) |
| `Purchased` | El usuario completó una compra (se gestiona internamente) |

---

### OfferStatus

Los estados válidos y sus transiciones:

| Valor | Descripción | Quién puede asignarlo |
|-------|-------------|----------------------|
| `pendiente` | Oferta creada, esperando respuesta | — (estado inicial) |
| `aceptada` | El vendedor aceptó la oferta | Vendedor |
| `rechazada` | El vendedor rechazó la oferta | Vendedor |
| `comprador confirmó` | El comprador confirmó haber recibido/pagado | Comprador |
| `vendedor confirmó` | El vendedor confirmó haber entregado/cobrado | Vendedor |
| `exitosa` | Ambas partes confirmaron — transacción completada | Cualquiera (cuando ambos confirmaron) |

**Diagrama de transiciones:**

```
pendiente ──► aceptada ──► comprador confirmó ──┐
          │                                      ├──► exitosa
          │            ──► vendedor confirmó ───┘
          └──► rechazada
```
