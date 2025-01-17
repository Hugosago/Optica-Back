import { Context, RouterContext } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { Client } from "https://deno.land/x/mysql@v2.11.0/mod.ts";
import { Producto, ProductoSchema } from "../schemas/productos.schemas.ts";

// Configura el cliente MySQL
const client = await new Client().connect({
  hostname: "localhost",
  username: "root",
  password: "1234",
  port: 3307,
  db: "optica",
});

// Obtener todos los productos
export const getProductos = async (ctx: Context) => {
  try {
    const productos = await client.query("SELECT * FROM productos");
    ctx.response.body = productos;
    ctx.response.status = 200;
  } catch (error) {
    ctx.response.body = {
      message: "Error al obtener los productos",
      error: (error as Error).message,
    };
    ctx.response.status = 500;
  }
};

// Obtener producto por ID
export const getProductoById = async (ctx: RouterContext<"/productos/:id">) => {
  const id = ctx.params.id;

  try {
    const [producto] = await client.query("SELECT * FROM productos WHERE ID = ?", [id]);

    if (!producto) {
      ctx.response.body = { message: "Producto no encontrado" };
      ctx.response.status = 404;
      return;
    }

    ctx.response.body = producto;
    ctx.response.status = 200;
  } catch (error) {
    ctx.response.body = {
      message: "Error al obtener el producto",
      error: (error as Error).message,
    };
    ctx.response.status = 500;
  }
};

// Crear un producto
export const createProducto = async (ctx: Context) => {
  try {
    const body = await ctx.request.body().value;

    // Validar los datos usando el esquema
    const datosValidados: Producto = ProductoSchema.parse(body);

    // Insertar en la base de datos
    await client.execute(
      `INSERT INTO productos (ID, Nombre, Descripcion, Precio, Imagen)
       VALUES (?, ?, ?, ?, ?)`,
      [
        datosValidados.ID,
        datosValidados.Nombre,
        datosValidados.Descripcion,
        datosValidados.Precio,
        datosValidados.Imagen,
      ],
    );

    ctx.response.body = { message: "Producto creado exitosamente" };
    ctx.response.status = 201;
  } catch (error) {
    ctx.response.body = {
      message: "Error al crear el producto",
      error: 
        (error && typeof error === "object" && "errors" in error && error.errors) || 
        (error instanceof Error && error.message) || 
        "Error desconocido",
    };
    ctx.response.status = 400;
  }
};

// Actualizar un producto
export const updateProducto = async (ctx: RouterContext<"/productos/:id">) => {
  const id = ctx.params.id; // Obtener el ID de los parámetros de la ruta
  const body = await ctx.request.body().value;

  try {
    const datosValidados: Partial<Producto> = ProductoSchema.partial().parse(body);

    const { Nombre, Descripcion, Precio, Imagen } = datosValidados;

    // Actualizar el producto
    const result = await client.execute(
      `UPDATE productos SET Nombre = ?, Descripcion = ?, Precio = ?, Imagen = ? WHERE ID = ?`,
      [Nombre, Descripcion, Precio, Imagen, id],
    );

    if (result.affectedRows === 0) {
      ctx.response.body = { message: "Producto no encontrado" };
      ctx.response.status = 404;
    } else {
      ctx.response.body = { message: "Producto actualizado exitosamente" };
      ctx.response.status = 200;
    }
  } catch (error) {
    ctx.response.body = {
      message: "Error al actualizar el producto",
      error: (error as Error).message,
    };
    ctx.response.status = 500;
  }
};

// Eliminar un producto
export const deleteProducto = async (ctx: RouterContext<"/productos/:id">) => {
  const id = ctx.params.id;

  try {
    // Verificar si el producto existe
    const [producto] = await client.query("SELECT * FROM productos WHERE ID = ?", [id]);

    if (!producto) {
      ctx.response.body = { message: "Producto no encontrado" };
      ctx.response.status = 404;
      return;
    }

    // Eliminar el producto
    await client.execute("DELETE FROM productos WHERE ID = ?", [id]);

    ctx.response.body = { message: "Producto eliminado exitosamente" };
    ctx.response.status = 200;
  } catch (error) {
    ctx.response.body = {
      message: "Error al eliminar el producto",
      error: (error as Error).message,
    };
    ctx.response.status = 500;
  }
};
