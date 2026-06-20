# Feed — Guía de implementación

Cubre los hooks y patrones disponibles para construir el feed. Para la especificación de los endpoints (schemas, body, respuestas) ver [`api-docs.md`](../api-docs.md).

Para probar cada endpoint interactivamente ir a `/test` con `NEXT_PUBLIC_ENABLE_MSW=true`.

---

## Hooks disponibles

| Hook | Archivo | Para qué sirve |
|------|---------|----------------|
| `useFeed(quantity?, enabled?)` | `hooks/use-feed.ts` | Traer posts del feed |
| `useSearchByTags(tags)` | `hooks/use-feed.ts` | Filtrar posts por tags |
| `useCreateInteraction()` | `hooks/use-interaction.ts` | Like / Guardar |
| `useRemoveInteraction()` | `hooks/use-interaction.ts` | Unlike / Quitar guardado |
| `useFeedNavigation()` | `hooks/use-feed-navigation.ts` | Avanzar, skip, retroceder |
| `useCreateOffer()` | `hooks/use-create-offer.ts` | Hacer oferta (ya existía) |
| `useSellerRating(sellerId)` | `hooks/use-seller-rating.ts` | Rating del vendedor |
| `usePostTags(postId)` | `hooks/use-tags.ts` | Tags de un post específico |
| `useTags()` | `hooks/use-tags.ts` | Tags globales para filtros (ya existía) |

---

## Cargar el feed

```tsx
const { data: posts, isFetching, refetch } = useFeed(20, false);
//                                                         ↑
//                               false = no auto-fetch, disparar con refetch()
```

Pasar `enabled = false` es lo recomendado para el feed: el usuario controla cuándo carga, y se puede llamar `refetch()` después de cada acción para ver el estado actualizado.

```tsx
<button onClick={() => refetch()} disabled={isFetching}>
  {isFetching ? 'Cargando…' : posts ? 'Recargar' : 'Cargar feed'}
</button>
```

---

## Filtrar por tags

```tsx
const [activeTags, setActiveTags] = useState<string[]>([]);
const { data, isLoading } = useSearchByTags(activeTags);
// Solo fetchea cuando activeTags.length > 0
```

Los tags disponibles vienen de `useTags()` (cacheado 10 min). La búsqueda retorna posts que coincidan con **al menos uno** de los tags seleccionados.

---

## Interacciones: like y guardar

Ambas acciones usan el mismo hook con distinto `type`:

```ts
const create = useCreateInteraction();
const remove = useRemoveInteraction();

// Like
create.mutate({ postId: post.id, type: 'Liked' });

// Unlike
remove.mutate({ postId: post.id, type: 'Liked' });

// Guardar
create.mutate({ postId: post.id, type: 'Saved' });

// Quitar guardado
remove.mutate({ postId: post.id, type: 'Saved' });
```

Ambos hooks invalidan `['feed']` en `onSuccess` y muestran toast de error si falla.

> Al hacer una oferta (`useCreateOffer`), el backend registra internamente una interacción `Offered`. No llamar a `createInteraction` por separado.

---

## Navegación del feed

`useFeedNavigation()` maneja el índice del post actual y el historial de interacciones para poder deshacer al retroceder.

```ts
const { currentIndex, canGoBack, advance, goBack } = useFeedNavigation();
const post = posts?.[currentIndex];
```

### Avanzar

`advance(postId, interaction)` registra qué se hizo en el post actual y pasa al siguiente.

```ts
// Después de dar like
await create.mutateAsync({ postId: post.id, type: 'Liked' });
advance(post.id, 'Liked');

// Después de guardar
await create.mutateAsync({ postId: post.id, type: 'Saved' });
advance(post.id, 'Saved');

// Dislike / skip — sin interacción, sin llamada al backend
advance(post.id, null);
```

### Retroceder

`goBack()` es `async`. Revisa el historial: si el post anterior tuvo una interacción, la deshace con `DELETE /api/interaction/:id` antes de decrementar el índice.

```ts
await goBack();
// Si la llamada falla, el post sigue siendo visible (error no bloquea navegación)
```

**Ejemplo de historial y comportamiento:**

```
Estado inicial:
  index = 2
  history = [
    { postId: 'feed_1', interaction: 'Liked' },
    { postId: 'feed_2', interaction: null },   ← skip
  ]

goBack():
  → index: 2 → 1
  → último entry era null → sin llamada al backend

goBack() de nuevo:
  → index: 1 → 0
  → último entry era 'Liked' → DELETE /api/interaction/feed_1 { type: 'Liked' }
```

`canGoBack` es `false` cuando el historial está vacío (estás en el primer post).

---

## Rating del vendedor

El `sellerId` del post está en `post.sellerId`. El endpoint es público (sin auth).

```ts
const { data: rating } = useSellerRating(post.sellerId);
// Solo fetchea cuando sellerId es truthy

// En el modal de oferta:
{rating && (
  <p>{rating.tier} · {rating.score}/5 · {rating.timesRated} calificaciones</p>
)}
```

Tiers: `Bronze` → `Silver` → `Gold` → `Platinum`.

---

## Imágenes y tags de un post

`imagesUrls` en `PostDto` es un string CSV — dividir para mostrar la galería:

```ts
const images = post.imagesUrls.split(',').map((u) => u.trim()).filter(Boolean);
```

Tags del post (categorías como Talla, Condición, Marca, etc.):

```ts
const { data: tags } = usePostTags(post.id);
// → { Talla: ['M'], Condición: 'Nuevo', Marca: ['Nike'], ... }
```

---

## MSW — posts mock disponibles

Con `NEXT_PUBLIC_ENABLE_MSW=true` el feed devuelve estos posts. Los IDs sirven para probar interacciones:

| ID | Título | Tags asignados |
|----|--------|---------------|
| `feed_1` | Parka Oversized Beige | Abrigo, Invierno, Nuevo, Femenino |
| `feed_2` | Camiseta Vintage Nike | Polera, Nike, Casual |
| `feed_3` | Jeans Mom Azul | Pantalón, Azul, M, Casi nuevo |
| `feed_4` | Poleron Adidas Clásico | Adidas, M, Deportivo |
| `feed_5` | Falda Midi Floral | Falda, S, Nuevo, Femenino |
| `feed_6` | Chaqueta Denim Negra | Chaqueta, Denim, XL, Vintage, Negro |
| `feed_7` | Shorts Cargo Verde | Shorts, M, Verde, Casual |
| `feed_8` | Bolso Cuero Camel | Bolso, Cuero, Camel, Casi nuevo |

El handler de search filtra por estos tags (match exacto por nombre). Por ejemplo, `?tags=Nike&tags=Casual` devuelve `feed_2` y `feed_7`.

El seller rating mock devuelve `{ score: 4.2, tier: "Gold", timesRated: 12 }` para cualquier `sellerId`.
