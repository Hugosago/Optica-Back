// Verificar el token de Google mediante la API pública de Google
export async function verifyGoogleToken(token: string) {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
    );
  
    if (!response.ok) {
      throw new Error("Invalid Google token");
    }
  
    const data = await response.json();
    console.log("Datos verificados con Google:", data);
    return data;
  }
  