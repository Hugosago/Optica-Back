import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

// Esquema de validación
export const ProductoSchema = z.object({
  ID: z.number(),
  Nombre: z.string(),
  Descripcion: z.string(),
  Precio: z.number(),
  Imagen: z.string(),
});

// Modelo de Producto
export type Producto = z.infer<typeof ProductoSchema>;
