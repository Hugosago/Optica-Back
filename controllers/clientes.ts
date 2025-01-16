import {
  Context,
  Router,
  RouterContext,
  Context as OakContext,
} from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";
import { Client } from "https://deno.land/x/mysql@v2.11.0/mod.ts";
import { ClienteSchema } from "../schemas/clientes.ts"; // Importa el esquema definido
//import client from "../config/database.ts"; // Asegúrate de tener la conexión a la base de datos configurada

const client = await new Client().connect({
    hostname: "localhost",
    username: "root",
    password: "1234",
    port: 3307,
    db: "optica",
  });



// Crear cliente
export const createClient = async (ctx: Context) => {
  try {
    const body = await ctx.request.body().value;
    const clienteData = ClienteSchema.parse(body); // Valida los datos con Zod
    const { PersonaID, edad, ocupacion, Domicilio, ciudad } = clienteData;

    await client.execute(
      `INSERT INTO clientes (PersonaID, edad, ocupacion, domicilio, ciudad) VALUES (?, ?, ?, ?, ?)`,
      [PersonaID, edad, ocupacion, Domicilio, ciudad],
    );

    ctx.response.body = { message: "Cliente creado exitosamente" };
    ctx.response.status = 201;
  } catch (error) {
    // Manejo explícito del tipo de error
    if (error instanceof z.ZodError) {
      ctx.response.body = {
        message: "Error de validación",
        issues: error.errors, // Devuelve detalles del error de validación
      };
      ctx.response.status = 400; // Bad Request
    } else if (error instanceof Error) {
      ctx.response.body = {
        message: "Error al crear cliente",
        error: error.message,
      };
      ctx.response.status = 500;
    } else {
      // Para manejar errores inesperados que no sean del tipo `Error`
      ctx.response.body = { message: "Error desconocido" };
      ctx.response.status = 500;
    }
  }
};

// Obtener todos los clientes
export const getClients = async (ctx: Context) => {
  try {
    const clients = await client.query("SELECT * FROM clientes");
    ctx.response.body = clients;
    ctx.response.status = 200;
  } catch (error) {
    if (error instanceof Error) {
      ctx.response.body = {
        message: "Error al obtener los clientes",
        error: error.message,
      };
      ctx.response.status = 500;
    } else {
      ctx.response.body = { message: "Error desconocido" };
      ctx.response.status = 500;
    }
  }
};

// Obtener cliente por ID
export const getClientById = async (ctx: RouterContext<"/clientes/:id">) => {
  const id = ctx.params.id; // Obtener el ID de los parámetros de la ruta

  try {
    // Obtener el cliente con el ID especificado
    const clientData = await client.query(
      `SELECT * FROM clientes WHERE PersonaID = ?`,
      [id],
    );

    if (clientData.length === 0) {
      ctx.response.body = { message: "Cliente no encontrado" };
      ctx.response.status = 404;
    } else {
      ctx.response.body = clientData[0]; // Retornar solo el primer cliente encontrado
      ctx.response.status = 200;
    }
  } catch (error) {
    ctx.response.body = {
      message: "Error al obtener el cliente",
      error: (error as Error).message,
    };
    ctx.response.status = 500;
  }
};

// Actualizar cliente
export const updateClient = async (ctx: RouterContext<"/clientes/:id">) => {
  const id = ctx.params.id; // Obtener el ID de los parámetros de la ruta
  const body = await ctx.request.body().value;
  const { edad, ocupacion, domicilio, ciudad } = body;

  try {
    // Actualizar el cliente con el ID especificado
    const result = await client.execute(
      `UPDATE clientes SET edad = ?, ocupacion = ?, Domicilio = ?, ciudad = ? WHERE PersonaID = ?`,
      [edad, ocupacion, domicilio, ciudad, id],
    );

    if (result.affectedRows === 0) {
      ctx.response.body = { message: "Cliente no encontrado" };
      ctx.response.status = 404;
    } else {
      ctx.response.body = { message: "Cliente actualizado exitosamente" };
      ctx.response.status = 200;
    }
  } catch (error) {
    ctx.response.body = {
      message: "Error al actualizar el cliente",
      error: (error as Error).message,
    };
    ctx.response.status = 500;
  }
};

// Eliminar cliente
export const deleteClient = async (ctx: RouterContext<"/clientes/:id">) => {
  const id = ctx.params.id; // Obtener el ID de los parámetros de la ruta

  try {
    // Eliminar el cliente con el ID especificado
    const result = await client.execute(
      `DELETE FROM clientes WHERE PersonaID = ?`,
      [id],
    );

    if (result.affectedRows === 0) {
      ctx.response.body = { message: "Cliente no encontrado" };
      ctx.response.status = 404;
    } else {
      ctx.response.body = { message: "Cliente eliminado exitosamente" };
      ctx.response.status = 200;
    }
  } catch (error) {
    ctx.response.body = {
      message: "Error al eliminar el cliente",
      error: (error as Error).message,
    };
    ctx.response.status = 500;
  }
};
