import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { RequestUser } from '../common/request-user';
import { User } from '../entities';
import { JwtAuthGuard } from './auth.guards';
import { LoginDto } from './dto';

@Controller()
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  @Post('auth/login')
  async login(@Body() body: LoginDto) {
    const user = await this.usersRepo.findOne({
      where: { email: body.email },
      relations: ['circle', 'mosque'],
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const token = this.jwtService.sign({
      sub: user.id,
      role: user.role,
      fullName: user.fullName,
    });
    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        circle: user.circle,
        mosque: user.mosque,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: { user: RequestUser }) {
    return this.usersRepo.findOne({
      where: { id: req.user.sub },
      relations: ['circle', 'mosque'],
    });
  }
}
