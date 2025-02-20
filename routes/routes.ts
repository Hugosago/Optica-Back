import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import {
  getPersonas,
  getPersonaById,
  createPersona,
  updatePersona,
  deletePersona,
} from "../controllers/persona.ts";

const router = new Router();

/**
 * @swagger
 * /personas:
 *   get:
 *     summary: Obtiene todas las personas
 *     tags: [Personas]
 *     responses:
 *       200:
 *         description: Lista de personas obtenida exitosamente
 */
router.get("/personas", getPersonas);

/**
 * @swagger
 * /personas/{id}:
 *   get:
 *     summary: Obtiene una persona por ID
 *     tags: [Personas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la persona a obtener
 *     responses:
 *       200:
 *         description: Persona encontrada
 *       404:
 *         description: Persona no encontrada
 */
router.get("/personas/:id", getPersonaById);

/**
 * @swagger
 * /personas:
 *   post:
 *     summary: Crea una nueva persona
 *     tags: [Personas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               PersonaID:
 *                 type: string
 *               Nombre:
 *                 type: string
 *               Apellidos:
 *                 type: string
 *               Contrasenia:
 *                 type: string
 *               CorreoElectronico:
 *                 type: string
 *     responses:
 *       201:
 *         description: Persona creada exitosamente
 */
router.post("/personas", createPersona);

/**
 * @swagger
 * /personas/{id}:
 *   put:
 *     summary: Actualiza una persona por ID
 *     tags: [Personas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Nombre:
 *                 type: string
 *               Apellidos:
 *                 type: string
 *               Contrasenia:
 *                 type: string
 *               CorreoElectronico:
 *                 type: string
 *     responses:
 *       200:
 *         description: Persona actualizada exitosamente
 *       404:
 *         description: Persona no encontrada
 */
router.put("/personas/:id", updatePersona);

/**
 * @swagger
 * /personas/{id}:
 *   delete:
 *     summary: Elimina una persona por ID
 *     tags: [Personas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Persona eliminada exitosamente
 *       404:
 *         description: Persona no encontrada
 */
router.delete("/personas/:id", deletePersona);

export default router;
