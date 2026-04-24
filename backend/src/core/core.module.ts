import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Circle,
  ExamRequest,
  ExamResult,
  Mosque,
  PageEvaluation,
  User,
} from '../entities';
import { QuranService } from './quran.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Circle,
      Mosque,
      PageEvaluation,
      ExamRequest,
      ExamResult,
    ]),
  ],
  providers: [QuranService],
  exports: [QuranService, TypeOrmModule],
})
export class CoreModule {}
