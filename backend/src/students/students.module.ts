import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { StudentsController } from './students.controller';

@Module({
  imports: [CoreModule],
  controllers: [StudentsController],
})
export class StudentsModule {}
