import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import {
  getPersonas,
  getPersonaById,
  createPersona,
  updatePersona,
  deletePersona,
} from "../controllers/persona.ts";
import { createClient, obtenerClientes } from "../controllers/clientes.ts";
import { getTiposLentes } from "../controllers/tipo_lentes.controller.ts";
import { getTiposMaterial } from "../controllers/tipo_material.controller.ts";
import { getProductos, getProductoById, createProducto, updateProducto, deleteProducto, searchProductos} from "../controllers/productos.controllers.ts";

const router = new Router();

router.get("/personas", getPersonas);
router.get("/personas/:id", getPersonaById);
router.post("/personas", createPersona);
router.put("/personas/:id", updatePersona);
router.delete("/personas/:id", deletePersona);

router.post("/clientes", createClient);
router.get("/clientes", obtenerClientes);

router.get("/productos", getProductos);
router.get("/productos/search", searchProductos);
router.get("/productos/:id", getProductoById);
router.post("/productos", createProducto);
router.put("/productos/:id", updateProducto);
router.delete("/productos/:id", deleteProducto);

router.get("/tipo_lentes", getTiposLentes);
router.get("/tipo_material", getTiposMaterial);

export default router;
