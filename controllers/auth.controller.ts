import { Context } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { verifyGoogleToken } from "../services/googleAuthService.ts";
import { generateJwt } from "../services/jwtService.ts"; // Cambio aquí
import { findUserByEmail, createUser } from "../services/userService.ts";

export async function login(ctx: Context) {
  try {
    console.log("Auth Login");
    const { googleToken } = await ctx.request.body().value;
    console.log("Token de Google recibido:", googleToken);

    if (!googleToken) {
      ctx.response.status = 400;
      ctx.response.body = { message: "Google token is required", code: 400 };
      return;
    }

    const googleData = await verifyGoogleToken(googleToken);
    console.log("Datos de usuario de Google:", googleData);

    if (!googleData || !googleData.email) {
      ctx.response.status = 401;
      ctx.response.body = { message: "Invalid Google token", code: 401 };
      return;
    }

    let user = await findUserByEmail(googleData.email);
    console.log("Usuario encontrado:", user);

    if (!user) {
      console.log("Usuario no encontrado, creando nuevo usuario...");
      user = await createUser({
        email: googleData.email,
        name: googleData.given_name,
        lastname: googleData.family_name,
      });
    }

    const token = await generateJwt({ personaId: user.personaId });
    console.log("Token JWT generado:", token);

    ctx.response.status = 200;
    ctx.response.body = { message: "success", token, code: 200 };
  } catch (error) {
    console.error("Error en el proceso de autenticación:", error);
    ctx.response.status = 500;
    ctx.response.body = { message: "Internal server error", code: 500 };
  }
}

