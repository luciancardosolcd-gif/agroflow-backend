import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

export const Roles = (...roles: string[]) => {
  const decorator = (target: any, key?: string, descriptor?: any) => {
    Reflect.defineMetadata('roles', roles, descriptor?.value || target);
    return descriptor || target;
  };
  return decorator;
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) return true;
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) throw new ForbiddenException('Acesso negado');
    if (!roles.includes(user.perfil)) {
      throw new ForbiddenException('Você não tem permissão para realizar esta ação');
    }
    return true;
  }
}
