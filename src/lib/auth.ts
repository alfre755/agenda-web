import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { admin } from "better-auth/plugins";

import { sendEmail } from "@/lib/mail";
import { ac, roles } from "@/lib/permissions";

import { db } from "./db"; // your drizzle instance

export const auth = betterAuth({
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({ to: user.email, subject: "Verify your email", text: `Click to verify: ${url}` });
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({ to: user.email, subject: "Reset your password", text: `Click to reset: ${url}` });
    },
    onPasswordReset: async ({ user }) => {
      console.log(`Password reset for ${user.email}`);
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      // Simple placeholder to enable flow; replace with your email sending logic
      sendChangeEmailVerification: async ({ user, newEmail, url }) => {
        console.log("Send change email verification:", { to: user.email, newEmail, url });
      },
    },
  },
  plugins: [
    organization({
      organizationHooks: {
        // Creation
        beforeCreateOrganization: async ({ organization: org, user }: any) => {
          // Add/merge default metadata; return shape must include data
          return {
            data: {
              ...org,
              metadata: {
                ...(org?.metadata ?? {}),
                createdBy: user?.id,
              },
            },
          };
        },
        afterCreateOrganization: async ({ organization: org }: any) => {
          console.log("afterCreateOrganization", org?.id);
        },
        // Update
        beforeUpdateOrganization: async ({ organization: org }: any) => {
          // Example normalization; keep as no-op if not needed
          return { data: { ...org } };
        },
        afterUpdateOrganization: async ({ organization: org }: any) => {
          console.log("afterUpdateOrganization", org?.id);
        },
        // Member lifecycle examples (no-op defaults)
        beforeAddMember: async ({ member }: any) => ({ data: member }),
        afterAddMember: async () => {},
        beforeRemoveMember: async () => {},
        afterRemoveMember: async () => {},
        beforeUpdateMemberRole: async ({ member, newRole }: any) => ({ data: { role: newRole, ...member } }),
        afterUpdateMemberRole: async () => {},
        // Invitations (no-op defaults to keep types happy)
        beforeCreateInvitation: async ({ invitation }: any) => ({ data: invitation }),
        afterCreateInvitation: async () => {},
        beforeAcceptInvitation: async () => {},
        afterAcceptInvitation: async () => {},
        beforeRejectInvitation: async () => {},
        afterRejectInvitation: async () => {},
        beforeCancelInvitation: async () => {},
        afterCancelInvitation: async () => {},
      },
    }),
    admin({ ac, roles }),
  ],
});
