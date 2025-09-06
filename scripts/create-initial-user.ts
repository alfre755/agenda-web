/*
  Usage:
  - Ensure the app is running and BETTER_AUTH_URL is set (e.g., http://localhost:3000)
  - Set USER_NAME, USER_EMAIL, USER_PASSWORD (and optionally USER_IMAGE, USER_CALLBACK_URL)
  - Run: npm run seed:user
*/

const requiredEnv = ["BETTER_AUTH_URL", "USER_NAME", "USER_EMAIL", "USER_PASSWORD"] as const;

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing required env: ${key}`);
    process.exit(1);
  }
}

const baseUrl = process.env.BETTER_AUTH_URL as string; // e.g., http://localhost:3000
const endpoint = new URL("/api/auth/sign-up/email", baseUrl).toString();

const body = {
  name: process.env.USER_NAME as string,
  email: process.env.USER_EMAIL as string,
  password: process.env.USER_PASSWORD as string,
  image: process.env.USER_IMAGE || undefined,
  callbackURL: process.env.USER_CALLBACK_URL || undefined,
};

async function main() {
  console.log(`Creating initial user at ${endpoint} ...`);
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });

  const text = await res.text();
  try {
    const json = JSON.parse(text);
    if (!res.ok) {
      console.error("Request failed", res.status, json);
      process.exit(1);
    }
    console.log("User created:", json);
  } catch {
    if (!res.ok) {
      console.error("Request failed (non-JSON)", res.status, text);
      process.exit(1);
    }
    console.log("User created (raw):", text);
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
