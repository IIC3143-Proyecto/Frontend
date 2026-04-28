import { Auth0Client } from "@auth0/nextjs-auth0/server";

// El cliente ahora tomará la configuración directamente de las variables de entorno.
export const auth0 = new Auth0Client();