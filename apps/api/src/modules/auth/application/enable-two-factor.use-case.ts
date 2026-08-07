import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { USER_REPOSITORY, type UserRepository } from "../domain/user.repository";
import { TWO_FACTOR_SERVICE, type TwoFactorService } from "../domain/ports";

@Injectable()
export class EnableTwoFactorUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(TWO_FACTOR_SERVICE) private readonly twoFactor: TwoFactorService,
  ) {}

  async execute(userId: string): Promise<{ secret: string; otpAuthUrl: string }> {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundException("Usuário não encontrado");

    const { secret, otpAuthUrl } = this.twoFactor.generateSecret(user.email);
    await this.users.setTwoFactorSecret(userId, secret);
    return { secret, otpAuthUrl };
  }
}
