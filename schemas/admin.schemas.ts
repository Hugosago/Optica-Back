import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

// Esquema de validación con Zod para Administrador
export const AdministradorSchema = z.object({
  PersonaID: z.number(),
});
