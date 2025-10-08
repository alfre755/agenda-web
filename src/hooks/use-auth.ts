"use client";
import { useMemo } from "react";

import { authClient } from "@/lib/auth-client";

type SignInEmailParams = {
  email: string;
  password: string;
  callbackURL?: string;
};
type SignUpEmailParams = {
  name: string;
  email: string;
  password: string;
  image?: string;
  callbackURL?: string;
};

export function useAuth() {
  const { data: session, isPending, error } = authClient.useSession();

  async function signInWithEmail(params: SignInEmailParams) {
    const { email, password, callbackURL } = params;
    return authClient.signIn.email(
      { email, password, callbackURL },
      {
        onError: (ctx) => {
          if (ctx.error?.status === 403) {
            // Email no verificado, mostrar mensaje en UI si se requiere
            console.warn("Email no verificado");
          }
        },
      }
    );
  }

  async function signUpWithEmail(params: SignUpEmailParams) {
    const { name, email, password, image, callbackURL } = params;
    return authClient.signUp.email({
      name,
      email,
      password,
      image,
      callbackURL,
    });
  }

  async function signOut() {
    return authClient.signOut();
  }

  async function refreshSession() {
    return authClient.getSession();
  }


  const isAuthenticated = useMemo(() => Boolean(session?.user?.id), [session]);

  return {
    session,
    isLoading: Boolean(isPending),
    error,
    isAuthenticated,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    refreshSession,
    sendVerificationEmail: authClient.sendVerificationEmail,
    requestPasswordReset: authClient.requestPasswordReset,
    resetPassword: authClient.resetPassword,
  } as const;
}
