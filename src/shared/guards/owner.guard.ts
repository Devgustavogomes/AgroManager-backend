import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { OWNER_SERVICE_KEY } from 'src/shared/decorators/owner.decorator';
import { AuthenticatedRequest } from 'src/shared/types/authenticatedRequest';
import { Role } from 'src/shared/types/role';

interface Service {
  isOwner(idProducer: string, idService: string): Promise<boolean>;
}

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly moduleRef: ModuleRef,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const producer = request.producer;

    if (!producer) {
      throw new UnauthorizedException();
    }

    if (producer.role === Role.ADMIN) {
      return true;
    }

    const serviceToken = this.reflector.getAllAndOverride<{
      service: any;
      paramKey?: string;
    }>(OWNER_SERVICE_KEY, [context.getHandler(), context.getClass()]);

    if (!serviceToken) {
      return true;
    }

    const service: Service = await this.moduleRef.get(serviceToken.service, {
      strict: false,
    });

    const resourceId = serviceToken.paramKey
      ? request.params[serviceToken.paramKey]
      : request.params.id;

    const owner = await service.isOwner(producer.id, resourceId);

    if (!owner) {
      throw new ForbiddenException('You do not own this resource.');
    }

    return true;
  }
}
