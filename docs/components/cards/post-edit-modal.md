# PostEditModal

> Modal para editar una publicación existente.

## API (Props)

| Prop | Type | Description |
|------|------|-------------|
| `open` | `boolean` | Controls modal visibility |
| `onClose` | `() => void` | Called when the modal is dismissed |
| `post` | `PostDto` | The post to edit |

## Usage Examples

```tsx
<PostEditModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  post={selectedPost}
/>
```

## Technical Notes

- ⚠️ This component is a stub — the edit form is not yet implemented. The modal renders an empty `DialogContent` with a title placeholder
- Blocked by backend endpoints `PATCH /api/post` (title/description/price) and `PATCH /api/post/:id/tags` (#48)

## References

- Based on: [shadcn/ui Dialog](https://ui.shadcn.com/docs/components/dialog)
- Related: [SaleCard](sale-card.md)
