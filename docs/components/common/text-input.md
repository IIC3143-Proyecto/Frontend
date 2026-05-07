# TextInput

A form-integrated text input with optional icon, password visibility toggle, size variants, and disabled state. Built on top of Shadcn's `Input` and React Hook Form's `FormField`.

## 🎨 Design Specifications
* **Variants:** Inherits from Shadcn `Input` (single style, no variants).
* **Sizes:** `sm`, `default`, `lg` — scales height, font size, icon size, and label simultaneously.
* **Aesthetics:** Rounded corners from Shadcn defaults. Icon anchored to the left with consistent padding offsets per size. Password toggle button anchored to the right.

## 🛠 API (Props)

| Prop | Type | Default | Description |
| :--- | :--- | :-----: | :---------- |
| `control` | `Control<TFieldValues>` | — | React Hook Form control object. Required. |
| `name` | `FieldPath<TFieldValues>` | — | Field name tied to the form schema. Required. |
| `label` | `string` | `undefined` | Label displayed above the input. |
| `description` | `string` | `undefined` | Helper text displayed below the input. |
| `type` | `"text" \| "password" \| "email" \| "number" \| "tel" \| "url"` | `"text"` | HTML input type. Passing `"password"` automatically enables the visibility toggle. |
| `size` | `"sm" \| "default" \| "lg"` | `"default"` | Visual scale of the entire component, including label, icon, and error message. |
| `icon` | `TablerIcon` | `undefined` | Icon component from `@tabler/icons-react` displayed inside the input on the left. |
| `disabled` | `boolean` | `false` | Disables interaction, dims the entire field, and passes `disabled` down to the input element. |
| `inputClassName` | `string` | `undefined` | Additional class names applied directly to the `<input>` element. |
| `labelClassName` | `string` | `undefined` | Additional class names applied to the label. |
| `messageClassName` | `string` | `undefined` | Additional class names applied to the validation message. |
| `className` | `string` | `undefined` | Additional class names applied to the `FormItem` wrapper. |
| `...rest` | `React.ComponentProps<"input">` | — | All other standard HTML input props (`placeholder`, `autoComplete`, `maxLength`, etc.) are forwarded directly to the underlying `<input>` element. |

## 🚀 Usage Examples

### Basic Usage
```tsx
<TextInput
  control={form.control}
  name="username"
  label="Username"
  placeholder="e.g. floaq"
/>
```

### With Icon and Size Variant
```tsx
<TextInput
  control={form.control}
  name="email"
  label="Email"
  icon={IconMail}
  size="lg"
  placeholder="you@email.com"
/>
```

### Password Field
```tsx
<TextInput
  control={form.control}
  name="password"
  label="Password"
  type="password"
/>
```

### Disabled Field
```tsx
<TextInput
  control={form.control}
  name="lockedField"
  label="Locked Field"
  disabled
  placeholder="Not editable"
/>
```

### With Form Validation
```ts
const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "At least 6 characters"),
});
```

## ⚠️ Technical Notes & Caveats

- **Controlled value:** Always passes `value={field.value ?? ""}` to prevent React's uncontrolled-to-controlled warning when a field initializes as `undefined`.
- **Password toggle:** Rendered automatically when `type="password"` is passed. No additional prop needed.
- **Disabled and validation:** Marking a field as `disabled` does not bypass Zod schema validation. If the disabled field's default value fails the schema, validation will still fire on submit. Ensure the default value is valid or mark the schema field as `.optional()`.
- **Icon offset:** The `pl-*` padding offset is applied automatically per size when an icon is present, so input text never overlaps the icon.
- **Accessibility:** Focus ring and error ring are handled by Shadcn's `Input`. The password toggle button is fully keyboard accessible. `aria-*` attributes (e.g., `aria-label`, `aria-describedby`) are accepted via `...rest` and forwarded to the underlying `<input>` element.

## 🔗 References
- Based on: [Shadcn Input](https://ui.shadcn.com/docs/components/input) 
- Icons: [Tabler Icons](https://tabler.io/icons)