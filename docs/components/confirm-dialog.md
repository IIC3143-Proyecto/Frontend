# ConfirmDialog

> Modal de confirmación para acciones que requieren validación explícita del usuario antes de ejecutarse.

## API (Props)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Controls dialog visibility |
| `onClose` | `() => void` | — | Called when the dialog is dismissed (cancel or backdrop click) |
| `onConfirm` | `() => void` | — | Called when the confirm button is clicked |
| `title` | `string` | — | Dialog heading |
| `description` | `string` | — | Explanatory text below the title |
| `cancelLabel` | `string` | `"Cancelar"` | Cancel button label |
| `confirmLabel` | `string` | `"Confirmar"` | Confirm button label |
| `variant` | `"default" \| "destructive"` | `"default"` | `"destructive"` styles the confirm button in red |

## Usage Examples

### Delete confirmation
```tsx
<ConfirmDialog
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  title="Eliminar publicación"
  description="Esta acción no se puede deshacer."
  confirmLabel="Eliminar"
  variant="destructive"
/>
```

### Generic confirmation
```tsx
<ConfirmDialog
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleConfirm}
  title="¿Confirmar acción?"
  description="Estás a punto de realizar un cambio."
/>
```

## Technical Notes

- Wraps shadcn/ui `AlertDialog` — accessible by default, traps focus, dismissible via Escape key
- `onClose` is called both on cancel button click and on backdrop/Escape dismiss (`onOpenChange`)
- Use `variant="destructive"` for irreversible actions (delete, remove)
- ⚠️ The confirm button does not close the dialog automatically — the parent must set `open={false}` inside `onConfirm`

## References

- Based on: [shadcn/ui AlertDialog](https://ui.shadcn.com/docs/components/alert-dialog)
