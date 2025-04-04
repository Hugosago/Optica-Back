import { Client } from "https://deno.land/x/mysql@v2.11.0/mod.ts";

export const actualizarCantidadCarrito = async (
  client: Client,
  carritoId: number,
  cantidad: number,
) => {
  // Obtener la cantidad actual del carrito
  const [carritoExistente] = await client.query(
    `SELECT Cantidad FROM carrito WHERE ID = ?`,
    [carritoId],
  );

  if (!carritoExistente) {
    throw new Error("Carrito no encontrado");
  }

  const nuevaCantidad = carritoExistente.Cantidad + cantidad;

  // Actualizar la cantidad en el carrito
  await client.execute(
    `UPDATE carrito SET Cantidad = ? WHERE ID = ?`,
    [nuevaCantidad, carritoId],
  );

  // Obtener el registro actualizado
  const [carritoActualizado] = await client.query(
    `SELECT ID, ClienteID, AgregadoEn, Cantidad, ProductoID, AccesorioID 
     FROM carrito WHERE ID = ?`,
    [carritoId],
  );

  return carritoActualizado;
};
