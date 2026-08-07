import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { USER_REPOSITORY, type UserRepository } from "../domain/user.repository";
import { TWO_FACTOR_SERVICE, type TwoFactorService } from "../domain/ports";

@Injectable()
export class ConfirmTwoFactorUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(TWO_FACTOR_SERVICE) private readonly twoFactor: TwoFactorService,
  ) {}

  async execute(userId: string, code: string): Promise<void> {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundException("Usuário não encontrado");
    if (!user.twoFactorSecret) {
      throw new BadRequestException("Ative o 2FA antes de confirmar o código");
    }

    const valid = this.twoFactor.verify(user.twoFactorSecret, code);
    if (!valid) throw new BadRequestException("Código 2FA inválido");

    await this.users.confirmTwoFactorEnabled(userId);
  }
}
