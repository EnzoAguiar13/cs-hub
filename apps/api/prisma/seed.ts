import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

const RESOURCES = ["creators", "users", "roles"] as const;
const ACTIONS = ["create", "read", "update", "delete", "export"] as const;

/** Default role -> allowed actions per resource. Roles/resources absent from a role's map get no access. */
const ROLE_PERMISSIONS: Record<string, Partial<Record<(typeof RESOURCES)[number], readonly (typeof ACTIONS)[number][]>>> = {
  ADMIN: {
    creators: ACTIONS,
    users: ACTIONS,
    roles: ACTIONS,
  },
  MANAGER: {
    creators: ["create", "read", "update", "delete", "export"],
    users: ["read"],
  },
  CS: {
    creators: ["create", "read", "update"],
  },
  FINANCE: {
    creators: ["read", "export"],
  },
  MARKETING: {
    creators: ["read"],
  },
  AFFILIATE: {},
  VIEWER: {
    creators: ["read"],
  },
};

async function main() {
  const permissionByKey = new Map<string, { id: string }>();

  for (const resource of RESOURCES) {
    for (const action of ACTIONS) {
      const permission = await prisma.permission.upsert({
        where: { resource_action: { resource, action } },
        update: {},
        create: { resource, action },
      });
      permissionByKey.set(`${resource}:${action}`, permission);
    }
  }

  for (const [roleName, resourceMap] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });

    for (const [resource, actions] of Object.entries(resourceMap)) {
      for (const action of actions ?? []) {
        const permission = permissionByKey.get(`${resource}:${action}`);
        if (!permission) continue;
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
          update: {},
          create: { roleId: role.id, permissionId: permission.id },
        });
      }
    }
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@cshub.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: "ADMIN" } });

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Administrador",
      passwordHash: await argon2.hash(adminPassword),
      roleId: adminRole.id,
    },
  });

  console.log(`Seed concluído. Admin: ${adminEmail} / senha definida em SEED_ADMIN_PASSWORD.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
