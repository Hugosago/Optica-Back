import { Context } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { Client } from "https://deno.land/x/mysql@v2.11.0/mod.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

// Esquema de validación con Zod
const ClienteSchema = z.object({
  PersonaID: z.number(),
});

// Configuración de la conexión a la base de datos
const client = await new Client().connect({
  hostname: "localhost",
  username: "root",
  password: "1234",
  port: 3307,
  db: "optica",
});

// Crear cliente solo con el PersonaID
export const createClient = async (ctx: Context) => {
  try {
    const body = await ctx.request.body().value;
    const clienteData = ClienteSchema.parse(body); // Validación con Zod
    const { PersonaID } = clienteData;

    await client.execute(
      `INSERT INTO clientes (PersonaID) VALUES (?)`,
      [PersonaID],
    );

    ctx.response.body = { message: "Cliente creado exitosamente" };
    ctx.response.status = 201;
  } catch (error) {
    if (error instanceof z.ZodError) {
      ctx.response.body = { message: "Error de validación", issues: error.errors };
      ctx.response.status = 400;
    } else if (error instanceof Error) {
      ctx.response.body = { message: "Error al crear cliente", error: error.message };
      ctx.response.status = 500;
    } else {
      ctx.response.body = { message: "Error desconocido" };
      ctx.response.status = 500;
    }
  }
};
