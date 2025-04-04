import { Context, RouterContext } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { Client } from "https://deno.land/x/mysql@v2.11.0/mod.ts";
import { verificarToken } from "../functions/verificarToken.ts";
import { actualizarCantidadCarrito } from "../functions/actualizarCantidad.ts";


// 📦 Conexión a la base de datos
const client = await new Client().connect({
  hostname: "localhost",
  username: "root",
  password: "1234",
  port: 3307,
  db: "optica",
});

type CarritoContext = RouterContext<string, Record<string, string>>;

// ✅ **Controlador para obtener el carrito**
export const getCarrito = async (ctx: Context) => {
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

    // 🔍 Extraer el token removiendo el "Bearer "
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    console.log("🔑 Token recibido:", token);

    // Verificar el token y obtener el ID del usuario
    const userId = await verificarToken(token);
    console.log("🔹 ID del usuario extraído del token:", userId);

    if (!userId) {
      ctx.response.status = 401;
      ctx.response.body = { message: "Unauthorized", code: 401 };
      return;
    }

    // 📌 Consultar los productos del carrito por ClienteID
    const carrito = await clientConnection.query(
      `
        SELECT 
            'Producto' AS Tipo,
            c.Cantidad, 
            p.Imagen, 
            p.Nombre, 
            p.Precio_Normal, 
            p.Precio_Oferta, 
            p.Marca, 
            p.Modelo, 
            p.Color,
            NULL AS Categoria,
            c.AgregadoEn
        FROM carrito c
        INNER JOIN productos p ON p.ID = c.ProductoID
        WHERE c.ClienteID = ?

        UNION ALL

        SELECT 
            'Accesorio' AS Tipo,
            c.Cantidad, 
            a.Imagen, 
            a.Nombre, 
            a.Precio_Normal, 
            a.Precio_Oferta, 
            a.Marca, 
            a.Modelo, 
            NULL AS Color,
            NULL AS Categoria,
            c.AgregadoEn
        FROM carrito c
        INNER JOIN accesorios a ON a.ID = c.AccesorioID
        WHERE c.ClienteID = ?

        ORDER BY AgregadoEn DESC
      `,
      [userId, userId],
    );

    console.log("🛒 Productos en el carrito:", carrito);

    if (carrito.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: true,
        message: "No se encontraron productos en el carrito",
        code: 404,
      };
      return;
    }

    // ✅ Responder con los productos del carrito
    ctx.response.status = 200;
    ctx.response.body = { success: true, data: carrito, code: 200 };
  } catch (error) {
    console.error("❌ Error al obtener el carrito:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      message: "Error interno en el servidor",
      code: 500,
    };
  } finally {
    if (clientConnection) {
      await clientConnection.close(); // Cerrar la conexión cuando termine
    }
  }
};




export const createCarrito = async (ctx: Context, client: Client) => {
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

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;
    const clienteId = await verificarToken(token);

    if (!clienteId) {
      ctx.response.status = 401;
      ctx.response.body = { message: "Unauthorized", code: 401 };
      return;
    }

    const body = await ctx.request.body().value;
    const cantidad = parseInt(body.Cantidad, 10);
    const productoId = body.ProductoID ? parseInt(body.ProductoID, 10) : null;
    const accesorioId = body.AccesorioID ? parseInt(body.AccesorioID, 10) : null;

    if (isNaN(cantidad) || (!productoId && !accesorioId)) {
      ctx.response.status = 400;
      ctx.response.body = {
        message: "Cantidad debe ser válida y debe proporcionarse un ProductoID o AccesorioID.",
        code: 400,
      };
      return;
    }

    // Verificar si el producto o accesorio ya está en el carrito
    const carritoExistente = await client.query(
      `SELECT ID, Cantidad FROM carrito 
       WHERE ClienteID = ? AND (ProductoID = ? OR AccesorioID = ?) 
       LIMIT 1`,
      [clienteId, productoId ?? null, accesorioId ?? null]
    );

    if (carritoExistente.length > 0) {
      // Si ya existe, actualizar la cantidad
      const { ID } = carritoExistente[0];
      const nuevoCarrito = await actualizarCantidadCarrito(client, ID, cantidad);

      ctx.response.status = 200;
      ctx.response.body = {
        mensaje: "Cantidad del producto actualizada en el carrito",
        dataCarrito: nuevoCarrito,
        code: 200,
      };
      return;
    }

    // Si no existe, insertar un nuevo registro
    const result = await client.execute(
      `INSERT INTO carrito (ClienteID, AgregadoEn, Cantidad, ProductoID, AccesorioID)
       VALUES (?, NOW(), ?, ?, ?)`,
      [clienteId, cantidad, productoId ?? null, accesorioId ?? null]
    );

    if (!result.lastInsertId) {
      ctx.response.status = 500;
      ctx.response.body = { message: "Error al obtener el ID del carrito insertado", code: 500 };
      return;
    }

    // Obtener el registro recién insertado
    const nuevoCarrito = await client.query(
      `SELECT ID, ClienteID, AgregadoEn, Cantidad, ProductoID, AccesorioID 
       FROM carrito WHERE ID = ?`,
      [result.lastInsertId]
    );

    if (nuevoCarrito.length === 0) {
      ctx.response.status = 500;
      ctx.response.body = { message: "Error al obtener los datos del carrito", code: 500 };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = {
      mensaje: "Producto agregado al carrito",
      dataCarrito: nuevoCarrito[0],
      code: 200,
    };
  } catch (error) {
    console.error("Error en createCarrito:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      message: "Error interno en el servidor",
      error: error instanceof Error ? error.message : String(error),
      code: 500,
    };
  }
};




export const updateCantidadCarrito = async (ctx: any) => {
  try {
    // Verificar autenticación
    const authHeader = ctx.request.headers.get("Authorization");
    if (!authHeader) {
      ctx.response.status = 401;
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

    // Obtener ID del carrito desde la URL
    const carritoId = parseInt(ctx.params.id);
    if (isNaN(carritoId)) {
      ctx.response.status = 400;
      ctx.response.body = { message: "ID del carrito no válido", code: 400 };
      return;
    }

    // Obtener la nueva cantidad del cuerpo de la solicitud
    const body = await ctx.request.body().value;
    
    if (!body || typeof body.Cantidad !== "number" || body.Cantidad <= 0) {
      ctx.response.status = 400;
      ctx.response.body = { 
        message: "Se requiere un valor numérico mayor a 0 para 'Cantidad'", 
        code: 400 
      };
      return;
    }

    // Verificar que el elemento existe en el carrito y pertenece al usuario
    const [carritoItem] = await client.query(
      `SELECT ID, ProductoID, AccesorioID FROM carrito WHERE ID = ? AND ClienteID = ? LIMIT 1`,
      [carritoId, clienteId]
    );

    if (!carritoItem) {
      ctx.response.status = 404;
      ctx.response.body = { message: "Elemento no encontrado en el carrito", code: 404 };
      return;
    }

    // Reutilizar la función para actualizar la cantidad
    const carritoActualizado = await actualizarCantidadCarrito(client, carritoId, body.Cantidad);

    // Configurar los encabezados CORS
    ctx.response.headers.set('Access-Control-Allow-Origin', '*');
    ctx.response.headers.set('Access-Control-Allow-Methods', 'PUT, OPTIONS');
    ctx.response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Devolver la respuesta según la documentación
    ctx.response.status = 200;
    ctx.response.body = { 
      message: "success", 
      dataCarrito: carritoActualizado,
      code: 200 
    };
  } catch (error: any) {
    console.error("Error en updateCantidadCarrito:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
      message: "Error interno en el servidor", 
      error: error.message || String(error), 
      code: 500 
    };
  }
};

