import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthFeatureModule } from './auth/auth.module';
import {
  Circle,
  ExamRequest,
  ExamResult,
  Mosque,
  PageEvaluation,
  User,
} from './entities';
import { GeneralModule } from './general/general.module';
import { HealthModule } from './health/health.module';
import { ManagerModule } from './manager/manager.module';
import { ParentModule } from './parent/parent.module';
import { StudentsModule } from './students/students.module';
import { SupervisorModule } from './supervisor/supervisor.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? '5432'),
      username: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_NAME ?? 'mosque_quran',
      entities: [User, Circle, Mosque, PageEvaluation, ExamRequest, ExamResult],
      synchronize: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? 'dev_secret_change_me',
      signOptions: { expiresIn: '7d' },
    }),
    HealthModule,
    AuthFeatureModule,
    SupervisorModule,
    StudentsModule,
    ManagerModule,
    GeneralModule,
    ParentModule,
  ],
})
export class AppModule {}
