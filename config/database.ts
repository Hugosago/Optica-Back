import { Client } from "../deps.ts";

export const dbClient = new Client();

await dbClient.connect({
  hostname: "localhost",
  username: "root", // Tu usuario
  password: "1234", // Tu contraseña
  port: 3307,
  db: "optica", // Tu base de datos
});

