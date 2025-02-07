import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { getPersonas, createPersona, deletePersona, updatePersona } from "../controllers/persona.ts";
import { createClient,   } from "../controllers/clientes.ts";
import { createAdmin,   } from "../controllers/admin.controller.ts";

const router = new Router();
router
  .get("/personas", getPersonas)
  .post("/personas", createPersona)
  .put("/personas/:id", updatePersona)
  .delete("/personas/:id", deletePersona)

  
  .post("/clientes", createClient)
  .post("/admin", createAdmin)


export default router;
