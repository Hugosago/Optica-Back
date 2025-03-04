import { Application, Router, send } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import {serve} from 'https://deno.land/std@0.223.0/http/server.ts';
import { dbClient } from "./config/database.ts";
import router from "./routes/routes.ts";

const app = new Application();

// Habilitar CORS
app.use(oakCors({
  origin: "*", // Permitir cualquier origen, puedes especificar uno en particular
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Ruta para servir `swagger.json`
router.get("swagger.json", async (context) => {
  const filePath = `${Deno.cwd()}/swagger-ui/swagger.json`;
  console.log("Intentando servir:", filePath);
  try {
    const swaggerJson = await Deno.readTextFile(filePath);
    context.response.headers.set("Content-Type", "application/json");
    context.response.body = swaggerJson;
  } catch (error) {
    console.error("Error al cargar swagger.json:", error);
    context.response.status = 404;
    context.response.body = { message: "Archivo swagger.json no encontrado" };
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

// Middleware para servir contenido estático de la carpeta `swagger-ui`
app.use(async (context, next) => {
  const path = context.request.url.pathname;
  console.log("Ruta solicitada:", path);
  try {
    await send(context, path, {
      root: `${Deno.cwd()}/swagger-ui`,
      index: "index.html",
    });
  } catch (error) {
    console.error("Error al servir archivo:", error);
    context.response.status = 404;
    context.response.body = { message: "Archivo no encontrado" };
    await next();
  }
});

// Verifica la conexión a la base de datos


console.log("Servidor corriendo en http://localhost:8000");
console.log("Swagger disponible en http://localhost:8000/swagger");
serve(() => new Response('El servidor está corriendo'));