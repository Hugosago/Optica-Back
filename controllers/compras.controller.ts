import { Context, RouterContext } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { Client } from "https://deno.land/x/mysql@v2.11.0/mod.ts";
import { Compra } from "../schemas/compras.schemas.ts";
import { z } from "https://deno.land/x/zod/mod.ts";

// Configura el cliente MySQL
const client = await new Client().connect({
  hostname: "localhost",
  username: "root",
  password: "1234",
  port: 3307,
  db: "optica",
});

const CompraSchema = z.object({
  ClienteID: z.number(),
  FechaCompra: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "FechaCompra debe ser un datetime válido",
  }),
  TotalCompra: z.number(),
  MetodoPago: z.enum(["Efectivo", "Tarjeta", "Transferencia"]),
  EstadoPago: z.enum(["Pendiente", "Pagado", "Cancelado"]),
});

export const createCompra = async (ctx: Context) => {
  try {
    const body = await ctx.request.body().value;

    // Validar datos con Zod
    const datosValidados = CompraSchema.parse(body);

    // Insertar en la base de datos
    await client.execute(
      `INSERT INTO compras (ClienteID, FechaCompra, TotalCompra, MetodoPago, EstadoPago)
       VALUES (?, ?, ?, ?, ?)`,
      [
        datosValidados.ClienteID,
        datosValidados.FechaCompra,
        datosValidados.TotalCompra,
        datosValidados.MetodoPago,
        datosValidados.EstadoPago,
      ],
    );

    ctx.response.body = { message: "Compra creada exitosamente" };
    ctx.response.status = 201;
  } catch (error) {
    ctx.response.body = {
      message: "Error al crear la compra",
      error: error instanceof z.ZodError
        ? error.errors
        : (error as Error).message,
    };
    ctx.response.status = 400;
  }
};

// Obtener todas las compras
export const getCompras = async (ctx: Context) => {
  try {
    const compras = await client.query("SELECT * FROM compras");
    ctx.response.body = compras;
    ctx.response.status = 200;
  } catch (error) {
    ctx.response.body = {
      message: "Error al obtener las compras",
      error: (error as Error).message,
    };
    ctx.response.status = 500;
  }
};

// Obtener compra por ID
export const getCompraById = async (ctx: RouterContext<"/compras/:id">) => {
  const id = ctx.params.id;

  try {
    const [compra] = await client.query(
      "SELECT * FROM compras WHERE CompraID = ?",
      [id],
    );

    if (!compra) {
      ctx.response.body = { message: "Compra no encontrada" };
      ctx.response.status = 404;
      return;
    }

    ctx.response.body = compra;
    ctx.response.status = 200;
  } catch (error) {
    ctx.response.body = {
      message: "Error al obtener la compra",
      error: (error as Error).message,
    };
    ctx.response.status = 500;
  }
};

// Crear una compra

// Actualizar una compra
export const updateCompra = async (ctx: RouterContext<"/compras/:id">) => {
  const id = ctx.params.id;
  if (!id) {
    ctx.response.body = { message: "ID no proporcionado" };
    ctx.response.status = 400;
    return;
  }

  const body = await ctx.request.body().value;
  try {
    // Validar parcialmente los datos
    const datosValidados: Partial<Compra> = CompraSchema.partial().parse(body);

    // Verificar si la compra existe antes de actualizar
    const [compra] = await client.query(
      "SELECT * FROM compras WHERE CompraID = ?",
      [id],
    );

    if (!compra) {
      ctx.response.body = { message: "Compra no encontrada" };
      ctx.response.status = 404;
      return;
    }

    // Ejecutar la actualización solo si se enviaron datos
    if (Object.keys(datosValidados).length === 0) {
      ctx.response.body = { message: "No hay datos para actualizar" };
      ctx.response.status = 400;
      return;
    }

    // Actualizar la compra
    const result = await client.execute(
      `UPDATE compras SET 
         ClienteID = COALESCE(?, ClienteID), 
         FechaCompra = COALESCE(?, FechaCompra), 
         TotalCompra = COALESCE(?, TotalCompra), 
         MetodoPago = COALESCE(?, MetodoPago), 
         EstadoPago = COALESCE(?, EstadoPago)
       WHERE CompraID = ?`,
      [
        datosValidados.ClienteID,
        datosValidados.FechaCompra,
        datosValidados.TotalCompra,
        datosValidados.MetodoPago,
        datosValidados.EstadoPago,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      ctx.response.body = { message: "No se realizaron cambios" };
      ctx.response.status = 200;
    } else {
      ctx.response.body = { message: "Compra actualizada exitosamente" };
      ctx.response.status = 200;
    }
  } catch (error) {
    ctx.response.body = {
      message: "Error al actualizar la compra",
      error: (error as Error).message,
    };
    ctx.response.status = 500;
  }
};

// Eliminar una compra
export const deleteCompra = async (ctx: RouterContext<"/compras/:id">) => {
  const id = ctx.params.id;

  try {
    // Verificar si la compra existe
    const [compra] = await client.query(
      "SELECT * FROM compras WHERE CompraID = ?",
      [id],
    );

    if (!compra) {
      ctx.response.body = { message: "Compra no encontrada" };
      ctx.response.status = 404;
      return;
    }

    // Eliminar la compra
    await client.execute("DELETE FROM compras WHERE CompraID = ?", [id]);

    ctx.response.body = { message: "Compra eliminada exitosamente" };
    ctx.response.status = 200;
  } catch (error) {
    ctx.response.body = {
      message: "Error al eliminar la compra",
      error: (error as Error).message,
    };
    ctx.response.status = 500;
  }
};
