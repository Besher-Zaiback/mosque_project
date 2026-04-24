import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { ParentController } from './parent.controller';

@Module({
  imports: [CoreModule],
  controllers: [ParentController],
})
export class ParentModule {}
