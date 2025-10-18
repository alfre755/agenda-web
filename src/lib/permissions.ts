import { createAccessControl } from "better-auth/plugins/access";
import { adminAc,defaultStatements } from "better-auth/plugins/admin/access";

export const statements = {
  ...defaultStatements,
  organization: ["create", "list", "update", "delete"],
  project: ["create", "share", "update", "delete"],
  calendar: ["create", "list", "update", "delete"],
  calendarConfig: ["create", "list", "update", "delete"],
} as const;

export const ac = createAccessControl(statements);

// SUPERADMIN: acceso total global (equivale a admin por defecto + recursos extra)
export const roleSuperadmin = ac.newRole({
  ...adminAc.statements,
  organization: ["create", "list", "update", "delete"],
  project: ["create", "share", "update", "delete"],
  calendar: ["create", "list", "update", "delete"],
  calendarConfig: ["create", "list", "update", "delete"],
});

// ADMIN: acceso a operaciones de su organización (el alcance se valida en el backend)
export const roleAdmin = ac.newRole({
  // Incluir permisos por defecto de admin (usuario/sesión) para evitar 403 en endpoints admin
  ...adminAc.statements,
  // Y limitar/bajar privilegios en recursos propios si quieres (alcance se valida en backend)
  organization: ["list", "update"], // delete reservado a superadmin
  project: ["create", "share", "update"],
  calendar: ["create", "list", "update"],
  calendarConfig: ["create", "list", "update", "delete"],
});

// USER: permisos mínimos (ampliaremos más adelante)
export const roleUser = ac.newRole({
  calendar: ["list"],
});

export const roles = {
  superadmin: roleSuperadmin,
  admin: roleAdmin,
  user: roleUser,
} as const;
