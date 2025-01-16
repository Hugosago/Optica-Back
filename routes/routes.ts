import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { getPersonas, createPersona, deletePersona, updatePersona } from "../controllers/persona.ts";
import { createClient, deleteClient, getClientById, updateClient, getClients } from "../controllers/clientes.ts";

const router = new Router();
router
  .get("/personas", getPersonas)
  .post("/personas", createPersona)
  .put("/personas/:id", updatePersona)
  .delete("/personas/:id", deletePersona)

  .get("/clientes", getClients)
  .post("/clientes", createClient)
  .delete("/clientes/:id", deleteClient)
  .get("/clientes/:id", getClientById)
  .put("/clientes/:id", updateClient);

export default router;
