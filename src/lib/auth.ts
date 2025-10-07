import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { admin } from "better-auth/plugins";

import { sendEmail } from "@/lib/mail";
import { ac, roles } from "@/lib/permissions";
import { eq } from "drizzle-orm";

import { db } from "./db"; // your drizzle instance
import { member, organization as organizationTable } from "./db/schema";

// Función para obtener la organización activa del usuario
async function getActiveOrganization(userId: string) {
  try {
    // Buscar la primera organización del usuario
    const userOrganization = await db
      .select({
        id: organizationTable.id,
        name: organizationTable.name,
        slug: organizationTable.slug,
      })
      .from(organizationTable)
      .innerJoin(member, eq(organizationTable.id, member.organizationId))
      .where(eq(member.userId, userId))
      .limit(1);

    if (userOrganization.length > 0) {
      return userOrganization[0];
    }

    // Si no tiene organizaciones, crear una por defecto o usar una existente
    // Por ahora, retornar una organización por defecto
    return {
      id: "7eeGNeUgtTOFoaZFOpqadmipluFzPdG5",
      name: "Default Organization",
      slug: "default-org",
    };
  } catch (error) {
    console.error("Error getting user organization:", error);
    // Fallback a organización por defecto
    return {
      id: "7eeGNeUgtTOFoaZFOpqadmipluFzPdG5",
      name: "Default Organization", 
      slug: "default-org",
    };
  }
}

export const auth = betterAuth({
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({ to: user.email, subject: "Verify your email", text: `Click to verify: ${url}` });
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
  }),
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const organization = await getActiveOrganization(session.userId);
          return {
            data: {
              ...session,
              activeOrganizationId: organization.id,
            },
          };
        },
      },
    },
  },
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
