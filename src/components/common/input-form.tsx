"use client"

import * as React from "react"
import { IconEye, IconEyeOff } from "@tabler/icons-react"
import { Control, FieldValues, FieldPath } from "react-hook-form" 
import { Icon as TablerIcon } from "@tabler/icons-react"

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type InputType = "text" | "password" | "email" | "number" | "tel" | "url"

interface InputControlProps extends React.ComponentProps<"input"> {
  icon?: TablerIcon
  isPassword: boolean
  inputClassName?: string
}

const InputControl = React.forwardRef<HTMLInputElement, InputControlProps>(
  ({ icon: Icon, isPassword, type, inputClassName, className, ...props }, ref) => {
    const { error } = useFormField()
    const [showPassword, setShowPassword] = React.useState(false)

    const finalType = isPassword
      ? showPassword ? "text" : "password"
      : type

    return (
      <div className="relative flex items-center">
        {Icon && (
          <Icon
            className={cn(
              "absolute left-3 h-4 w-4 transition-colors pointer-events-none",
              error ? "text-destructive" : "text-muted-foreground/70"
            )}
          />
        )}

        <FormControl>
          <Input
            {...props}
            ref={ref}
            type={finalType}
            suppressHydrationWarning
            className={cn(
              Icon && "pl-9",
              isPassword && "pr-10",
              inputClassName
            )}
          />
        </FormControl>

        {isPassword && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 h-full px-3 text-muted-foreground hover:bg-transparent"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword
              ? <IconEyeOff className="h-4 w-4" />
              : <IconEye className="h-4 w-4" />
            }
          </Button>
        )}
      </div>
    )
  }
)
InputControl.displayName = "InputControl"

interface FormInputProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<React.ComponentProps<"input">, "name" | "type"> {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label?: string
  description?: string
  type?: InputType
  icon?: TablerIcon
  inputClassName?: string
  labelClassName?: string
  messageClassName?: string
}

export function FormInput<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  description,
  type = "text",
  icon,
  inputClassName,
  labelClassName,
  messageClassName,
  className,
  ...props
}: FormInputProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("w-full space-y-1.5", className)}>
          {label && (
            <FormLabel className={cn("font-bold uppercase tracking-wider text-muted-foreground", labelClassName)}>
              {label}
            </FormLabel>
          )}

          <InputControl
            {...props}
            {...field}
            type={type}
            icon={icon}
            isPassword={type === "password"}
            inputClassName={inputClassName}
          />

          {description && (
            <FormDescription className={cn(messageClassName)}>
              {description}
            </FormDescription>
          )}

          <div className="min-h-4">
            <FormMessage className={cn("font-bold", messageClassName)} />
          </div>
        </FormItem>
      )}
    />
  )
}