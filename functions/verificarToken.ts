import { verify } from "https://deno.land/x/djwt@v2.8/mod.ts";

const secretKey = "tu_clave_secreta_super_segura"; // 🔹 Asegúrate de usar la misma clave que en jwtService.ts

async function getKey(): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secretKey), // 🔥 Debe coincidir con jwtService.ts
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
}

export async function verificarToken(token: string): Promise<number | null> {
  try {
    const key = await getKey();
    const payload = await verify(token, key) as Record<string, unknown>;

    console.log("🔍 Payload recibido:", payload); // 👈 Depuración

    if (payload && typeof payload.personaId === "number") {
      return payload.personaId;
    } else {
      console.warn("⚠️ El token no contiene un ID válido.");
      return null;
    }
  } catch (error) {
    console.error("❌ Error al verificar el token:", error);
    return null;
  }
}

