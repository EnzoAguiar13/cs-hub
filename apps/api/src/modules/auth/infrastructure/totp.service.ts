import { Injectable } from "@nestjs/common";
import { authenticator } from "otplib";
import type { TwoFactorService } from "../domain/ports";

@Injectable()
export class TotpService implements TwoFactorService {
  generateSecret(email: string): { secret: string; otpAuthUrl: string } {
    const secret = authenticator.generateSecret();
    const otpAuthUrl = authenticator.keyuri(email, "CS Hub", secret);
    return { secret, otpAuthUrl };
  }

  verify(secret: string, code: string): boolean {
    return authenticator.verify({ token: code, secret });
  }
}
