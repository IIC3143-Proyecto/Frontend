# MetroInput

Multi-select station picker for the Santiago metro system with line filtering, search, and responsive sizing.

## 🎨 Design Specifications

- **Variants:** Single display mode with dual interaction patterns (line selection + search)
- **Sizes:** `sm`, `default`, `lg` — adjusts label, buttons, pills, and station grid sizing
- **Aesthetics:** 
  - Pills: rounded-full, black background with white text when selected
  - Line buttons: outline style with `bg-muted/40` that blend into their row; black when active
  - Stations grid: auto-fill columns with configurable min-width per size
  - Borders: dashed for pills zone, solid for main container

## 🛠 API (Props)

| Prop       | Type               | Default     | Description                                                   |
| :--------- | :----------------- | :---------: | :------------------------------------------------------------- |
| `control`  | `Control<T>`       | —           | React Hook Form control instance.                              |
| `name`     | `FieldPath<T>`     | —           | Field path within the form schema.                             |
| `label`    | `string`           | `undefined` | Label text. Styled with size-specific typography.              |
| `size`     | `"sm" \| "default" \| "lg"` | `"default"` | Visual scale affecting all child elements.           |
| `disabled` | `boolean`          | `false`     | Disables interactions and hides scrolling.                     |
| `className`| `string`           | `undefined` | Additional CSS classes applied to `FormItem`.                  |

## 🚀 Usage Examples

### Basic Usage with Zod Schema

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MetroInput } from "@/components/common/metro-input";
import { Form } from "@/components/ui/form";

const schema = z.object({
  stations: z.array(z.string()).min(1, "Select at least one station"),
});

export function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { stations: [] },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(console.log)}>
        <MetroInput
          control={form.control}
          name="stations"
          label="Estaciones"
          size="default"
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  );
}
```

### With Size Variants

```tsx
// Small variant
<MetroInput control={form.control} name="stations" label="Estaciones" size="sm" />

// Large variant
<MetroInput control={form.control} name="stations" label="Estaciones" size="lg" />

// Disabled state
<MetroInput control={form.control} name="stations" label="Estaciones" disabled />
```

## ⚠️ Technical Notes & Caveats

- **Data Shape:** Returns an array of station names (strings). E.g., `["Mapocho", "U de Chile"]`.
- **Search vs. Line Mode:** 
  - *Normal mode* (no search): Displays stations from the currently selected line.
  - *Search mode* (text entered): Shows all matching stations across all lines; line buttons are disabled and deselected.
  - When search is cleared, the previously selected line is restored automatically.
- **Line Buttons:** Styled as outline pills that blend with the row background (`bg-muted/40`); become prominent (black) when selected.
- **Pills Display:** Fixed height with horizontal scroll. When `disabled`, scrolling is prevented (`overflow-hidden`).
- **Station Grid:** Uses `auto-fill` columns with size-specific min-widths to adapt to different viewport widths.
- **Scroll Behavior:** Both the pills and station grid disable scrolling when the component is `disabled`.
- **Default Selection:** The first available metro line is selected on mount.

## 🪝 Hook: `useMetroStations`

Fetches and caches metro station data. Used internally by `MetroInput`.

### API

```tsx
function useMetroStations(): {
  lines: Array<{ number: string; stations: string[] }>,
  loading: boolean,
  error: string | null
}
```

### Behavior

- **Caching:** Data is cached in `localStorage` under key `'metro-stations'`. On subsequent renders, cached data is used without fetching.
- **Fetch:** Calls `GET /api/metro/stations` which returns a flat array of `{ name: string; line: string }` objects. The hook re-groups them by line number.
- **Error Handling:** If the fetch fails, `error` is set with the error message and `lines` remains empty.

### Example

```tsx
const { lines, loading, error } = useMetroStations();

if (loading) return <p>Cargando líneas...</p>;
if (error) return <p>Error: {error}</p>;

lines.forEach(line => {
  console.log(`Línea ${line.number}: ${line.stations.length} stations`);
});
```

## 🔗 References

- Built with: [Shadcn ToggleGroup](https://ui.shadcn.com/docs/components/toggle-group), [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- Mocking: Mock Service Worker (MSW) — see `src/lib/msw/mocks/handlers.ts`
- Data: `src/lib/msw/mocks/data/metro-stations.json`
