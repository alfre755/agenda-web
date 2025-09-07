import { authClient } from "@/lib/auth-client";

type SignUpParams = {
  name: string;
  email: string;
  password: string;
  image?: string;
  callbackURL?: string;
};

export async function signUpInitialUser(params: SignUpParams) {
  const { name, email, password, image, callbackURL = "/dashboard" } = params;

  const { data, error } = await authClient.signUp.email(
    { name, email, password, image, callbackURL },
    {
      onRequest: () => {
        // optional: show loading UI in caller
      },
      onSuccess: () => {
        // optional: navigate in caller
      },
      onError: (ctx) => {
        // surface the error to caller too
        // eslint-disable-next-line no-alert
        alert(ctx.error.message);
      },
    }
  );

  return { data, error };
}

// Example usage (in a client component or page):
// await signUpInitialUser({ name: "Admin", email: "admin@example.com", password: "password123" });


