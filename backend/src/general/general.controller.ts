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
import { JwtAuthGuard, Roles, RolesGuard } from '../auth/auth.guards';
import { UserRole } from '../common/enums';
import { RequestUser } from '../common/request-user';
import { QuranService } from '../core/quran.service';
import { CreateAccountDto } from '../manager/dto';
import { CreateMosqueDto, ExamScoreDto } from './dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.GENERAL_MANAGER)
@Controller('general')
export class GeneralController {
  constructor(private readonly quranService: QuranService) {}

  @Get('exam-requests')
  pendingExams() {
    return this.quranService.pendingExamRequests();
  }

  @Get('mosques')
  mosques() {
    return this.quranService.listMosques();
  }

  @Post('mosques')
  createMosque(@Body() body: CreateMosqueDto) {
    return this.quranService.createMosque(body.name);
  }

  @Post('accounts')
  createAccount(@Body() body: CreateAccountDto) {
    return this.quranService.createAccount(body);
  }

  @Post('exam-requests/:id/score')
  submitExam(
    @Req() req: { user: RequestUser },
    @Param('id', ParseIntPipe) requestId: number,
    @Body() body: ExamScoreDto,
  ) {
    return this.quranService.submitExam(
      requestId,
      body.score,
      req.user.sub,
      body.nextCircleId,
    );
  }
}
