import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import type { FileStorage } from "../domain/file-storage";

const UPLOAD_URL_TTL_SECONDS = 5 * 60;
const DOWNLOAD_URL_TTL_SECONDS = 15 * 60;

@Injectable()
export class MinioFileStorage implements FileStorage {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(config: ConfigService) {
    this.bucket = config.getOrThrow("MINIO_BUCKET");
    this.client = new S3Client({
      endpoint: config.getOrThrow("MINIO_ENDPOINT"),
      region: config.get("MINIO_REGION", "us-east-1"),
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.getOrThrow("MINIO_ROOT_USER"),
        secretAccessKey: config.getOrThrow("MINIO_ROOT_PASSWORD"),
      },
    });
  }

  buildStorageKey(creatorId: string, fileName: string): string {
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    return `creators/${creatorId}/${randomUUID()}-${safeName}`;
  }

  async getUploadUrl(storageKey: string, mimeType: string): Promise<string> {
    const command = new PutObjectCommand({ Bucket: this.bucket, Key: storageKey, ContentType: mimeType });
    return getSignedUrl(this.client, command, { expiresIn: UPLOAD_URL_TTL_SECONDS });
  }

  async getDownloadUrl(storageKey: string): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: storageKey });
    return getSignedUrl(this.client, command, { expiresIn: DOWNLOAD_URL_TTL_SECONDS });
  }
}
