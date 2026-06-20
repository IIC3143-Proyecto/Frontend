# PostDetailModal

> Modal de solo lectura que muestra los detalles completos de una publicación.

## API (Props)

| Prop | Type | Description |
|------|------|-------------|
| `open` | `boolean` | Controls modal visibility |
| `onClose` | `() => void` | Called when the modal is dismissed |
| `post` | `PostDto` | The post to display |

## Usage Examples

```tsx
<PostDetailModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  post={selectedPost}
/>
```

## Technical Notes

- ⚠️ Category, specs, and location sections currently show hardcoded placeholder values — these fields are pending on the backend (`PostDto` does not yet include them)
- Images are displayed from `post.imagesUrls` (comma-separated string)
- Read-only — no actions beyond closing the modal

## References

- Based on: [shadcn/ui Dialog](https://ui.shadcn.com/docs/components/dialog)
- Related: [SaleCard](sale-card.md)
