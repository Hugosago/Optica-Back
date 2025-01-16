import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

// Esquema de validación para la tabla "clientes"
export const ClienteSchema = z.object({
  PersonaID: z.number().int("El ID debe ser un UUID válido"), // Asegura que sea un UUID válido
  edad: z.number()
    .int("La edad debe ser un número entero")
    .positive("La edad debe ser un número positivo")
    .max(120, "La edad no puede ser mayor a 120"), // Máximo razonable
  ocupacion: z.string()
    .min(1, "La ocupación es obligatoria")
    .max(50, "La ocupación no puede tener más de 50 caracteres"),
  Domicilio: z.string()
    .min(1, "El domicilio es obligatorio")
    .max(100, "El domicilio no puede tener más de 100 caracteres"),
  ciudad: z.string()
    .min(1, "La ciudad es obligatoria")
    .max(50, "La ciudad no puede tener más de 50 caracteres"),
});

// Exporta un tipo TypeScript derivado del esquema
export type Cliente = z.infer<typeof ClienteSchema>;
