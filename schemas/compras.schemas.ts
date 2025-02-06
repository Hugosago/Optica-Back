import { z } from "https://deno.land/x/zod/mod.ts";

export const CompraSchema = z.object({
  ClienteID: z.number(),
  FechaCompra: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid datetime",
  }),
  TotalCompra: z.number(),
  MetodoPago: z.string(),
  EstadoPago: z.string(),
});

export type Compra = z.infer<typeof CompraSchema>;
