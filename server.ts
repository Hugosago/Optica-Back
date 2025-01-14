import { Application } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import router from "./routes/routes.ts";
import { dbClient } from "./config/database.ts";

const app = new Application();

// Verifica la conexión a la base de datos
try {
  await dbClient.execute("SELECT 1"); // Prueba básica de conexión
  console.log("Conexión a la base de datos exitosa");
} catch (error) {
  if (error instanceof Error) {
    console.error("Error al conectar a la base de datos:", error.message);
  } else {
    console.error("Error inesperado:", error);
  }
  Deno.exit(1); // Termina el proceso si no hay conexión
}

// Configura rutas
app.use(router.routes());
app.use(router.allowedMethods());

console.log("Servidor corriendo en http://localhost:8000");
await app.listen({ port: 8000 });
