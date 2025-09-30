import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { organizationClient } from "better-auth/client/plugins";
import { ac, roles } from "@/lib/permissions";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

console.log("Auth Client Base URL:", baseURL);

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL,
  apiURL: `${baseURL}/api/auth`,
  plugins: [
    adminClient({ ac, roles }),
    organizationClient(),
  ],
});

// Tip: You can also export specific methods if you prefer:
// export const { signIn, signUp, useSession } = createAuthClient();
