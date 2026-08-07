import { HttpException, type ArgumentsHost, type ExceptionFilter } from "@nestjs/common";
import type { Response } from "express";

/** Normalizes every error response to `{ statusCode, message, issues? }`. */
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    const body = exception instanceof HttpException ? exception.getResponse() : null;

    if (body && typeof body === "object") {
      response.status(status).json({ statusCode: status, ...body });
      return;
    }

    const message = exception instanceof HttpException ? exception.message : "Erro interno";
    response.status(status).json({ statusCode: status, message });
  }
}
