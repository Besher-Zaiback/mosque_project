import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, Roles, RolesGuard } from '../auth/auth.guards';
import { UserRole } from '../common/enums';
import { RequestUser } from '../common/request-user';
import { QuranService } from '../core/quran.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PARENT)
@Controller('parent')
export class ParentController {
  constructor(private readonly quranService: QuranService) {}

  @Get('dashboard')
  dashboard(@Req() req: { user: RequestUser }) {
    return this.quranService.parentDashboard(req.user.sub);
  }
}
