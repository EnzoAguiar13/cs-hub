export const PASSWORD_HASHER = Symbol("PASSWORD_HASHER");
export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  verify(hash: string, plain: string): Promise<boolean>;
}

export const TWO_FACTOR_SERVICE = Symbol("TWO_FACTOR_SERVICE");
export interface TwoFactorService {
  generateSecret(email: string): { secret: string; otpAuthUrl: string };
  verify(secret: string, code: string): boolean;
}

export const ENCRYPTION_SERVICE = Symbol("ENCRYPTION_SERVICE");
export interface EncryptionService {
  encrypt(plain: string): string;
  decrypt(ciphertext: string): string;
}
