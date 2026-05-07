# [Component Name]

> One-line summary describing what the component does and its purpose in the context of VTRNA.

## 🎨 Design Specifications
* **Variants:** (e.g., Outline, Default, Ghost)
* **Sizes:** `sm`, `default`, `lg`
* **Aesthetics:** Explain if it uses `rounded-full`, specific colors like `#F8F7F4`, etc.


## 🛠 API (Props)

| Prop      | Type               | Default      | Description                                      |
| :-------- | :----------------- | :----------: | :----------------------------------------------- |
| `size`    | `string`           | `"default"` | Visual scale of the component (e.g., `sm`, `default`, `lg`). |
| `disabled`| `boolean`          | `false`      | Disables interaction and dims the UI.            |
| ...       | ...                | ...          | ...                                              |

> Add or remove props as needed for your component. For form components, include `control` and `name` if using React Hook Form. For UI-only components, list only relevant props.


## 🚀 Usage Examples

### Basic Usage
```tsx
// Standard implementation example
```

### With Form Validation (if applicable)
```ts
// Example of how to define the schema and use with React Hook Form or Zod
```


⚠️ **Technical Notes & Caveats**
- **Transformation:** Explain any value transformations, e.g., if it returns an array, coerces types, etc.
- **Behavior:** Describe any special behaviors (e.g., "The 'Show more' button appears automatically if the options list exceeds the `limit` prop.").
- **Accessibility:** Mention if it handles focus states, keyboard navigation, or screen reader support.

🔗 **References**
- Based on: Link to Shadcn Toggle Group
- Icons used: Tabler Icons
