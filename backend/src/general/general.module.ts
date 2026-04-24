import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { GeneralController } from './general.controller';

@Module({
  imports: [CoreModule],
  controllers: [GeneralController],
})
export class GeneralModule {}
