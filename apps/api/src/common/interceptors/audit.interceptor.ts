import { Injectable, type CallHandler, type ExecutionContext, type NestInterceptor } from "@nestjs/common";
import type { Request } from "express";
import { tap } from "rxjs/operators";
import { PrismaService } from "../../prisma/prisma.service";
import type { RequestUser } from "../decorators/current-user.decorator";

const MUTATING_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

/** Records every mutating request as an AuditLog entry after it succeeds. */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<Request & { user?: RequestUser }>();

    if (!MUTATING_METHODS.has(request.method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((responseBody: unknown) => {
        const rawResourceId =
          (responseBody as { id?: string } | undefined)?.id ?? request.params?.id ?? null;
        const resourceId = Array.isArray(rawResourceId) ? (rawResourceId[0] ?? null) : rawResourceId;

        this.prisma.auditLog
          .create({
            data: {
              userId: request.user?.id ?? null,
              action: request.method,
              resource: this.resourceFromPath(request.path),
              resourceId,
              ipAddress: request.ip,
            },
          })
          .catch((error: unknown) => {
            // Auditing must never break the request it's observing; log and move on.
            console.error("Failed to write audit log", error);
          });
      }),
    );
  }

  private resourceFromPath(path: string): string {
    return path.split("/").filter(Boolean)[0] ?? path;
  }
}
