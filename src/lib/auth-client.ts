import { adminClient } from "better-auth/client/plugins";
import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { ac, roles } from "@/lib/permissions";

// Configuración más robusta para detectar la URL correcta
const baseURL = (() => {
  // En el servidor (SSR), usar variable de entorno
  if (typeof window === "undefined") {
    return process.env.BETTER_AUTH_URL || process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  }
  
  // En el cliente, usar window.location.origin si no hay variable de entorno
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  
  return window.location.origin;
})();

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL,
  trustedOrigins: [baseURL],
  apiURL: `${baseURL}/api/auth`,
  plugins: [
    adminClient({ ac, roles }),
    organizationClient(),
  ],
});

// Tip: You can also export specific methods if you prefer:
// export const { signIn, signUp, useSession } = createAuthClient();
