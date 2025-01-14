import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

// Esquema de validación para la tabla "personas"
export const PersonaSchema = z.object({
  PersonaID: z.number().int("El ID debe ser un UUID válido"), // Cambia a z.number() si es un número.
  Nombre: z.string().min(1, "El nombre es obligatorio").max(50, "El nombre es muy largo"),
  Apellidos: z.string().min(1, "Los apellidos son obligatorios").max(100, "Los apellidos son muy largos"),
  Contrasenia: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  CorreoElectronico: z
    .string()
    .email("El correo electrónico debe ser válido")
    .max(100, "El correo electrónico es muy largo"),
});

// Exporta un tipo TypeScript derivado del esquema
export type Persona = z.infer<typeof PersonaSchema>;
