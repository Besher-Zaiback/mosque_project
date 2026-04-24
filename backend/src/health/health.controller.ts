import { Controller, Get } from '@nestjs/common';
import { ExamRequestStatus, PageRating, UserRole } from '../common/enums';

@Controller()
export class HealthController {
  @Get()
  health() {
    return { ok: true };
  }

  @Get('enums')
  enums() {
    return {
      ratings: Object.values(PageRating),
      examStatuses: Object.values(ExamRequestStatus),
      roles: Object.values(UserRole),
    };
  }
}
