// AppModule validates its environment while the test module graph is imported.
// These CI-safe values only satisfy that import-time contract; creators.e2e-spec.ts
// replaces the database URL with its disposable Testcontainers database before boot.
process.env.DATABASE_URL ??= "postgresql://cshub:cshub@localhost:5432/cshub?schema=public";
process.env.REDIS_URL ??= "redis://localhost:6379";
process.env.JWT_ACCESS_SECRET ??= "e2e-access-secret-not-for-prod";
process.env.JWT_REFRESH_SECRET ??= "e2e-refresh-secret-not-for-prod";
process.env.ENCRYPTION_KEY ??= Buffer.alloc(32, 7).toString("base64");
process.env.MINIO_ENDPOINT ??= "http://localhost:9000";
process.env.MINIO_ROOT_USER ??= "cshub";
process.env.MINIO_ROOT_PASSWORD ??= "cshub12345";
process.env.MINIO_BUCKET ??= "cs-hub-files-test";
