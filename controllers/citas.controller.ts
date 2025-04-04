import { Context } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { Client } from "https://deno.land/x/mysql@v2.11.0/mod.ts";
import { verificarToken } from "../functions/verificarToken.ts";

export const getCitas = async (ctx: Context) => {
  let clientConnection;
  try {
    clientConnection = await new Client().connect({
      hostname: "localhost",
      username: "root",
      password: "1234",
      port: 3307,
      db: "optica",
    });

    const authHeader = ctx.request.headers.get("Authorization");

    if (!authHeader) {
      ctx.response.status = 401;
      ctx.response.body = { message: "Usuario no logueado", code: 401 };
      return;
    }

    // Extract the token by removing "Bearer "
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    console.log("🔑 Token recibido:", token);

    // Verify the token and get the user ID
    const userId = await verificarToken(token);
    console.log("🔹 ID del usuario extraído del token:", userId);

    if (!userId) {
      ctx.response.status = 401;
      ctx.response.body = { message: "Unauthorized", code: 401 };
      return;
    }

    // Query citas data
    const citas = await clientConnection.query(
      `SELECT * FROM citas WHERE ClienteID = ?`,
      [userId],
    );

    console.log("📅 Citas encontradas:", citas);

    if (citas.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: true,
        message: "No se encontraron citas para este usuario",
        code: 404,
      };
      return;
    }

    // Return citas data
    ctx.response.status = 200;
    ctx.response.body = { success: true, data: citas, code: 200 };
  } catch (error) {
    console.error("❌ Error al obtener las citas:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "Error interno en el servidor",
      code: 500,
    };
  } finally {
    if (clientConnection) {
      await clientConnection.close(); // Close connection when done
    }
  }
};

export const createCita = async (ctx: Context, client: Client) => {
  try {
    if (!(client instanceof Client)) {
      throw new Error("client no es una instancia válida de Client");
    }

    const headers = ctx.request.headers;
    const authHeader = headers.get("Authorization");

    if (!authHeader) {
      ctx.response.status = 204;
      ctx.response.body = { message: "Usuario no logueado", code: 204 };
      return;
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
    const clienteId = await verificarToken(token);

    if (!clienteId) {
      ctx.response.status = 401;
      ctx.response.body = { message: "Unauthorized", code: 401 };
      return;
    }

    const body = await ctx.request.body().value;
    console.log("Datos recibidos del body:")
    console.log(body)

    const fechaCita: string = body.Fecha_cita;
    const horaCita: string = body.Hora_cita;
    const nombre : string = body.Nombre;
    const estado: string = body.Estado || "Pendiente";
    const comentarios: string | null = body.Comentarios || null;
    const adminId: number | null = body.AdminID ? parseInt(body.AdminID, 10) : null;

    if (!fechaCita || !horaCita || isNaN(adminId as number)) {
      ctx.response.status = 400;
      ctx.response.body = {
        message: "Fecha_cita, Hora_cita y AdminID son obligatorios y deben ser válidos.",
        code: 400,
      };
      return;
    }

    const result = await client.execute(
      `INSERT INTO citas (ClienteID, Nombre, Fecha_cita, Hora_cita, Estado, Fecha_modificacion, Comentarios)
       VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
      [clienteId, nombre, fechaCita, horaCita, estado, comentarios]
    );

    if (!result.lastInsertId) {
      ctx.response.status = 500;
      ctx.response.body = { message: "Error al obtener el ID de la cita insertada", code: 500 };
      return;
    }

    const nuevaCita = await client.query(
      `SELECT * FROM citas WHERE CitaID = ?`,
      [result.lastInsertId]
    );

    if (nuevaCita.length === 0) {
      ctx.response.status = 500;
      ctx.response.body = { message: "Error al obtener los datos de la cita", code: 500 };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = {
      mensaje: "Cita creada exitosamente",
      dataCita: nuevaCita[0],
      code: 200,
    };
  } catch (error) {
    console.error("Error en createCita:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      message: "Error interno en el servidor",
      error: error instanceof Error ? error.message : String(error),
      code: 500,
    };
  }
};

