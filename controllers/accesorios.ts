import { Context, RouterContext } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { Client } from "https://deno.land/x/mysql@v2.11.0/mod.ts";

// Conexión a la base de datos
const client = await new Client().connect({
  hostname: "localhost",
  username: "root",
  password: "1234",
  port: 3307,
  db: "optica",
});

// Obtener todos los accesorios
export const getAccesorios = async (ctx: Context) => {
  try {
    const accesorios = await client.query("SELECT * FROM accesorios");
    ctx.response.status = 200;
    ctx.response.body = accesorios;
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      message: "Error al obtener los accesorios",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

// Obtener accesorio por ID
export const getAccesorioById = async (
  ctx: RouterContext<"/accesorios/:id">,
) => {
  try {
    const id = ctx.params.id;
    const [accesorio] = await client.query(
      "SELECT * FROM accesorios WHERE ID = ?",
      [id],
    );
    if (!accesorio) {
      ctx.response.status = 404;
      ctx.response.body = { message: "Accesorio no encontrado" };
      return;
    }
    ctx.response.status = 200;
    ctx.response.body = accesorio;
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      message: "Error al obtener el accesorio",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
