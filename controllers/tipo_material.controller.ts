import { Context } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { Client } from "https://deno.land/x/mysql@v2.11.0/mod.ts";

const client = await new Client().connect({
  hostname: "localhost",
  username: "root",
  password: "1234",
  port: 3307,
  db: "optica",
});

export const getTiposMaterial = async (ctx: Context) => {
  try {
    const tiposLentes = await client.query("SELECT * FROM tipo_material");
    ctx.response.body = tiposLentes;
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      message: "Error al obtener los tipos de material",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
