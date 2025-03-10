import { dbClient } from "../config/database.ts";

// Define la estructura del usuario
interface User {
  personaId : number;  
  email: string;
  name: string;
  lastname: string | null;
}

// Buscar un usuario por su correo electrónico
export async function findUserByEmail(email: string) {
  try {
    const result = await dbClient.query(
      `
      SELECT personaId, correo, nombre AS name, googleId
      FROM persona
      WHERE correo = ? 
    `,
      [email],
    );

    if (result.length > 0) {
      return result[0] as User;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error al buscar usuario por correo:", error);
  }
}

// Crear un nuevo usuario en la base de datos
export async function createUser(user: Partial<User>): Promise<User> {
  try {
    const { email, name, lastname } = user;

    if (!email || !name ) {
      throw new Error("Datos incompletos para crear el usuario");
    }

    // Insertar nuevo usuario
    const insertResult = await dbClient.execute(
      `
      INSERT INTO personas (CorreoElectronico, Nombre,Apellidos)
      VALUES (?, ?, ?)
    `,
      [email, name, lastname],
    );

    if (insertResult.lastInsertId) {
      return {
        personaId: insertResult.lastInsertId,
        email,
        name,
        lastname,
      } as User;
    } else {
      throw new Error("No se pudo crear el usuario");
    }
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    throw new Error("Error en la base de datos");
  }
}
