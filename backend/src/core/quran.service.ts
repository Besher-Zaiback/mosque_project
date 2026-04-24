import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, ILike, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ExamRequestStatus, PageRating, UserRole } from '../common/enums';
import {
  Circle,
  ExamRequest,
  ExamResult,
  Mosque,
  PageEvaluation,
  User,
} from '../entities';

@Injectable()
export class QuranService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(Circle) private readonly circlesRepo: Repository<Circle>,
    @InjectRepository(Mosque) private readonly mosquesRepo: Repository<Mosque>,
    @InjectRepository(PageEvaluation)
    private readonly evaluationsRepo: Repository<PageEvaluation>,
    @InjectRepository(ExamRequest)
    private readonly examRequestsRepo: Repository<ExamRequest>,
    @InjectRepository(ExamResult)
    private readonly examResultsRepo: Repository<ExamResult>,
  ) {}

  async seedData(): Promise<void> {
    if ((await this.usersRepo.count()) > 0) return;
    const hash = await bcrypt.hash('123456', 10);
    const generalManager = await this.usersRepo.save({
      fullName: 'أحمد الإداري',
      email: 'general@example.com',
      passwordHash: hash,
      role: UserRole.GENERAL_MANAGER,
      mosque: null,
      circle: null,
      linkedStudentId: null,
      currentPage: null,
    });
    const mosqueSpecs = [
      {
        name: 'جامع الهدى',
        managerName: 'خالد مدير الهدى',
        managerEmail: 'manager@example.com',
        circles: [
          { name: 'حلقة الفجر', levelOrder: 1, startPage: 1, endPage: 20, supervisorName: 'سعيد مشرف الفجر', supervisorEmail: 'supervisor@example.com' },
          { name: 'حلقة البيان', levelOrder: 2, startPage: 21, endPage: 40, supervisorName: 'مازن مشرف البيان', supervisorEmail: 'supervisor2@example.com' },
        ],
      },
      {
        name: 'جامع التقوى',
        managerName: 'راشد مدير التقوى',
        managerEmail: 'manager2@example.com',
        circles: [
          { name: 'حلقة الإتقان', levelOrder: 1, startPage: 41, endPage: 60, supervisorName: 'بدر مشرف الإتقان', supervisorEmail: 'supervisor3@example.com' },
          { name: 'حلقة النور', levelOrder: 2, startPage: 61, endPage: 80, supervisorName: 'رامي مشرف النور', supervisorEmail: 'supervisor4@example.com' },
        ],
      },
      {
        name: 'جامع الرحمة',
        managerName: 'عصام مدير الرحمة',
        managerEmail: 'manager3@example.com',
        circles: [
          { name: 'حلقة اليقين', levelOrder: 1, startPage: 81, endPage: 100, supervisorName: 'أمير مشرف اليقين', supervisorEmail: 'supervisor5@example.com' },
          { name: 'حلقة السكينة', levelOrder: 2, startPage: 101, endPage: 120, supervisorName: 'شادي مشرف السكينة', supervisorEmail: 'supervisor6@example.com' },
        ],
      },
      {
        name: 'جامع الإحسان',
        managerName: 'نزار مدير الإحسان',
        managerEmail: 'manager4@example.com',
        circles: [
          { name: 'حلقة التلاوة', levelOrder: 1, startPage: 121, endPage: 140, supervisorName: 'وائل مشرف التلاوة', supervisorEmail: 'supervisor7@example.com' },
          { name: 'حلقة الارتقاء', levelOrder: 2, startPage: 141, endPage: 160, supervisorName: 'صفوان مشرف الارتقاء', supervisorEmail: 'supervisor8@example.com' },
        ],
      },
      {
        name: 'جامع البركة',
        managerName: 'حسام مدير البركة',
        managerEmail: 'manager5@example.com',
        circles: [
          { name: 'حلقة الرواد', levelOrder: 1, startPage: 161, endPage: 180, supervisorName: 'تمام مشرف الرواد', supervisorEmail: 'supervisor9@example.com' },
          { name: 'حلقة المنهاج', levelOrder: 2, startPage: 181, endPage: 200, supervisorName: 'لؤي مشرف المنهاج', supervisorEmail: 'supervisor10@example.com' },
        ],
      },
    ] as const;

    const firstNames = [
      'يوسف', 'عمر', 'عبدالرحمن', 'محمد', 'أحمد', 'زيد', 'أنس', 'معاذ',
      'سلمان', 'إياد', 'سليم', 'مصعب', 'حمزة', 'ريان', 'حذيفة', 'جود',
      'أوس', 'باسل', 'يزن', 'مهند', 'فارس', 'عبدالله', 'إبراهيم', 'طارق',
    ];
    const lastNames = [
      'الحافظ', 'المتقن', 'الأنصاري', 'العابد', 'السالم', 'الحموي',
      'الخطيب', 'الرفاعي', 'المقدسي', 'التميمي', 'الشافعي', 'النجار',
    ];
    const parentPrefixes = ['أبو', 'أم'];
    const evalNotes = [
      'أداء ثابت ومميز مع تسميع متقن.',
      'يحتاج تثبيت أوائل الصفحة ومراجعة الوقف.',
      'تحسن جيد هذا الأسبوع مع هدوء أثناء التسميع.',
      'يلزم مراجعة المواضع المتشابهة قبل التقدم.',
      'حضور ممتاز وتفاعل جيد داخل الحلقة.',
    ];
    const ratings = [
      PageRating.EXCELLENT,
      PageRating.VERY_GOOD,
      PageRating.GOOD,
      PageRating.REPEAT,
    ];

    let studentCounter = 1;

    for (const mosqueSpec of mosqueSpecs) {
      const mosque = await this.mosquesRepo.save({ name: mosqueSpec.name });
      await this.usersRepo.save({
        fullName: mosqueSpec.managerName,
        email: mosqueSpec.managerEmail,
        passwordHash: hash,
        role: UserRole.MOSQUE_MANAGER,
        mosque,
        circle: null,
        linkedStudentId: null,
        currentPage: null,
      });

      for (const circleSpec of mosqueSpec.circles) {
        const supervisor = await this.usersRepo.save({
          fullName: circleSpec.supervisorName,
          email: circleSpec.supervisorEmail,
          passwordHash: hash,
          role: UserRole.SUPERVISOR,
          mosque,
          circle: null,
          linkedStudentId: null,
          currentPage: null,
        });

        const circle = await this.circlesRepo.save({
          name: circleSpec.name,
          levelOrder: circleSpec.levelOrder,
          startPage: circleSpec.startPage,
          endPage: circleSpec.endPage,
          supervisor,
          mosque,
        });
        for (let i = 0; i < 6; i += 1) {
          const firstName = firstNames[(studentCounter - 1) % firstNames.length];
          const lastName = lastNames[(studentCounter - 1) % lastNames.length];
          const fullName = `${firstName} ${lastName} ${studentCounter}`;
          const currentPage =
            circle.startPage +
            ((studentCounter + i) % (circle.endPage - circle.startPage + 1));
          const student = await this.usersRepo.save({
            fullName,
            email: `student${studentCounter}@example.com`,
            passwordHash: hash,
            role: UserRole.STUDENT,
            mosque,
            circle,
            linkedStudentId: null,
            currentPage,
          });
          await this.usersRepo.save({
            fullName: `${parentPrefixes[studentCounter % parentPrefixes.length]} ${firstName} ${studentCounter}`,
            email: `parent${studentCounter}@example.com`,
            passwordHash: hash,
            role: UserRole.PARENT,
            mosque,
            circle: null,
            linkedStudentId: student.id,
            currentPage: null,
          });

          await this.evaluationsRepo.save([
            {
              evaluator: supervisor,
              student,
              pageNumber: Math.max(circle.startPage, currentPage - 2),
              rating: ratings[studentCounter % ratings.length],
              note: evalNotes[studentCounter % evalNotes.length],
            },
            {
              evaluator: supervisor,
              student,
              pageNumber: Math.max(circle.startPage, currentPage - 1),
              rating: ratings[(studentCounter + 1) % ratings.length],
              note: evalNotes[(studentCounter + 1) % evalNotes.length],
            },
          ]);

          if (studentCounter % 5 === 0) {
            const examRequest = await this.examRequestsRepo.save({
              student,
              requestedByManager: generalManager,
              status:
                studentCounter % 10 === 0
                  ? ExamRequestStatus.APPROVED
                  : ExamRequestStatus.PENDING,
            });
            if (examRequest.status === ExamRequestStatus.APPROVED) {
              await this.examResultsRepo.save({
                student,
                reviewedByGeneralManager: generalManager,
                score: 85,
                passed: true,
              });
            }
          }

          studentCounter += 1;
        }
      }
    }
  }

  async resolveScope(userId: number) {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: ['mosque'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private decorateStudentProgress(student: User) {
    const current = student.currentPage ?? student.circle?.startPage ?? 0;
    const end = student.circle?.endPage ?? current;
    return {
      ...student,
      currentPage: current,
      remainingPages: Math.max(end - current, 0),
      progressPercent:
        student.circle && student.circle.endPage >= student.circle.startPage
          ? Math.min(
              100,
              Math.round(
                ((current - student.circle.startPage + 1) /
                  (student.circle.endPage - student.circle.startPage + 1)) *
                  100,
              ),
            )
          : 0,
    };
  }

  private async mustGetMosque(mosqueId: number) {
    const mosque = await this.mosquesRepo.findOne({ where: { id: mosqueId } });
    if (!mosque) throw new NotFoundException('Mosque not found');
    return mosque;
  }

  async createMosque(name: string) {
    return this.mosquesRepo.save({ name });
  }

  listMosques() {
    return this.mosquesRepo.find({ order: { name: 'ASC' } });
  }

  async createAccount(payload: {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
    mosqueId?: number;
    circleId?: number;
    linkedStudentId?: number;
  }) {
    const existingUser = await this.usersRepo.findOne({
      where: { email: payload.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }
    if (payload.role === UserRole.STUDENT && !payload.circleId) {
      throw new BadRequestException('Student account requires a circle');
    }
    if (
      (payload.role === UserRole.SUPERVISOR ||
        payload.role === UserRole.MOSQUE_MANAGER) &&
      !payload.mosqueId
    ) {
      throw new BadRequestException('Mosque is required for this account');
    }
    if (payload.role === UserRole.PARENT && !payload.linkedStudentId) {
      throw new BadRequestException('Parent account requires a linked student');
    }
    const passwordHash = await bcrypt.hash(payload.password, 10);
    const mosque = payload.mosqueId
      ? await this.mustGetMosque(payload.mosqueId)
      : null;
    const circle = payload.circleId
      ? await this.circlesRepo.findOne({
          where: { id: payload.circleId },
          relations: ['mosque'],
        })
      : null;
    if (payload.circleId && !circle)
      throw new NotFoundException('Circle not found');
    if (circle && mosque && circle.mosque?.id !== mosque.id) {
      throw new BadRequestException('Circle does not belong to mosque');
    }
    const linkedStudent =
      payload.role === UserRole.PARENT && payload.linkedStudentId
        ? await this.usersRepo.findOne({
            where: { id: payload.linkedStudentId, role: UserRole.STUDENT },
            relations: ['mosque'],
          })
        : null;
    if (payload.role === UserRole.PARENT && !linkedStudent) {
      throw new NotFoundException('Linked student not found');
    }
    if (linkedStudent && mosque && linkedStudent.mosque?.id !== mosque.id) {
      throw new BadRequestException('Student does not belong to mosque');
    }
    return this.usersRepo.save({
      fullName: payload.fullName,
      email: payload.email,
      passwordHash,
      role: payload.role,
      mosque: circle?.mosque ?? linkedStudent?.mosque ?? mosque,
      circle: payload.role === UserRole.STUDENT ? (circle ?? null) : null,
      linkedStudentId:
        payload.role === UserRole.PARENT
          ? (payload.linkedStudentId ?? null)
          : null,
      currentPage:
        payload.role === UserRole.STUDENT ? (circle?.startPage ?? null) : null,
    });
  }

  private async getManageableAccount(requester: User, accountId: number) {
    const account = await this.usersRepo.findOne({
      where: { id: accountId },
      relations: ['mosque', 'circle'],
    });
    if (!account) throw new NotFoundException('Account not found');
    if (account.role === UserRole.GENERAL_MANAGER) {
      throw new BadRequestException('Cannot manage general manager');
    }
    if (requester.role === UserRole.GENERAL_MANAGER) {
      return account;
    }
    if (requester.role !== UserRole.MOSQUE_MANAGER) {
      throw new BadRequestException('Access denied');
    }
    if (account.mosque?.id !== requester.mosque?.id) {
      throw new BadRequestException('Access denied');
    }
    if (account.role === UserRole.MOSQUE_MANAGER) {
      throw new BadRequestException('Cannot manage mosque manager');
    }
    return account;
  }

  async createAccountByRequester(
    requester: User,
    payload: {
      fullName: string;
      email: string;
      password: string;
      role: UserRole;
      mosqueId?: number;
      circleId?: number;
      linkedStudentId?: number;
    },
  ) {
    if (requester.role === UserRole.GENERAL_MANAGER) {
      return this.createAccount(payload);
    }
    if (requester.role !== UserRole.MOSQUE_MANAGER) {
      throw new BadRequestException('Access denied');
    }
    const scopedPayload = {
      ...payload,
      mosqueId: requester.mosque?.id ?? undefined,
    };
    if (payload.role === UserRole.GENERAL_MANAGER) {
      throw new BadRequestException('Cannot create general manager');
    }
    if (payload.role === UserRole.MOSQUE_MANAGER) {
      throw new BadRequestException('Cannot create mosque manager');
    }
    return this.createAccount(scopedPayload);
  }

  async getSupervisorStudents(supervisorId: number) {
    const circles = await this.circlesRepo.find({
      where: { supervisor: { id: supervisorId } },
      relations: ['users'],
      order: { levelOrder: 'ASC' },
    });
    const ids = circles.map((circle) => circle.id);
    if (!ids.length) return [];
    const students = await this.usersRepo.find({
      where: ids.map((id) => ({ role: UserRole.STUDENT, circle: { id } })),
      relations: ['circle'],
      order: { fullName: 'ASC' },
    });
    return students.map((student) => this.decorateStudentProgress(student));
  }

  async listAssignableSupervisors(requester: User) {
    const where =
      requester.role === UserRole.GENERAL_MANAGER
        ? { role: UserRole.SUPERVISOR }
        : { role: UserRole.SUPERVISOR, mosque: { id: requester.mosque?.id } };
    return this.usersRepo.find({ where, order: { fullName: 'ASC' } });
  }

  async createCircle(
    requester: User,
    name: string,
    levelOrder: number,
    startPage: number,
    endPage: number,
    supervisorId: number | undefined,
    mosqueId?: number,
  ) {
    if (startPage > endPage)
      throw new BadRequestException('startPage must be <= endPage');
    const mosque =
      requester.role === UserRole.GENERAL_MANAGER
        ? await this.mustGetMosque(mosqueId ?? 0)
        : requester.mosque;
    if (!mosque) throw new BadRequestException('Mosque is required');
    const supervisor = supervisorId
      ? await this.usersRepo.findOne({
          where: {
            id: supervisorId,
            role: UserRole.SUPERVISOR,
            mosque: { id: mosque.id },
          },
        })
      : null;
    if (supervisorId && !supervisor)
      throw new NotFoundException('Supervisor not found');
    return this.circlesRepo.save({
      name,
      levelOrder,
      startPage,
      endPage,
      mosque,
      supervisor,
    });
  }

  async updateCircle(
    requester: User,
    circleId: number,
    data: {
      name: string;
      levelOrder: number;
      startPage: number;
      endPage: number;
      supervisorId?: number | null;
    },
  ) {
    const circle = await this.circlesRepo.findOne({
      where: { id: circleId },
      relations: ['mosque'],
    });
    if (!circle) throw new NotFoundException('Circle not found');
    if (
      requester.role !== UserRole.GENERAL_MANAGER &&
      circle.mosque?.id !== requester.mosque?.id
    ) {
      throw new BadRequestException('Access denied');
    }
    let supervisor: User | null = null;
    if (data.supervisorId) {
      supervisor = await this.usersRepo.findOne({
        where: {
          id: data.supervisorId,
          role: UserRole.SUPERVISOR,
          mosque: { id: circle.mosque?.id },
        },
      });
      if (!supervisor) throw new NotFoundException('Supervisor not found');
    }
    Object.assign(circle, { ...data, supervisor });
    return this.circlesRepo.save(circle);
  }

  async deleteCircle(requester: User, circleId: number) {
    const circle = await this.circlesRepo.findOne({
      where: { id: circleId },
      relations: ['users', 'mosque'],
    });
    if (!circle) throw new NotFoundException('Circle not found');
    if (
      requester.role !== UserRole.GENERAL_MANAGER &&
      circle.mosque?.id !== requester.mosque?.id
    ) {
      throw new BadRequestException('Access denied');
    }
    if (circle.users.some((user) => user.role === UserRole.STUDENT)) {
      throw new BadRequestException('Cannot delete circle with students');
    }
    await this.circlesRepo.delete({ id: circleId });
    return { message: 'deleted' };
  }

  async listCircleDetails(requester: User) {
    const where =
      requester.role === UserRole.GENERAL_MANAGER
        ? {}
        : { mosque: { id: requester.mosque?.id } };
    const circles = await this.circlesRepo.find({
      where,
      relations: ['users'],
      order: { levelOrder: 'ASC' },
    });
    return circles.map((circle) => ({
      ...circle,
      studentsCount: circle.users.filter(
        (user) => user.role === UserRole.STUDENT,
      ).length,
    }));
  }

  async findStudents(requester: User, query?: string) {
    const scope =
      requester.role === UserRole.GENERAL_MANAGER
        ? {}
        : { mosque: { id: requester.mosque?.id } };
    if (!query) {
      const students = await this.usersRepo.find({
        where: { role: UserRole.STUDENT, ...scope },
        relations: ['circle'],
        order: { fullName: 'ASC' },
      });
      return students.map((student) => this.decorateStudentProgress(student));
    }
    const asNumber = Number(query);
    const matchesNumber =
      Number.isFinite(asNumber) && String(asNumber) === query.trim();
    const students = await this.usersRepo.find({
      where: matchesNumber
        ? [{ id: asNumber, role: UserRole.STUDENT, ...scope }]
        : [
            { role: UserRole.STUDENT, fullName: ILike(`%${query}%`), ...scope },
            { role: UserRole.STUDENT, email: ILike(`%${query}%`), ...scope },
          ],
      relations: ['circle'],
      order: { fullName: 'ASC' },
    });
    return students.map((student) => this.decorateStudentProgress(student));
  }

  async listManageableAccounts(requester: User) {
    const where =
      requester.role === UserRole.GENERAL_MANAGER
        ? [
            { role: UserRole.STUDENT },
            { role: UserRole.PARENT },
            { role: UserRole.SUPERVISOR },
            { role: UserRole.MOSQUE_MANAGER },
          ]
        : [
            { role: UserRole.STUDENT, mosque: { id: requester.mosque?.id } },
            { role: UserRole.PARENT, mosque: { id: requester.mosque?.id } },
            { role: UserRole.SUPERVISOR, mosque: { id: requester.mosque?.id } },
          ];
    return this.usersRepo.find({
      where,
      relations: ['mosque', 'circle'],
      order: { role: 'ASC', fullName: 'ASC' },
    });
  }

  async updateAccountByRequester(
    requester: User,
    accountId: number,
    payload: {
      fullName: string;
      email: string;
      password?: string;
      role: UserRole;
      mosqueId?: number;
      circleId?: number;
      linkedStudentId?: number;
    },
  ) {
    const account = await this.getManageableAccount(requester, accountId);
    if (account.role !== payload.role) {
      throw new BadRequestException('Changing account role is not allowed');
    }
    const existingByEmail = await this.usersRepo.findOne({
      where: { email: payload.email },
    });
    if (existingByEmail && existingByEmail.id !== account.id) {
      throw new BadRequestException('Email already in use');
    }

    let mosque = account.mosque ?? null;
    let circle = account.circle ?? null;
    let linkedStudentId =
      payload.role === UserRole.PARENT
        ? (payload.linkedStudentId ?? account.linkedStudentId)
        : null;

    if (payload.role === UserRole.MOSQUE_MANAGER || payload.role === UserRole.SUPERVISOR) {
      const scopedMosqueId =
        requester.role === UserRole.GENERAL_MANAGER
          ? payload.mosqueId
          : requester.mosque?.id;
      mosque = scopedMosqueId ? await this.mustGetMosque(scopedMosqueId) : null;
      circle = null;
    }

    if (payload.role === UserRole.STUDENT) {
      const previousCircleId = account.circle?.id ?? null;
      const scopedCircleId = payload.circleId ?? account.circle?.id;
      if (!scopedCircleId) {
        throw new BadRequestException('Student account requires a circle');
      }
      circle = await this.circlesRepo.findOne({
        where: { id: scopedCircleId },
        relations: ['mosque'],
      });
      if (!circle) throw new NotFoundException('Circle not found');
      if (
        requester.role !== UserRole.GENERAL_MANAGER &&
        circle.mosque?.id !== requester.mosque?.id
      ) {
        throw new BadRequestException('Access denied');
      }
      mosque = circle.mosque ?? null;
      if (previousCircleId !== circle.id) {
        account.currentPage = circle.startPage;
      }
    }

    if (payload.role === UserRole.PARENT) {
      if (!linkedStudentId) {
        throw new BadRequestException('Parent account requires a linked student');
      }
      const linkedStudent = await this.getManageableAccount(requester, linkedStudentId);
      if (linkedStudent.role !== UserRole.STUDENT) {
        throw new BadRequestException('Linked account must be a student');
      }
      mosque = linkedStudent.mosque ?? null;
      circle = null;
      linkedStudentId = linkedStudent.id;
    }

    account.fullName = payload.fullName;
    account.email = payload.email;
    account.mosque = mosque;
    account.circle = payload.role === UserRole.STUDENT ? circle : null;
    account.linkedStudentId = linkedStudentId;
    if (payload.role === UserRole.STUDENT && circle && !account.currentPage) {
      account.currentPage = circle.startPage;
    }
    if (payload.password?.trim()) {
      account.passwordHash = await bcrypt.hash(payload.password.trim(), 10);
    }
    return this.usersRepo.save(account);
  }

  async deleteAccountByRequester(requester: User, accountId: number) {
    const account = await this.getManageableAccount(requester, accountId);
    if (account.role === UserRole.STUDENT) {
      return this.removeStudent(requester, account.id);
    }
    if (account.role === UserRole.PARENT) {
      await this.usersRepo.delete({ id: account.id, role: UserRole.PARENT });
      return { message: 'deleted' };
    }
    if (account.role === UserRole.SUPERVISOR) {
      await this.circlesRepo
        .createQueryBuilder()
        .update()
        .set({ supervisor: null })
        .where('"supervisorId" = :accountId', { accountId })
        .execute();
      await this.usersRepo.delete({ id: account.id, role: UserRole.SUPERVISOR });
      return { message: 'deleted' };
    }
    if (account.role === UserRole.MOSQUE_MANAGER) {
      await this.usersRepo.delete({ id: account.id, role: UserRole.MOSQUE_MANAGER });
      return { message: 'deleted' };
    }
    throw new BadRequestException('Unsupported account type');
  }

  async evaluatePage(
    evaluatorId: number,
    studentId: number,
    pageNumber: number,
    rating: PageRating,
    note?: string,
  ) {
    const evaluator = await this.usersRepo.findOne({
      where: { id: evaluatorId },
      relations: ['mosque'],
    });
    const student = await this.usersRepo.findOne({
      where: { id: studentId, role: UserRole.STUDENT },
      relations: ['circle', 'mosque'],
    });
    if (!evaluator || !student) throw new NotFoundException('User not found');
    if (evaluator.role === UserRole.SUPERVISOR) {
      const circle = await this.circlesRepo.findOne({
        where: { id: student.circle?.id },
        relations: ['supervisor'],
      });
      if (!circle?.supervisor || circle.supervisor.id !== evaluatorId) {
        throw new BadRequestException('Student is not in your circle');
      }
    }
    if (!student.circle) {
      throw new BadRequestException('Student is not assigned to a circle');
    }
    const expectedPage = student.currentPage ?? student.circle.startPage;
    if (pageNumber !== expectedPage) {
      throw new BadRequestException(
        `You must evaluate page ${expectedPage} before moving on`,
      );
    }
    if (
      pageNumber < student.circle.startPage ||
      pageNumber > student.circle.endPage
    ) {
      throw new BadRequestException('Page is outside the student circle range');
    }
    student.currentPage =
      rating === PageRating.REPEAT
        ? pageNumber
        : Math.min(pageNumber + 1, student.circle.endPage);
    await this.usersRepo.save(student);
    const evaluation = await this.evaluationsRepo.save({
      evaluator,
      student,
      pageNumber,
      rating,
      note: note?.trim() ? note.trim() : null,
    });
    return {
      evaluation,
      studentProgress: this.decorateStudentProgress(student),
    };
  }

  async getStudentOverview(requester: User, studentId: number) {
    const student = await this.usersRepo.findOne({
      where: { id: studentId, role: UserRole.STUDENT },
      relations: ['circle', 'mosque'],
    });
    if (!student) throw new NotFoundException('Student not found');
    if (
      requester.role !== UserRole.GENERAL_MANAGER &&
      student.mosque?.id !== requester.mosque?.id
    ) {
      throw new BadRequestException('Access denied');
    }
    if (requester.role === UserRole.SUPERVISOR) {
      const circle = await this.circlesRepo.findOne({
        where: { id: student.circle?.id },
        relations: ['supervisor'],
      });
      if (!circle?.supervisor || circle.supervisor.id !== requester.id) {
        throw new BadRequestException('Access denied');
      }
    }
    const evaluations = await this.evaluationsRepo.find({
      where: { student: { id: studentId } },
      order: { id: 'DESC' },
      take: 20,
    });
    const lastExam = await this.examResultsRepo.findOne({
      where: { student: { id: studentId } },
      order: { id: 'DESC' },
    });
    return {
      student: this.decorateStudentProgress(student),
      evaluations,
      lastExam,
    };
  }

  async removeStudent(requester: User, studentId: number) {
    const student = await this.usersRepo.findOne({
      where: { id: studentId, role: UserRole.STUDENT },
      relations: ['mosque'],
    });
    if (!student) return { message: 'deleted' };
    if (
      requester.role !== UserRole.GENERAL_MANAGER &&
      student.mosque?.id !== requester.mosque?.id
    ) {
      throw new BadRequestException('Access denied');
    }
    await this.examResultsRepo
      .createQueryBuilder()
      .delete()
      .where('"studentId" = :studentId', { studentId })
      .execute();
    await this.examRequestsRepo
      .createQueryBuilder()
      .delete()
      .where('"studentId" = :studentId', { studentId })
      .execute();
    await this.evaluationsRepo
      .createQueryBuilder()
      .delete()
      .where('"studentId" = :studentId', { studentId })
      .execute();
    await this.usersRepo.update({ linkedStudentId: studentId }, { linkedStudentId: null });
    await this.usersRepo.delete({ id: studentId, role: UserRole.STUDENT });
    return { message: 'deleted' };
  }

  async requestExam(studentId: number, managerId: number) {
    const manager = await this.resolveScope(managerId);
    const student = await this.usersRepo.findOne({
      where: { id: studentId, role: UserRole.STUDENT },
      relations: ['mosque'],
    });
    if (!student) throw new NotFoundException('Student not found');
    if (
      manager.role !== UserRole.GENERAL_MANAGER &&
      student.mosque?.id !== manager.mosque?.id
    ) {
      throw new BadRequestException('Access denied');
    }
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    const requestToday = await this.examRequestsRepo.findOne({
      where: {
        student: { id: studentId },
        createdAt: Between(startOfDay, endOfDay),
      },
    });
    if (requestToday) {
      throw new BadRequestException(
        'Student already has an exam request today',
      );
    }
    return this.examRequestsRepo.save({
      student,
      requestedByManager: manager,
      status: ExamRequestStatus.PENDING,
    });
  }

  pendingExamRequests() {
    return this.examRequestsRepo.find({
      where: { status: ExamRequestStatus.PENDING },
      order: { id: 'DESC' },
    });
  }

  async submitExam(
    requestId: number,
    score: number,
    generalManagerId: number,
    nextCircleId?: number,
  ) {
    if (score < 0 || score > 100)
      throw new BadRequestException('Score must be 0..100');
    const gm = await this.usersRepo.findOne({
      where: { id: generalManagerId, role: UserRole.GENERAL_MANAGER },
    });
    if (!gm) throw new NotFoundException('Manager not found');
    const request = await this.examRequestsRepo.findOne({
      where: { id: requestId },
      relations: ['student', 'student.circle', 'student.mosque'],
    });
    if (!request) throw new NotFoundException('Request not found');
    request.status =
      score >= 70 ? ExamRequestStatus.APPROVED : ExamRequestStatus.REJECTED;
    await this.examRequestsRepo.save(request);
    if (score >= 70 && request.student.circle) {
      const nextCircle = nextCircleId
        ? await this.circlesRepo.findOne({
            where: { id: nextCircleId },
            relations: ['mosque'],
          })
        : await this.circlesRepo.findOne({
            where: {
              mosque: { id: request.student.mosque?.id },
              levelOrder: request.student.circle.levelOrder + 1,
            },
            relations: ['mosque'],
          });
      if (nextCircle) {
        if (nextCircle.mosque?.id !== request.student.mosque?.id) {
          throw new BadRequestException('Circle does not belong to student mosque');
        }
        request.student.circle = nextCircle;
        request.student.currentPage = nextCircle.startPage;
        await this.usersRepo.save(request.student);
      }
    }
    return this.examResultsRepo.save({
      student: request.student,
      reviewedByGeneralManager: gm,
      score,
      passed: score >= 70,
    });
  }

  async parentDashboard(parentUserId: number) {
    const parent = await this.usersRepo.findOne({
      where: { id: parentUserId },
    });
    if (!parent?.linkedStudentId)
      throw new NotFoundException('No linked student');
    return this.getStudentOverview(parent, parent.linkedStudentId);
  }
}
