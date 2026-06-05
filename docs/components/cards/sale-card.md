# SaleCard

> Tarjeta que muestra una publicación del vendedor con su precio, estado actual y progreso en el timeline de venta.

## Design Specifications

- **Views:** `"list"` (horizontal, timeline vertical), `"grid2"` (2-column grid), `"grid4"` (4-column grid)
- **Timeline:** 3 steps — Con ofertas → Oferta aceptada → Venta realizada. Steps are highlighted based on `post.status` and `post.offersCount`
- **Actions menu:** Dropdown with Info, Edit, Delete options

## API (Props)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `post` | `PostDto` | — | The post to display |
| `view` | `"list" \| "grid2" \| "grid4"` | — | Layout variant |
| `onDeleteAction` | `(postId: string) => void` | `undefined` | Called after delete is confirmed. Omit to hide the delete option |
| `isDeleting` | `boolean` | `false` | Shows a loading state on the delete button |

## Usage Examples

### List view
```tsx
<SaleCard post={post} view="list" onDeleteAction={handleDelete} />
```

### Grid view (read-only)
```tsx
{posts.map(p => <SaleCard key={p.id} post={p} view="grid2" />)}
```

## Timeline Logic

| `post.status` | Con ofertas | Oferta aceptada | Venta realizada |
|---|---|---|---|
| `UNPUBLISHED` / `PUBLISHED` with no offers | — | — | — |
| `PUBLISHED` with offers | ✓ | — | — |
| `RESERVED` | ✓ | ✓ | — |
| `SOLD` | ✓ | ✓ | ✓ |

## Technical Notes

- Uses `PostDetailModal` (Info) and `PostEditModal` (Edit) internally
- Uses `ConfirmDialog` for delete confirmation
- ⚠️ `PostEditModal` is a stub — the edit form is not yet implemented
- Image display depends on `post.imagesUrls` (comma-separated string); falls back to a placeholder if empty

## References

- Icons: [@tabler/icons-react](https://tabler.io/icons)
- Related: [PostDetailModal](post-detail-modal.md), [PostEditModal](post-edit-modal.md), [ConfirmDialog](../confirm-dialog.md)
