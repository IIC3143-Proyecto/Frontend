# PhotoUploadGrid

A sequential-unlock photo upload grid that compresses each selected image to WebP before storing it. Only one slot is active at a time; the next unlocks once the previous is filled.

## 🎨 Design Specifications

* **Variants:** No explicit variants. Each slot renders a dashed border when empty and active, transparent border when filled, and a dimmed background when locked.
* **Sizes:** `sm`, `default`, `lg` — scales the add icon, delete button, and delete icon simultaneously.
* **Aesthetics:** Square slots with `rounded-lg` and `aspect-square`. The filled state shows an `object-cover` image with an absolute delete button in the top-right corner. The active (empty) slot shows a `+` icon on a muted background with drag-and-drop support.

## 🛠 API (Props)

| Prop | Type | Default | Description |
| :--- | :--- | :-----: | :---------- |
| `photos` | `PhotoItem[]` | — | Current list of uploaded photos. Required. |
| `onAddPhoto` | `(file: File, preview: string) => void` | — | Called with the compressed WebP `File` and its `blob:` object URL preview. Required. |
| `onRemovePhoto` | `(index: number) => void` | — | Called with the slot index when a photo is deleted. Required. |
| `validationError` | `string \| null` | `undefined` | External validation message displayed below the grid (e.g. "Debes subir al menos 3 fotos"). |
| `maxPhotos` | `number` | `6` | Total number of slots rendered. |
| `columns` | `3 \| 6` | `3` | Grid column count. Use `3` for mobile (default) and `6` for a single desktop row. |
| `size` | `"sm" \| "default" \| "lg"` | `"default"` | Visual size variant. |
| `disabled` | `boolean` | `false` | Disables all interaction and dims the entire grid. |

## 🚀 Usage Examples

### Basic Usage — Mobile (3 columns)
```tsx
<PhotoUploadGrid
  photos={photos}
  onAddPhoto={addPhoto}
  onRemovePhoto={removePhoto}
/>
```

### Desktop — Single Row (6 columns)
```tsx
<PhotoUploadGrid
  photos={photos}
  onAddPhoto={addPhoto}
  onRemovePhoto={removePhoto}
  columns={6}
/>
```

### With Validation Error
```tsx
<PhotoUploadGrid
  photos={photos}
  onAddPhoto={addPhoto}
  onRemovePhoto={removePhoto}
  validationError={photoError}
/>
```

### With Form Hook (useCreatePost pattern)
```tsx
const { photos, addPhoto, removePhoto, photoError } = useCreatePost(onClose);

<PhotoUploadGrid
  photos={photos}
  onAddPhoto={addPhoto}
  onRemovePhoto={removePhoto}
  validationError={photoError}
  columns={6}
/>
```

## ⚠️ Technical Notes & Caveats

- **Sequential unlock:** Only the slot at `index === photos.length` is active. Slots after that are locked (not clickable). This prevents gaps in the photo list.
- **WebP compression:** Every accepted image is compressed to WebP (max 2 MB, max 1200 px, quality 0.85) via `browser-image-compression` before `onAddPhoto` is called. The original file is never stored.
- **Preview URLs:** The `preview` string passed to `onAddPhoto` is a `blob:` URL created with `URL.createObjectURL`. The parent is responsible for revoking it (e.g., `URL.revokeObjectURL(p.preview)` on removal or reset).
- **Accepted formats:** `image/*` with extensions `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.avif`. Max file size before compression: 10 MB.
- **Disabled state:** When `disabled` is true, the grid renders with `opacity-60 pointer-events-none`. Individual slots also check the `disabled` prop and skip the dropzone.
- **`img` element:** Uses a plain `<img>` (not `next/image`) because photos are `blob:` URLs generated at runtime, which `next/image` does not support without a custom loader.

## 🔗 References

- Image compression: [browser-image-compression](https://github.com/Donaldcwl/browser-image-compression)
- File drag-and-drop: [react-dropzone](https://react-dropzone.js.org/)
