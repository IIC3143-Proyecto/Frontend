# PostEditModal

> Modal de acordeón para editar una publicación existente. Implementado — reemplaza el stub anterior.

## API (Props)

| Prop | Type | Description |
|------|------|-------------|
| `open` | `boolean` | Controls modal visibility |
| `onClose` | `() => void` | Called when the modal is dismissed |
| `post` | `PostDto` | The post to edit — fields pre-populated on open |

## Sections (accordion)

| Section | Fields | Notes |
|---------|--------|-------|
| Título | `title` (text) | Required |
| Precio & Negociable | `priceClp` (number, CLP), `isNegotiable` (switch) | Disabled + lock icon when `post.offersCount > 0` |
| Descripción | `description` (textarea) | Optional |
| Fotos de la prenda | `PhotoUploadGrid` unified (existing + new) | Existing photos preloaded as filled slots; min 3 required |
| Especificaciones esenciales | Talla, Condición, Tipo de prenda | Required — pre-populated from `GET /api/post/:id/tags` |
| Especificaciones opcionales | Marca, Color, Género, Estilo, Temporada | Optional — pre-populated from `GET /api/post/:id/tags` |

## Behavior

- All sections start collapsed; each expands/collapses independently (Accordion `type="multiple"`)
- Red banner shown when price is locked (`offersCount > 0`): "Precio bloqueado — hay ofertas activas"
- Tags pre-populated via `useQuery(['postTags', post.id])` → `GET /api/post/:id/tags` (MSW stub until backend ships)
- Existing photos represented as `PhotoItem` with dummy `File` (size=0); new uploads have real `File` objects
- On save:
  1. `PATCH /api/post` — updates title, description, priceClp, isNegotiable
  2. `DELETE /api/image/post/:id` — only if existing photos were removed
  3. `PATCH /api/image/post/:id` — appends new photos (backend pending; MSW stub)
  4. `PATCH /api/post/:id/tags` — updates tags (backend pending; always succeeds in dev)

## Usage

```tsx
<PostEditModal
  open={editOpen}
  onClose={() => setEditOpen(false)}
  post={post}
/>
```

## Technical Notes

- Uses `useEditPost` hook (`src/hooks/use-edit-post.ts`) for all state and API calls
- `PATCH /api/image/post/:id` (append images) and `GET /api/post/:id/tags` are pending backend implementation — tracked in `tests/contract/unimplemented.spec.ts`
- `Condición` is a `type="single"` toggle (radio behavior); all others are `type="multiple"`

## References

- Hook: [useEditPost](../../../src/hooks/use-edit-post.ts)
- Related: [SaleCard](sale-card.md), [PostCreateModal](post-create-modal.md)
- [Integration tests](../../testing/integration-tests.md)
