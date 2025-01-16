import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { getPersonas, createPersona, deletePersona, updatePersona } from "../controllers/persona.ts";
import { getProductos, createProducto, updateProducto, deleteProducto, getProductoById } from "../controllers/productos.controllers.ts";
//import { createClient, deleteClient,  } from "../controllers/client.ts";

const router = new Router();
router
  .get("/personas", getPersonas)
  .post("/personas", createPersona)
  .put("/personas/:id", updatePersona)
  .delete("/personas/:id", deletePersona)
  //.post("/clientes", createClient)
  //.delete("/clients/:id", deleteClient);
  .get("/productos", getProductos)
  .post("/productos", createProducto)
  .put("/productos/:id", updateProducto)
  .get("/productos/:id", getProductoById)
  .delete("/productos/:id", deleteProducto);



export default router;
