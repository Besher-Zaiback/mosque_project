import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { SupervisorController } from './supervisor.controller';

@Module({
  imports: [CoreModule],
  controllers: [SupervisorController],
})
export class SupervisorModule {}
