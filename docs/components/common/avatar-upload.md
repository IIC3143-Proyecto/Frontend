# AvatarUpload

> Circular avatar picker that accepts any common image format, converts it to WebP in-browser, shows a live preview, and surfaces both dropzone-level and parent-supplied validation errors.

## 🎨 Design Specifications

* **Variants:** Single style — circular frame with a hover overlay.
* **Sizes:** `sm` (56 px), `md` (96 px), `lg` (128 px) — scales the avatar circle, overlay icon, and fallback icon simultaneously.
* **Aesthetics:** `rounded-full` frame. Semi-transparent black overlay (`bg-black/50`) fades in on hover showing a camera icon (or a spinner while converting). A red `*` badge appears at top-right when `required={true}`. Error state adds a destructive-color border and a soft shadow on focus/hover.


## 🛠 API (Props)

| Prop | Type | Default | Description |
| :--- | :--- | :-----: | :---------- |
| `src` | `string` | `undefined` | URL of an existing avatar to display before any file is selected. |
| `fallback` | `string \| ReactNode` | `<IconUserPlus>` | Content shown inside the avatar when no image is available. |
| `onChange` | `(file: File) => void` | `undefined` | Called with the converted WebP `File` after the user selects an image. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Visual scale of the avatar circle. |
| `disabled` | `boolean` | `false` | Disables the dropzone and dims the component. |
| `maxSizeMB` | `number` | `1` | Maximum output file size in MB passed to `useAvatarUpload`. |
| `maxWidthOrHeight` | `number` | `512` | Maximum output dimension in px passed to `useAvatarUpload`. |
| `quality` | `number` | `0.85` | WebP quality (0–1) passed to `useAvatarUpload`. |
| `maxDropzoneSize` | `number` | `5242880` | Maximum *input* file size accepted by the dropzone (bytes). Defaults to 5 MB. |
| `validationError` | `string \| null` | `undefined` | External error message (e.g. from a form submission). Takes precedence for display when no internal error is present. |
| `onFileDialogCancel` | `() => void` | `undefined` | Called when the file dialog is dismissed without selecting a file. |
| `required` | `boolean` | `false` | Adds `aria-required` and shows the `*` badge. Does not enforce validation internally. |
| `className` | `string` | `undefined` | Additional classes applied to the outer wrapper `<div>`. |
| `...rest` | `HTMLAttributes<HTMLDivElement>` | — | Forwarded to the outer wrapper `<div>`. |


## 🚀 Usage Examples

### Standalone (uncontrolled preview)
```tsx
<AvatarUpload
  size="lg"
  onChange={(file) => console.log('ready:', file.name)}
/>
```

### With an existing image
```tsx
<AvatarUpload
  src={user.photoUrl}
  size="md"
  onChange={handleAvatarChange}
/>
```

### Inside a form with external validation
```tsx
const [avatarFile, setAvatarFile] = useState<File | undefined>();
const [avatarError, setAvatarError] = useState<string | null>(null);

const handleSubmitClick = () => {
  if (!avatarFile) setAvatarError('Avatar es requerido');
};

const handleAvatarChange = (file: File) => {
  setAvatarFile(file);
  setAvatarError(null);
};

<AvatarUpload
  size="lg"
  required
  onChange={handleAvatarChange}
  validationError={avatarError}
  disabled={isSubmitting}
/>

<Button onMouseDown={handleSubmitClick} type="submit">
  Save
</Button>
```

> `onMouseDown` is used instead of `onClick` on the submit button so the avatar error is set *before* the form's `onSubmit` fires.

### With custom compression settings
```tsx
<AvatarUpload
  size="sm"
  maxSizeMB={0.5}
  maxWidthOrHeight={256}
  quality={0.7}
  onChange={handleAvatarChange}
/>
```


## ⚠️ Technical Notes & Caveats

- **WebP conversion:** The component uses the `useAvatarUpload` hook (`src/hooks/use-avatar-upload.ts`), which calls `browser-image-compression` to convert any accepted image format (JPEG, PNG, GIF, WebP, AVIF) to WebP. The `onChange` callback always receives a `.webp` `File`, regardless of the original format.
- **Two error layers:** Internal errors (dropzone file rejection or conversion failure) are managed by the component itself. `validationError` is an external channel for server-side or form-level errors. Both are rendered in the same error slot below the circle; internal errors take precedence.
- **Preview URL lifecycle:** The object URL for the preview is created by `useAvatarUpload` and revoked automatically on unmount. Do not revoke it manually.
- **`required` is display-only:** The `required` prop adds `aria-required` and the `*` badge but does not prevent submission. Enforce the "avatar required" rule in the parent form's submit handler (see usage example above).
- **Accepted formats:** `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.avif`. Files outside this list or above `maxDropzoneSize` are rejected by the dropzone with a localised error message.
- **Accessibility:** The dropzone root has `role="img"` and `aria-label`. The hidden `<input type="file">` also has an `aria-label`. Focus ring and error shadow follow the design system's ring/destructive tokens.
- **Status text:** The hint below the circle reflects current state — idle (`"Haz clic o arrastra para cambiar la imagen"`), converting (`"Convirtiendo a WebP…"`), disabled (`"Subida de avatar deshabilitada"`), or error message.


## 🔗 References

- Hook: `src/hooks/use-avatar-upload.ts`
- Compression: [browser-image-compression](https://github.com/Donaldcwl/browser-image-compression)
- Dropzone: [react-dropzone](https://react-dropzone.js.org/)
- Avatar primitive: [Shadcn Avatar](https://ui.shadcn.com/docs/components/avatar)
- Icons: [Tabler Icons](https://tabler.io/icons) — `IconUserPlus`, `IconCamera`, `IconLoader2`
