export const swaggerConfig = {
  openapi: "3.0.0",
  info: {
    title: "Optica API",
    version: "1.0.0",
    description: "API para la gestión de ópticas",
  },
  servers: [
    {
      url: "http://localhost:8000",
      description: "Servidor local",
    },
  ],
};
