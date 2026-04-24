import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [CoreModule],
  controllers: [AuthController],
})
export class AuthFeatureModule {}
