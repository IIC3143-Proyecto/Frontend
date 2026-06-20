# MiniRoundButton

> Botón circular compacto (32×32 px) para acciones secundarias en tarjetas, listas y toolbars.

## Design Specifications

- **Shape:** Circular (`rounded-full`)
- **Size:** Fixed 32×32 px (`h-8 w-8`)
- **Background:** `bg-popover` with `shadow-sm`
- **Interaction:** Scales down to 95% on press (`active:scale-95`); disabled state skips the scale animation

## API (Props)

Extends `React.ButtonHTMLAttributes<HTMLButtonElement>` — all standard button attributes are forwarded.

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Icon or content inside the button |
| `className` | `string` | Additional classes merged via `cn()` |
| `disabled` | `boolean` | Disables the button and removes the press animation |
| `onClick` | `MouseEventHandler` | Click handler |

## Usage Examples

### With an icon
```tsx
import { IconPencil } from '@tabler/icons-react'

<MiniRoundButton onClick={handleEdit} aria-label="Editar">
  <IconPencil size={16} />
</MiniRoundButton>
```

### Disabled state
```tsx
<MiniRoundButton disabled>
  <IconTrash size={16} />
</MiniRoundButton>
```

## Technical Notes

- Renders a shadcn/ui `Button` with `variant="ghost"` and `size="icon"` — inherits all Button accessibility and keyboard behavior
- ⚠️ Always add `aria-label` when the button contains only an icon
- The `className` prop is merged after the base classes — can override `bg-popover` or `shadow-sm` if needed

## References

- Based on: [shadcn/ui Button](https://ui.shadcn.com/docs/components/button)
- Icons: [@tabler/icons-react](https://tabler.io/icons)
