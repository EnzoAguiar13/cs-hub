import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import type { Env } from "./config/env.validation";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<Env, true>);

  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({ origin: config.get("CORS_ORIGIN", { infer: true }), credentials: true });
  app.useGlobalFilters(new HttpExceptionFilter());

  // Railway (and most PaaS hosts) assign the port dynamically via `PORT` and expect the app
  // to bind to it; API_PORT stays as the local-dev/docker-compose default when PORT isn't set.
  const port = process.env.PORT ? Number(process.env.PORT) : config.get("API_PORT", { infer: true });
  await app.listen(port);
}

bootstrap();
