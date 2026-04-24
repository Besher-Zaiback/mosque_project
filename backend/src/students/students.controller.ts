import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, Roles, RolesGuard } from '../auth/auth.guards';
import { UserRole } from '../common/enums';
import { RequestUser } from '../common/request-user';
import { QuranService } from '../core/quran.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly quranService: QuranService) {}

  @Roles(UserRole.SUPERVISOR, UserRole.MOSQUE_MANAGER, UserRole.GENERAL_MANAGER)
  @Get(':id')
  async studentDetails(
    @Req() req: { user: RequestUser },
    @Param('id', ParseIntPipe) id: number,
  ) {
    const requester = await this.quranService.resolveScope(req.user.sub);
    return this.quranService.getStudentOverview(requester, id);
  }
}
