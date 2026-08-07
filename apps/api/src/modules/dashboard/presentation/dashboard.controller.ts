import { Controller, Get } from "@nestjs/common";
import { RequirePermission } from "../../../common/decorators/require-permission.decorator";
import { DashboardService } from "../application/dashboard.service";

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get("summary")
  @RequirePermission("dashboard", "read")
  summary() {
    return this.dashboard.summary();
  }
}
