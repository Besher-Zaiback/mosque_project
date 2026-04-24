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
import {
  CircleDto,
  CreateAccountDto,
  CreateStudentDto,
  CreateSupervisorDto,
  UpdateAccountDto,
  UpdateCircleDto,
} from './dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MOSQUE_MANAGER, UserRole.GENERAL_MANAGER)
@Controller('manager')
export class ManagerController {
  constructor(private readonly quranService: QuranService) {}

  @Get('circles')
  async circles(@Req() req: { user: RequestUser }) {
    const requester = await this.quranService.resolveScope(req.user.sub);
    return this.quranService.listCircleDetails(requester);
  }

  @Get('supervisors')
  async supervisors(@Req() req: { user: RequestUser }) {
    const requester = await this.quranService.resolveScope(req.user.sub);
    return this.quranService.listAssignableSupervisors(requester);
  }

  @Post('supervisors')
  async createSupervisor(
    @Req() req: { user: RequestUser },
    @Body() body: CreateSupervisorDto,
  ) {
    const requester = await this.quranService.resolveScope(req.user.sub);
    return this.quranService.createAccountByRequester(requester, {
      fullName: body.fullName,
      email: body.email,
      password: body.password,
      role: UserRole.SUPERVISOR,
      mosqueId: body.mosqueId,
    });
  }

  @Post('circles')
  async createCircle(
    @Req() req: { user: RequestUser },
    @Body() body: CircleDto,
  ) {
    const requester = await this.quranService.resolveScope(req.user.sub);
    return this.quranService.createCircle(
      requester,
      body.name,
      body.levelOrder,
      body.startPage,
      body.endPage,
      body.supervisorId,
      body.mosqueId,
    );
  }

  @Post('circles/:id/update')
  async updateCircle(
    @Req() req: { user: RequestUser },
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateCircleDto,
  ) {
    const requester = await this.quranService.resolveScope(req.user.sub);
    return this.quranService.updateCircle(requester, id, {
      name: body.name,
      levelOrder: body.levelOrder,
      startPage: body.startPage,
      endPage: body.endPage,
      supervisorId: body.supervisorId === 0 ? null : body.supervisorId,
    });
  }

  @Post('circles/:id/delete')
  async deleteCircle(
    @Req() req: { user: RequestUser },
    @Param('id', ParseIntPipe) id: number,
  ) {
    const requester = await this.quranService.resolveScope(req.user.sub);
    return this.quranService.deleteCircle(requester, id);
  }

  @Post('students')
  async createStudent(
    @Req() req: { user: RequestUser },
    @Body() body: CreateStudentDto,
  ) {
    const requester = await this.quranService.resolveScope(req.user.sub);
    return this.quranService.createAccountByRequester(requester, {
      fullName: body.fullName,
      email: body.email,
      password: body.password,
      role: UserRole.STUDENT,
      circleId: body.circleId,
    });
  }

  @Post('accounts')
  async createAccount(
    @Req() req: { user: RequestUser },
    @Body() body: CreateAccountDto,
  ) {
    const requester = await this.quranService.resolveScope(req.user.sub);
    return this.quranService.createAccountByRequester(requester, body);
  }

  @Get('students')
  async students(@Req() req: { user: RequestUser }) {
    const requester = await this.quranService.resolveScope(req.user.sub);
    return this.quranService.findStudents(requester);
  }

  @Get('accounts')
  async accounts(@Req() req: { user: RequestUser }) {
    const requester = await this.quranService.resolveScope(req.user.sub);
    return this.quranService.listManageableAccounts(requester);
  }

  @Get('students/search/:query')
  async searchStudents(
    @Req() req: { user: RequestUser },
    @Param('query') query: string,
  ) {
    const requester = await this.quranService.resolveScope(req.user.sub);
    return this.quranService.findStudents(requester, query);
  }

  @Post('students/:id/remove')
  async removeStudent(
    @Req() req: { user: RequestUser },
    @Param('id', ParseIntPipe) id: number,
  ) {
    const requester = await this.quranService.resolveScope(req.user.sub);
    return this.quranService.removeStudent(requester, id);
  }

  @Post('accounts/:id/update')
  async updateAccount(
    @Req() req: { user: RequestUser },
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateAccountDto,
  ) {
    const requester = await this.quranService.resolveScope(req.user.sub);
    return this.quranService.updateAccountByRequester(requester, id, body);
  }

  @Post('accounts/:id/delete')
  async deleteAccount(
    @Req() req: { user: RequestUser },
    @Param('id', ParseIntPipe) id: number,
  ) {
    const requester = await this.quranService.resolveScope(req.user.sub);
    return this.quranService.deleteAccountByRequester(requester, id);
  }

  @Post('exam-request/:studentId')
  requestExam(
    @Req() req: { user: RequestUser },
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.quranService.requestExam(studentId, req.user.sub);
  }
}
