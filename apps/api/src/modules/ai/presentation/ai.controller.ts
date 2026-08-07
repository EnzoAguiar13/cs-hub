import { Body, Controller, Get, Post } from "@nestjs/common";
import { askAiSchema, type AskAiInput } from "@cs-hub/shared-types";
import { RequirePermission } from "../../../common/decorators/require-permission.decorator";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { AiService } from "../application/ai.service";

@Controller("ai")
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Get("insights")
  @RequirePermission("ai", "read")
  insights() {
    return this.ai.allInsights();
  }

  @Post("ask")
  @RequirePermission("ai", "read")
  ask(@Body(new ZodValidationPipe(askAiSchema)) body: AskAiInput) {
    return this.ai.ask(body.question);
  }
}
