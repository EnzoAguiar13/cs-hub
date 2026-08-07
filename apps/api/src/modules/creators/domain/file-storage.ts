export const FILE_STORAGE = Symbol("FILE_STORAGE");

export interface FileStorage {
  /** Presigned PUT URL the client uploads directly to; expires quickly (minutes). */
  getUploadUrl(storageKey: string, mimeType: string): Promise<string>;
  /** Presigned GET URL for displaying/downloading a previously confirmed file. */
  getDownloadUrl(storageKey: string): Promise<string>;
  buildStorageKey(creatorId: string, fileName: string): string;
}
