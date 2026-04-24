import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { ManagerController } from './manager.controller';

@Module({
  imports: [CoreModule],
  controllers: [ManagerController],
})
export class ManagerModule {}
