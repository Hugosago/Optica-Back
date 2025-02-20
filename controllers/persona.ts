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


export const getPersonaById = async (ctx: RouterContext<"/personas/:id">) => {
  const id = ctx.params.id; // Obtener el ID de los parámetros de la ruta

  if (!id) {
    ctx.response.body = { message: "ID no proporcionado" };
    ctx.response.status = 400;
    return;
  }

  try {
    // Consultar la persona por ID
    const personas = await client.query("SELECT * FROM personas WHERE PersonaID = ?", [id]);

    if (personas.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = { message: "Persona no encontrada" };
    } else {
      ctx.response.status = 200;
      ctx.response.body = personas[0];
    }
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      message: "Error al obtener la persona",
      error: (error as Error).message,
    };
  }
};


// Controlador para crear una nueva persona
export const createPersona = async (ctx: Context) => {
  try {
    const body = await ctx.request.body().value;

    // Validar los datos sin PersonaID
    const datosValidados = PersonaSchema.omit({ PersonaID: true }).parse(body);

    // Insertar en la base de datos (sin PersonaID)
    await client.execute(
      `INSERT INTO personas (Nombre, Apellidos, Contrasenia, CorreoElectronico)
       VALUES (?, ?, ?, ?)`,
      [
        datosValidados.Nombre,
        datosValidados.Apellidos,
        datosValidados.Contrasenia,
        datosValidados.CorreoElectronico,
      ],
    );

    ctx.response.body = { message: "Persona creada exitosamente" };
    ctx.response.status = 201;
  } catch (error) {
    ctx.response.body = {
      message: "Error al crear la persona",
      error: 
        (error && typeof error === "object" && "errors" in error && error.errors) || 
        (error instanceof Error && error.message) || 
        "Error desconocido",
    };
    ctx.response.status = 400; // Bad Request
  }
};


// Controlador para modificar una persona

export const updatePersona = async (ctx: RouterContext<"/personas/:id">) => {
  const id = ctx.params.id; // Obtener el ID de los parámetros de la ruta
  const body = await ctx.request.body().value;

  try {
    // Validar que al menos un campo haya sido enviado
    if (Object.keys(body).length === 0) {
      ctx.response.status = 400;
      ctx.response.body = { message: "Debe enviar al menos un campo para actualizar" };
      return;
    }

    // Construir dinámicamente la consulta SQL según los campos enviados
    const fields = [];
    const values = [];

    if (body.Nombre) {
      fields.push("Nombre = ?");
      values.push(body.Nombre);
    }
    if (body.Apellidos) {
      fields.push("Apellidos = ?");
      values.push(body.Apellidos);
    }
    if (body.Contrasenia) {
      fields.push("Contrasenia = ?");
      values.push(body.Contrasenia);
    }
    if (body.CorreoElectronico) {
      fields.push("CorreoElectronico = ?");
      values.push(body.CorreoElectronico);
    }

    // Verificar si hay campos a actualizar
    if (fields.length === 0) {
      ctx.response.status = 400;
      ctx.response.body = { message: "No se enviaron datos válidos para actualizar" };
      return;
    }

    // Agregar el ID al final de los valores para la consulta
    values.push(id);

    // Ejecutar la consulta de actualización
    const result = await client.execute(
      `UPDATE personas SET ${fields.join(", ")} WHERE PersonaID = ?`,
      values,
    );

    if (result.affectedRows === 0) {
      ctx.response.status = 404;
      ctx.response.body = { message: "Persona no encontrada" };
    } else {
      ctx.response.status = 200;
      ctx.response.body = { message: "Persona actualizada exitosamente" };
    }
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      message: "Error al actualizar la persona",
      error: (error as Error).message,
    };
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
