"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { IconMail, IconLock } from "@tabler/icons-react"

import { Form } from "@/components/ui/form"
import { FormInput } from "@/components/common/input-form"
import { Button } from "@/components/ui/button"

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es obligatorio")
    .email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  })

  function onSubmit(values: LoginFormValues) {
    console.log("Iniciando sesión con:", values)
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-12 text-center text-xl sm:text-2xl font-black uppercase tracking-tighter text-foreground">

        Log in
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
          <div className="space-y-3 sm:space-y-4"> 
            <FormInput
                control={form.control}
                name="email"
                type="email"
                label="Correo"
                placeholder="tu@email.com"
                icon={IconMail}
                inputClassName="h-11 sm:h-10 rounded-full border-foreground/30 bg-transparent text-sm"
                labelClassName="text-xs"
                messageClassName="text-xs"
            />

            <FormInput
                control={form.control}
                name="password"
                type="password"
                label="Contraseña"
                placeholder="••••••••"
                icon={IconLock}
                inputClassName="h-11 sm:h-10 rounded-full border-foreground/30 bg-transparent text-sm"
                labelClassName="text-xs"
                messageClassName="text-xs"
            />
            </div> 
          <Button
            type="submit"
            suppressHydrationWarning 
            className="mt-8 h-11 sm:h-10 w-full rounded-full bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-widest hover:bg-primary/90 active:scale-95 transition-transform"
          >
            Iniciar Sesión
          </Button>
          
        </form>
      </Form>

      <div className="mt-4 text-center">
        <Link
          href="#"
          className="text-[10px] font-bold text-primary/60 hover:text-primary transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <div className="my-10 h-px w-full bg-border" />

      <div className="space-y-3 text-center">
        <p className="text-[11px] text-muted-foreground">¿No tienes cuenta?</p>
        <Link
          href="#"
          className="block text-[11px] font-black uppercase text-foreground hover:text-primary transition-colors"
        >
          Crear Cuenta
        </Link>
      </div>
    </div>
  )
}