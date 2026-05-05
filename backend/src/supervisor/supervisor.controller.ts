import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '../common/enums';
import { RequestUser } from '../common/request-user';
import { QuranService } from '../core/quran.service';
import { JwtAuthGuard, Roles, RolesGuard } from '../auth/auth.guards';
import { EvaluateDto } from './dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class SupervisorController {
  constructor(private readonly quranService: QuranService) {}

  @Roles(UserRole.SUPERVISOR)
  @Get('supervisor/students')
  supervisorStudents(@Req() req: { user: RequestUser }) {
    return this.quranService.getSupervisorStudents(req.user.sub);
  }

  @Roles(UserRole.SUPERVISOR, UserRole.GENERAL_MANAGER)
  @Post('students/:id/evaluate')
  evaluateStudent(
    @Req() req: { user: RequestUser },
    @Param('id', ParseIntPipe) studentId: number,
    @Body() body: EvaluateDto,
  ) {
    return this.quranService.evaluatePage(
      req.user.sub,
      studentId,
      body.pageNumber,
      body.rating,
      body.note,
    );
  }
}
