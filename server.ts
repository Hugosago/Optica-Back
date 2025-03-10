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
router.get("/swagger.json", async (context) => {
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

// Ruta de autenticación con Google OAuth
export async function authenticateUser(token: string, expoPushToken: string) {
  try {
    // Aquí iría la lógica para verificar el token de Google y autenticar al usuario
    return { message: "success", token: "generated_token", code: 200 };
  } catch (error) {
    console.error("Error en autenticación:", error);
    return { message: "Error interno en el servidor", code: 500 };
  }
}

app.use(async (context, next) => {
  try {
    await send(context, context.request.url.pathname, {
      root: `${Deno.cwd()}/swagger-ui`,
      index: "index.html",
    });
  } catch (error) {
    console.error("Error al servir archivo:", error);
    context.response.status = 404;
    context.response.body = { message: "Archivo no encontrado" };
  }
  await next();
});

app.use(router.routes());
app.use(router.allowedMethods());

// Middleware para servir contenido estático de la carpeta `swagger-ui`
app.use(async (context, next) => {
  const path = context.request.url.pathname;
  console.log("Ruta solicitada:", path);

  // Evitar que el middleware `send` maneje rutas de la API
  if (path.startsWith("/api")) {
    await next();
    return;
  }

  try {
    await send(context, path, {
      root: `${Deno.cwd()}/swagger-ui`,
      index: "index.html",
    });
  } catch (error) {
    console.error("Error al servir archivo estático:", error);
    context.response.status = 404;
    context.response.body = { message: "Archivo no encontrado" };
  }
});

// Verifica la conexión a la base de datos


console.log("Servidor corriendo en http://localhost:8000");
console.log("Swagger disponible en http://localhost:8000/swagger");
Deno.serve(async (req: Request) => {
  const res = await app.handle(req);
  return res ?? new Response("Not Found", { status: 404 });
});

