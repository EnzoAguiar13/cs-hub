import { execSync } from "node:child_process";
import { Test } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { TOKEN_SERVICE, type TokenService } from "../src/modules/auth/domain/token.service";
import { FILE_STORAGE, type FileStorage } from "../src/modules/creators/domain/file-storage";

const RESOURCES = ["creators"] as const;
const ACTIONS = ["create", "read", "update", "delete", "export"] as const;

const fakeFileStorage: FileStorage = {
  buildStorageKey: (creatorId, fileName) => `creators/${creatorId}/${fileName}`,
  getUploadUrl: async (storageKey) => `https://fake-upload.test/${storageKey}`,
  getDownloadUrl: async (storageKey) => `https://fake-download.test/${storageKey}`,
};

describe("Creators (e2e)", () => {
  jest.setTimeout(120_000);

  let container: StartedPostgreSqlContainer;
  let app: INestApplication;
  let prisma: PrismaService;
  let csUserToken: string;
  let viewerUserToken: string;

  beforeAll(async () => {
    container = await new PostgreSqlContainer("postgres:16-alpine").start();

    process.env.DATABASE_URL = container.getConnectionUri();
    process.env.REDIS_URL = "redis://localhost:6379";
    process.env.JWT_ACCESS_SECRET = "e2e-access-secret-not-for-prod";
    process.env.JWT_REFRESH_SECRET = "e2e-refresh-secret-not-for-prod";
    process.env.ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
    process.env.MINIO_ENDPOINT = "http://localhost:9000";
    process.env.MINIO_ROOT_USER = "cshub";
    process.env.MINIO_ROOT_PASSWORD = "cshub12345";
    process.env.MINIO_BUCKET = "cs-hub-files-test";
    process.env.CORS_ORIGIN = "http://localhost:3000";
    process.env.API_PORT = "0";

    // No migration history is checked in yet at this stage of the project; push the schema
    // straight onto the ephemeral test container instead of `prisma migrate deploy`.
    execSync("npx prisma db push --skip-generate --accept-data-loss", {
      cwd: __dirname.replace(/[/\\]test$/, ""),
      env: { ...process.env },
      stdio: "inherit",
    });

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(FILE_STORAGE)
      .useValue(fakeFileStorage)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    const tokenService = app.get<TokenService>(TOKEN_SERVICE);

    const permissionByKey = new Map<string, { id: string }>();
    for (const resource of RESOURCES) {
      for (const action of ACTIONS) {
        const permission = await prisma.permission.create({ data: { resource, action } });
        permissionByKey.set(`${resource}:${action}`, permission);
      }
    }

    const csRole = await prisma.role.create({ data: { name: "CS" } });
    for (const action of ["create", "read", "update"] as const) {
      await prisma.rolePermission.create({
        data: { roleId: csRole.id, permissionId: permissionByKey.get(`creators:${action}`)!.id },
      });
    }
    const viewerRole = await prisma.role.create({ data: { name: "VIEWER" } });

    const csUser = await prisma.user.create({
      data: { email: "cs@e2e.test", name: "CS User", roleId: csRole.id },
    });
    const viewerUser = await prisma.user.create({
      data: { email: "viewer@e2e.test", name: "Viewer User", roleId: viewerRole.id },
    });

    csUserToken = await tokenService.signAccessToken({
      sub: csUser.id,
      email: csUser.email,
      roleId: csRole.id,
      roleName: "CS",
    });
    viewerUserToken = await tokenService.signAccessToken({
      sub: viewerUser.id,
      email: viewerUser.email,
      roleId: viewerRole.id,
      roleName: "VIEWER",
    });
  });

  afterAll(async () => {
    await app?.close();
    await container?.stop();
  });

  it("creates, lists/filters/paginates, fetches and updates a creator end to end", async () => {
    const server = app.getHttpServer();

    const createRes = await request(server)
      .post("/creators")
      .set("Authorization", `Bearer ${csUserToken}`)
      .send({ name: "Fulano da Silva", status: "ACTIVE", tags: ["vip"], category: "streamer" })
      .expect(201);
    expect(createRes.body).toMatchObject({ name: "Fulano da Silva", status: "ACTIVE" });
    const creatorId = createRes.body.id as string;

    const listRes = await request(server)
      .get("/creators")
      .query({ search: "Fulano", page: 1, pageSize: 20 })
      .set("Authorization", `Bearer ${csUserToken}`)
      .expect(200);
    expect(listRes.body.items.map((c: { id: string }) => c.id)).toContain(creatorId);
    expect(listRes.body.total).toBeGreaterThanOrEqual(1);

    const getRes = await request(server)
      .get(`/creators/${creatorId}`)
      .set("Authorization", `Bearer ${csUserToken}`)
      .expect(200);
    expect(getRes.body.id).toBe(creatorId);

    const updateRes = await request(server)
      .patch(`/creators/${creatorId}`)
      .set("Authorization", `Bearer ${csUserToken}`)
      .send({ status: "BLOCKED" })
      .expect(200);
    expect(updateRes.body.status).toBe("BLOCKED");
  });

  it("adds a timeline note and lists the timeline", async () => {
    const server = app.getHttpServer();
    const creator = await request(server)
      .post("/creators")
      .set("Authorization", `Bearer ${csUserToken}`)
      .send({ name: "Ciclana" })
      .expect(201);

    await request(server)
      .post(`/creators/${creator.body.id}/timeline`)
      .set("Authorization", `Bearer ${csUserToken}`)
      .send({ description: "Primeira conversa com a creator" })
      .expect(201);

    const timelineRes = await request(server)
      .get(`/creators/${creator.body.id}/timeline`)
      .set("Authorization", `Bearer ${csUserToken}`)
      .expect(200);

    const types = timelineRes.body.map((event: { type: string }) => event.type);
    expect(types).toEqual(expect.arrayContaining(["CREATED", "NOTE"]));
  });

  it("requests and confirms a file upload, exposing a download URL", async () => {
    const server = app.getHttpServer();
    const creator = await request(server)
      .post("/creators")
      .set("Authorization", `Bearer ${csUserToken}`)
      .send({ name: "Beltrano" })
      .expect(201);

    const uploadReq = await request(server)
      .post(`/creators/${creator.body.id}/files/upload-request`)
      .set("Authorization", `Bearer ${csUserToken}`)
      .send({ fileName: "contrato.pdf", mimeType: "application/pdf", type: "CONTRACT" })
      .expect(201);
    expect(uploadReq.body.uploadUrl).toContain("fake-upload.test");

    const confirmRes = await request(server)
      .post(`/creators/${creator.body.id}/files/confirm`)
      .set("Authorization", `Bearer ${csUserToken}`)
      .send({
        storageKey: uploadReq.body.storageKey,
        fileName: "contrato.pdf",
        mimeType: "application/pdf",
        sizeBytes: 2048,
        type: "CONTRACT",
      })
      .expect(201);
    expect(confirmRes.body.downloadUrl).toContain("fake-download.test");

    const filesRes = await request(server)
      .get(`/creators/${creator.body.id}/files`)
      .set("Authorization", `Bearer ${csUserToken}`)
      .expect(200);
    expect(filesRes.body).toHaveLength(1);
  });

  it("rejects requests without a token and requests missing the creators:update permission", async () => {
    const server = app.getHttpServer();

    await request(server).get("/creators").expect(401);

    const creator = await request(server)
      .post("/creators")
      .set("Authorization", `Bearer ${csUserToken}`)
      .send({ name: "Sem Permissao" })
      .expect(201);

    await request(server)
      .patch(`/creators/${creator.body.id}`)
      .set("Authorization", `Bearer ${viewerUserToken}`)
      .send({ status: "BLOCKED" })
      .expect(403);
  });
});
