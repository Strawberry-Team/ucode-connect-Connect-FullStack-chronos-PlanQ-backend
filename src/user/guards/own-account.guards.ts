import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OwnAccountGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const requestUserId: number = request.params.id;

        console.log("user.userId: ", user.userId);
        console.log("requestUserId: ", Number(requestUserId));

        if (!user || !requestUserId) {
            throw new ForbiddenException('Access denied');
        }

        if (user.userId != requestUserId) {
            throw new ForbiddenException('You can only access your own account');
        }

        return true;
    }
}

