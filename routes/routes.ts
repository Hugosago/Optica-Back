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
import {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
  searchProductos,
} from "../controllers/productos.controllers.ts";
import { getAccesorios } from "../controllers/accesorios.ts";
import { getTiposAccesorios } from "../controllers/tipo_accesorios.controller.ts";
import { login } from "../controllers/auth.controller.ts"; // Asegúrate de que la ruta apunte al controlador correcto.

const router = new Router();

// Rutas de personas
router.get("/personas", getPersonas);
router.get("/personas/:id", getPersonaById);
router.post("/personas", createPersona);
router.put("/personas/:id", updatePersona);
router.delete("/personas/:id", deletePersona);

// Rutas de clientes
router.post("/clientes", createClient);
router.get("/clientes", obtenerClientes);

// Rutas de productos
router.get("/productos", getProductos);
router.get("/productos/search", searchProductos);
router.get("/productos/:id", getProductoById);
router.post("/productos", createProducto);
router.put("/productos/:id", updateProducto);
router.delete("/productos/:id", deleteProducto);

// Rutas de tipo lentes y tipo material
router.get("/tipo_lentes", getTiposLentes);
router.get("/tipo_material", getTiposMaterial);

// Rutas de accesorios y tipo accesorios
router.get("/accesorios", getAccesorios);
router.get("/tipo_accesorios", getTiposAccesorios);

// Ruta de autenticación con Google Token y generación de JWT
router.post("/auth/login", login); // Ruta de login que usará el controlador 'login'

export default router;
