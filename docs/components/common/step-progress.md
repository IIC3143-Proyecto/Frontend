# StepProgress

A horizontal step indicator with numbered dots connected by lines. Completed steps and the active step are highlighted; future steps are muted.

## 🎨 Design Specifications

* **Variants:** No explicit variants. Active and completed steps use `bg-chart-4` (brand color) with white text; future steps use `bg-muted`. Disabled state replaces the brand color with `bg-muted-foreground/30`.
* **Sizes:** `sm`, `default`, `lg` — scales dot size, font size, connector line height, and gap simultaneously.
* **Aesthetics:** Dots are `rounded-full`. The active step adds a `ring-2` offset ring to distinguish it from completed steps. Connector lines are `rounded-full` and `flex-1`, filling the available space between dots.

## 🛠 API (Props)

| Prop | Type | Default | Description |
| :--- | :--- | :-----: | :---------- |
| `currentStep` | `number` | — | 1-based index of the active step. Required. |
| `totalSteps` | `number` | — | Total number of steps to render. Required. |
| `size` | `"sm" \| "default" \| "lg"` | `"default"` | Visual size variant. |
| `disabled` | `boolean` | `false` | Renders all active/completed steps in a muted color scheme instead of the brand color. |
| `className` | `string` | `undefined` | Additional class names applied to the root element. |

## 🚀 Usage Examples

### Basic Usage
```tsx
<StepProgress currentStep={2} totalSteps={3} />
```

### Mobile (5-step flow)
```tsx
<StepProgress currentStep={step} totalSteps={5} />
```

### Desktop (3-step flow)
```tsx
<StepProgress currentStep={step} totalSteps={3} />
```

### Disabled (e.g., while submitting)
```tsx
<StepProgress currentStep={step} totalSteps={totalSteps} disabled={isSubmitting} />
```

## ⚠️ Technical Notes & Caveats

- **1-based indexing:** `currentStep` is 1-based (first step is `1`, not `0`). A step at index `i` is completed when `i + 1 < currentStep` and active when `i + 1 === currentStep`.
- **Connector lines:** A connector line is rendered between each pair of adjacent dots (`i < totalSteps - 1`). A completed connector (`isCompleted`) turns brand-colored; pending connectors stay muted.
- **Disabled vs. active:** The `disabled` prop only changes the color scheme — it does not prevent step navigation. Use it when the form is being submitted to visually reflect the non-interactive state.

## 🔗 References

- Design token: `bg-chart-4` (brand highlight color defined in Tailwind config)
