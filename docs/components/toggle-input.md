# ToggleInputGroup

A form-integrated toggle pill group with single or multiple selection, expand/collapse support, size variants, and disabled state. Built on top of Shadcn's `ToggleGroup` and React Hook Form's `FormField`.

## 🎨 Design Specifications
* **Variants:** No explicit variants. Pills use a neutral `#F8F7F4` background by default and switch to `bg-black text-white` when selected.
* **Sizes:** `sm`, `default`, `lg` — scales pill height, font size, padding, button size, and label simultaneously.
* **Aesthetics:** All pills use `rounded-full`. Pills are separated (not grouped), each with an independent border. The "Show more" button matches the pill style and flows inline as the last item in the wrap layout.

## 🛠 API (Props)

| Prop | Type | Default | Description |
| :--- | :--- | :-----: | :---------- |
| `control` | Control<TFieldValues> | — | React Hook Form control object. Required. |
| `name` | `FieldPath<TFieldValues>` | — | Field name tied to the form schema. Required. |
| `label` | `string` | `undefined` | Label displayed above the toggle group. |
| `options` | `{ label: string; value: string }[]` | — | Array of options to render as toggle pills. Required. |
| `type` | `"single" \| "multiple"` | `"single"` | Selection mode. `"single"` prevents deselection once an option is chosen. |
| `limit` | `number` | `options.length` | Maximum number of pills shown before the "Show more" button appears. |
| `size` | `"sm" \| "default" \| "lg"` | `"default"` | Visual scale of the entire component, including label, pills, button, and error message. |
| `disabled` | `boolean` | `false` | Disables all interaction, dims the group, and hides hover/active states on pills. |
| `className` | `string` | `undefined` | Additional class names applied to the `FormItem` wrapper. |

## 🚀 Usage Examples

### Basic Usage — Single Selection
```tsx
<ToggleInputGroup
  control={form.control}
  name="mainStyle"
  label="Main Style"
  options={CLOTHING_STYLES}
/>
```

### Multiple Selection with Limit
```tsx
<ToggleInputGroup
  control={form.control}
  name="secondaryStyles"
  label="Other Styles"
  type="multiple"
  limit={8}
  options={CLOTHING_STYLES}
/>
```

### Large Size Variant
```tsx
<ToggleInputGroup
  control={form.control}
  name="preferences"
  label="Preferences"
  size="lg"
  options={CLOTHING_STYLES}
/>
```

### Disabled with Preset Values
```tsx
<ToggleInputGroup
  control={form.control}
  name="lockedPreferences"
  label="Saved Preferences"
  type="multiple"
  disabled
  options={CLOTHING_STYLES}
/>
```

### With Form Validation
```ts
const schema = z.object({
  // Single selection — must have a value
  mainStyle: z.string().min(1, "Select your main style"),

  // Multiple selection — at least one required
  secondaryStyles: z.array(z.string()).min(1, "Choose at least one"),

  // Optional — for disabled/preset fields
  lockedPreferences: z.array(z.string()).optional(),
});
```

## ⚠️ Technical Notes & Caveats

- **Single selection deselection:** When `type="single"`, deselecting the active option is blocked intentionally. The `onValueChange` handler ignores empty values to enforce that at least one option is always selected.
- **Show more button placement:** The "Show more / Show less" button renders inside the `ToggleGroup` as the last child, so it wraps inline with the pills naturally.
- **Show more button text:** Displays `"Ver {n} más"` / `"Ver menos"` where `n` is the number of hidden options.
- **Disabled and validation:** Marking a field as `disabled` does not skip Zod schema validation. Use `.optional()` in the schema for fields that may be disabled, or ensure the default value already satisfies the schema constraints.
- **Rounded pills:** The component uses `spacing={8}` on the underlying `ToggleGroup` to prevent the grouped (joined) border style, which allows each pill to render with full `rounded-full` independently.
- **Accessibility:** Focus ring is handled by Shadcn's `ToggleGroupItem`. Keyboard navigation between pills works natively via Radix UI. Radix automatically applies `role="group"` to the container and `aria-pressed` to each pill, so screen readers correctly announce the selected state of each option.

## 🔗 References
- Based on: [Shadcn Toggle Group](https://ui.shadcn.com/docs/components/toggle-group) 
- Radix UI primitive: [Radix Toggle Group](https://www.radix-ui.com/primitives/docs/components/toggle-group)