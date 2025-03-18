import {Injectable, CanActivate, ExecutionContext, ForbiddenException} from '@nestjs/common';
import {UsersCalendarsRepository} from '../users-calendars.repository';

@Injectable()
export class OwnUserCalendarGuard implements CanActivate {
    constructor(
        private readonly usersCalendarsRepository: UsersCalendarsRepository
    ) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.userId;
        const userIdInParam = parseInt(request.params.id, 10);
        const calendarId = parseInt(request.params.calendarId, 10);

        const userCalendarRecord = await this.usersCalendarsRepository.findByUserAndCalendar(
            userIdInParam,
            calendarId
        );

        if (!userCalendarRecord) {
            throw new ForbiddenException('User-calendar record not found');
        }

        if (userId === userIdInParam) {
            return true;
        }

        throw new ForbiddenException('You can only access your own data');
    }
}