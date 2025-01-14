import {
  Context,
  Context as OakContext,
  RouterContext,
} from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { Client } from "https://deno.land/x/mysql@v2.11.0/mod.ts";
import { Persona, PersonaSchema } from "../schemas/persona.ts";

// Configura el cliente MySQL
const client = await new Client().connect({
  hostname: "localhost",
  username: "root",
  password: "1234",
  port: 3307,
  db: "optica",
});

// Controlador para obtener personas
export const getPersonas = async (ctx: Context) => {
  try {
    const personas = await client.query("SELECT * FROM personas");
    ctx.response.body = personas;
    ctx.response.status = 200;
  } catch (error) {
    ctx.response.body = {
      message: "Error al crear la persona",
      error: (error as Error).message, // Casting explícito
    };
    ctx.response.status = 500;
  }
};

// Controlador para crear una nueva persona
export const createPersona = async (ctx: Context) => {
  try {
    const body = await ctx.request.body().value;

    // Validar los datos usando el esquema
    const datosValidados: Persona = PersonaSchema.parse(body);

    // Insertar en la base de datos
    await client.execute(
      `INSERT INTO personas (PersonaID, Nombre, Apellidos, Contrasenia, CorreoElectronico)
       VALUES (?, ?, ?, ?, ?)`,
      [
        datosValidados.PersonaID,
        datosValidados.Nombre,
        datosValidados.Apellidos,
        datosValidados.Contrasenia,
        datosValidados.CorreoElectronico,
      ],
    );

    ctx.response.body = { message: "Persona creada exitosamente" };
    ctx.response.status = 201;
  }catch (error) {
    ctx.response.body = {
      message: "Error al crear la persona",
      error: 
        (error && typeof error === "object" && "errors" in error && error.errors) || // Si tiene `errors`
        (error instanceof Error && error.message) || // Si es una instancia de `Error`
        "Error desconocido", // Valor predeterminado
    };
    ctx.response.status = 400; // Bad Request
  }
  
};
// Controlador para modificar una persona

export const updatePersona = async (ctx: RouterContext<"/personas/:id">) => {
  const id = ctx.params.id; // Obtener el ID de los parámetros de la ruta
  const body = await ctx.request.body().value;
  const { Nombre, Apellidos, Contrasenia, CorreoElectronico } = body;

  try {
    // Actualizar la persona con el ID especificado
    const result = await client.execute(
      `UPDATE personas SET Nombre = ?, Apellidos = ?, Contrasenia = ?, CorreoElectronico = ? WHERE PersonaID = ?`,
      [Nombre, Apellidos, Contrasenia, CorreoElectronico, id],
    );

    if (result.affectedRows === 0) {
      ctx.response.body = { message: "Persona no encontrada" };
      ctx.response.status = 404;
    } else {
      ctx.response.body = { message: "Persona actualizada exitosamente" };
      ctx.response.status = 200;
    }
  } catch (error) {
    ctx.response.body = {
      message: "Error al actualizar la persona",
      error: (error as Error).message,
    };
    ctx.response.status = 500;
  }
};

// Controlador para eliminar una persona
// Controlador para eliminar una persona
interface MyContext extends OakContext {
  params: {
    id: string; // O usa 'number' si tu ID es un número
  };
}

export const deletePersona = async (ctx: MyContext) => {
  const id = ctx.params.id;

  if (!id) {
    ctx.response.body = { message: "ID no proporcionado" };
    ctx.response.status = 400;
    return;
  }

  try {
    // Verifica si existen dependencias en la tabla clientes
    const dependencias = await client.query(
      "SELECT * FROM clientes WHERE PersonaID = ?",
      [id],
    );

    if (dependencias.length > 0) {
      ctx.response.body = {
        message:
          "No se puede eliminar la persona porque tiene dependencias en la tabla clientes",
      };
      ctx.response.status = 400; // Bad Request
      return;
    }

    // Elimina la persona
    await client.execute("DELETE FROM personas WHERE PersonaID = ?", [id]);

    ctx.response.body = { message: "Persona eliminada exitosamente" };
    ctx.response.status = 200;
  } catch (error) {
    ctx.response.body = {
      message: "Error al eliminar la persona",
      error: (error as Error).message,
    };
    ctx.response.status = 500;
  }
};
