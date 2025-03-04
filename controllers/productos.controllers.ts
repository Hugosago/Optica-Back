import { Context, RouterContext } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { Client } from "https://deno.land/x/mysql@v2.11.0/mod.ts";

const client = await new Client().connect({
  hostname: "localhost",
  username: "root",
  password: "1234",
  port: 3307,
  db: "optica",
});

export const getProductos = async (ctx: Context) => {
  try {
    const productos = await client.query("SELECT * FROM productos");
    ctx.response.body = productos;
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      message: "Error al obtener los productos",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export const getProductoById = async (ctx: RouterContext<"/productos/:id">) => {
  try {
    const id = ctx.params.id;
    const [producto] = await client.query(
      "SELECT * FROM productos WHERE ID = ?",
      [id],
    );
    if (!producto) {
      ctx.response.status = 404;
      ctx.response.body = { message: "Producto no encontrado" };
      return;
    }
    ctx.response.body = producto;
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      message: "Error al obtener el producto",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export const createProducto = async (ctx: Context) => {
  try {
    const body = await ctx.request.body().value;

    // Convertir valores a número
    const tipoId = parseInt(body.Tipo);
    const materialId = parseInt(body.Material);

    if (isNaN(tipoId) || isNaN(materialId)) {
      ctx.response.status = 400;
      ctx.response.body = { message: "Error: Tipo y Material deben ser números válidos." };
      return;
    }

    // Verificar si el Tipo existe en la base de datos
    const [tipoExiste] = await client.query(
      `SELECT ID FROM tipo_lentes WHERE ID = ?`,
      [tipoId]
    );

    if (!tipoExiste) {
      ctx.response.status = 400;
      ctx.response.body = {
        message: `Error: No existe un tipo de lente con ID ${tipoId}.`,
      };
      return;
    }

    // Verificar si el Material existe en la base de datos
    const [materialExiste] = await client.query(
      `SELECT ID FROM tipo_material WHERE ID = ?`,
      [materialId]
    );

    if (!materialExiste) {
      ctx.response.status = 400;
      ctx.response.body = {
        message: `Error: No existe un material con ID ${materialId}.`,
      };
      return;
    }

    // Insertar el producto en la base de datos
    await client.execute(
      `INSERT INTO productos (Nombre, Descripcion, Precio_Normal, Precio_Oferta, Imagen, Cantidad, Marca, Modelo, Edad, Genero, Categoria, Material, Tamaño, Color, Tipo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.Nombre,
        body.Descripcion,
        body.Precio_Normal,
        body.Precio_Oferta,
        body.Imagen,
        body.Cantidad,
        body.Marca,
        body.Modelo,
        body.Edad,
        body.Genero,
        body.Categoria,
        materialId,
        body.Tamaño,
        body.Color,
        tipoId,
      ]
    );

    ctx.response.status = 201;
    ctx.response.body = { message: "Producto creado exitosamente" };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      message: "Error al crear el producto",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};







export const updateProducto = async (ctx: RouterContext<"/productos/:id">) => {
  try {
    const id = ctx.params.id;
    const body = await ctx.request.body().value;

    // Verificar si hay al menos un campo a actualizar
    if (Object.keys(body).length === 0) {
      ctx.response.status = 400;
      ctx.response.body = {
        message: "Debe enviar al menos un campo para actualizar",
      };
      return;
    }

    // Validar si el producto existe antes de actualizar
    const [productoExiste] = await client.query(
      `SELECT ID FROM productos WHERE ID = ?`,
      [id]
    );

    if (!productoExiste) {
      ctx.response.status = 404;
      ctx.response.body = { message: "Error: El producto no existe." };
      return;
    }

    // Validar si se está intentando actualizar "Material" o "Tipo"
    if (body.Material) {
      const [materialExiste] = await client.query(
        `SELECT ID FROM tipo_material WHERE ID = ?`,
        [body.Material]
      );

      if (!materialExiste) {
        ctx.response.status = 400;
        ctx.response.body = {
          message: `Error: No existe un material con ID ${body.Material}.`,
        };
        return;
      }
    }

    if (body.Tipo) {
      const [tipoExiste] = await client.query(
        `SELECT ID FROM tipo_lentes WHERE ID = ?`,
        [body.Tipo]
      );

      if (!tipoExiste) {
        ctx.response.status = 400;
        ctx.response.body = {
          message: `Error: No existe un tipo de lente con ID ${body.Tipo}.`,
        };
        return;
      }
    }

    // Construir consulta SQL dinámica
    const fields = Object.keys(body).map((key) => `${key} = ?`).join(", ");
    const values = Object.values(body);
    values.push(id); // Agregar el ID al final para el WHERE

    const result = await client.execute(
      `UPDATE productos SET ${fields} WHERE ID = ?`,
      values
    );

    if (result.affectedRows === 0) {
      ctx.response.status = 404;
      ctx.response.body = { message: "Producto no encontrado" };
      return;
    }

    ctx.response.body = { message: "Producto actualizado exitosamente" };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      message: "Error al actualizar el producto",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};


export const deleteProducto = async (ctx: RouterContext<"/productos/:id">) => {
  try {
    const id = ctx.params.id;
    const result = await client.execute("DELETE FROM productos WHERE ID = ?", [
      id,
    ]);
    if (result.affectedRows === 0) {
      ctx.response.status = 404;
      ctx.response.body = { message: "Producto no encontrado" };
      return;
    }
    ctx.response.body = { message: "Producto eliminado exitosamente" };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      message: "Error al eliminar el producto",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export const searchProductos = async (
  ctx: RouterContext<"/productos/search">,
) => {
  try {
    // Log para verificar la URL que llega
    console.log("URL de la solicitud:", ctx.request.url.toString());

    // Obtener el parámetro 'nombre' de la URL
    const url = new URL(ctx.request.url);
    const nombre = url.searchParams.get("nombre");

    console.log("Parámetro 'nombre' recibido:", nombre);

    if (!nombre) {
      ctx.response.status = 400;
      ctx.response.body = { message: "Debe proporcionar un nombre para la búsqueda" };
      return;
    }

    // Consulta a la base de datos con logs para depuración
    console.log("Ejecutando consulta SQL...");
    const productos = await client.query(
      "SELECT * FROM productos WHERE LOWER(Nombre) LIKE LOWER(?)",
      [`%${nombre}%`],
    );
    console.log("Resultado de la consulta:", productos);

    if (productos.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = { message: "No se encontraron productos con ese nombre" };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = productos;
  } catch (error) {
    console.error("Error en searchProductos:", error);

    ctx.response.status = 500;
    ctx.response.body = {
      message: "Error al buscar productos",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};


