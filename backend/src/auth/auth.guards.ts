import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { UserRole } from '../common/enums';

export const ROLE_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLE_KEY, roles);

type AuthenticatedRequest = Request & {
  user?: unknown;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }
    const token = header.split(' ')[1];
    try {
      const payload = this.jwtService.verify<
        Record<string, unknown> & { role?: UserRole }
      >(token);
      (
        request as Request & {
          user: Record<string, unknown> & { role?: UserRole };
        }
      ).user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles || roles.length === 0) {
      return true;
    }
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userRole = (request.user as { role?: UserRole } | undefined)?.role;
    return !!userRole && roles.includes(userRole);
  }
}
