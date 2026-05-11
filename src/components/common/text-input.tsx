"use client";

import * as React from "react";
import { Control, FieldValues, FieldPath } from "react-hook-form";
import { Icon as TablerIcon, IconEye, IconEyeOff } from "@tabler/icons-react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Supported input types for the TextInput component.
 */
type InputType = "text" | "password" | "email" | "number" | "tel" | "url";

/**
 * Supported size options for the TextInput component.
 */
type TextInputSize = "sm" | "default" | "lg";

/**
 * Size-based class names for TextInput and its elements.
 */
const sizeClasses = {
  sm: {
    label: "text-[9px]",
    icon: "h-3.5 w-3.5",
    iconOffset: "pl-8",
    input: "h-8 text-xs",
    eyeButton: "h-8",
    message: "text-[10px]",
  },
  default: {
    label: "text-[10px]",
    icon: "h-4 w-4",
    iconOffset: "pl-9",
    input: "h-10 text-sm",
    eyeButton: "h-10",
    message: "text-xs",
  },
  lg: {
    label: "text-xs",
    icon: "h-5 w-5",
    iconOffset: "pl-10",
    input: "h-12 text-base",
    eyeButton: "h-12",
    message: "text-sm",
  },
};

/**
 * Props for the internal InputControl component.
 * @property icon Optional icon to display inside the input.
 * @property isPassword If true, enables password visibility toggle.
 * @property inputClassName Additional class names for the input element.
 * @property size Size of the input (sm, default, lg).
 */
type InputControlProps = Omit<React.ComponentProps<"input">, "size"> & {
  icon?: TablerIcon;
  isPassword?: boolean;
  inputClassName?: string;
  size?: TextInputSize;
};

/**
 * Internal input control with icon and password toggle support.
 */
const InputControl = React.forwardRef<HTMLInputElement, InputControlProps>(
  function InputControl({ icon: Icon, isPassword, type, inputClassName, size = "default", ...props }, ref) {
    const { error } = useFormField();
    const [showPassword, setShowPassword] = React.useState(false);
    const finalType = isPassword ? (showPassword ? "text" : "password") : type;
    const s = sizeClasses[size];

    return (
      <div className="relative flex items-center">
        {Icon && (
          <Icon
            className={cn(
              "absolute left-3 transition-colors pointer-events-none",
              s.icon,
              error ? "text-destructive" : "text-muted-foreground/70"
            )}
          />
        )}
        <FormControl>
          <Input
            {...props}
            ref={ref}
            type={finalType}
            className={cn(s.input, Icon && s.iconOffset, isPassword && "pr-10", inputClassName)}
          />
        </FormControl>
        {isPassword && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={props.disabled}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className={cn("absolute right-0 px-3", s.eyeButton)}
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? (
              <IconEyeOff className={s.icon} />
            ) : (
              <IconEye className={s.icon} />
            )}
          </Button>
        )}
      </div>
    );
  }
);
InputControl.displayName = "InputControl";

/**
 * Props for the TextInput component.
 * @template TFieldValues Type of form field values.
 * @property control react-hook-form control object.
 * @property name Field name.
 * @property label Optional label text.
 * @property description Optional description below the input.
 * @property type Input type (text, password, etc).
 * @property size Input size (sm, default, lg).
 * @property icon Optional icon to display inside the input.
 * @property inputClassName Additional class names for the input element.
 * @property labelClassName Additional class names for the label.
 * @property messageClassName Additional class names for the message.
 */
interface TextInputProps<TFieldValues extends FieldValues>
  extends Omit<React.ComponentProps<"input">, "name" | "type" | "size"> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  type?: InputType;
  size?: TextInputSize;
  icon?: TablerIcon;
  inputClassName?: string;
  labelClassName?: string;
  messageClassName?: string;
}

/**
 * Form input component with optional icon, password toggle, and size support.
 * Integrates with react-hook-form.
 */
export function TextInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  type = "text",
  size = "default",
  icon,
  disabled, 
  inputClassName,
  labelClassName,
  messageClassName,
  className,
  ...props
}: TextInputProps<TFieldValues> & { disabled?: boolean }) {
  const s = sizeClasses[size];

  return (
    <FormField
      control={control}
      name={name}
      disabled={disabled}
      render={({ field }) => (
        <FormItem className={cn("w-full space-y-1.5", className, disabled && "opacity-60 cursor-not-allowed")}>
          {label && (
            <FormLabel
              className={cn(
                "font-bold uppercase tracking-wider text-muted-foreground",
                s.label,
                labelClassName,
                disabled && "text-muted-foreground/50" 
              )}
            >
              {label}
            </FormLabel>
          )}
          <InputControl
            {...props}
            {...field}
            type={type}
            size={size}
            icon={icon}
            disabled={disabled} 
            isPassword={type === "password"}
            inputClassName={inputClassName}
            value={field.value ?? ""}
          />
          {description && <FormDescription>{description}</FormDescription>}
          <div className="min-h-[1.1em]">
            <FormMessage className={cn("font-bold", s.message, messageClassName)} />
          </div>
        </FormItem>
      )}
    />
  );
}