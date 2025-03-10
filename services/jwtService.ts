import {
  create,
  getNumericDate,
  verify,
} from "https://deno.land/x/djwt@v2.8/mod.ts";

// Clave secreta como string
const secretKey = "tu_clave_secreta_super_segura";

// Convierte la clave secreta a CryptoKey
async function createCryptoKey(secret: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

// Genera un token JWT
export async function generateJwt(
  payload: Record<string, unknown>,
): Promise<string> {
  const key = await createCryptoKey(secretKey);
  return await create(
    { alg: "HS256", typ: "JWT" },
    { ...payload, exp: getNumericDate(60 * 60) }, // 1 hora de expiración
    key,
  );
}

// Verifica un token JWT
export async function verifyJwt(
  token: string,
): Promise<Record<string, unknown> | null> {
  try {
    const key = await createCryptoKey(secretKey);
    return await verify(token, key);
  } catch (error) {
    console.error("Error al verificar el JWT:", error);
    return null;
  }
}
