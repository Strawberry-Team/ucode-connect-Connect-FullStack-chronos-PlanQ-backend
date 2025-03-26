// src/calendar-member/guards/own.calendar-member.guard.ts
import {Injectable, CanActivate, ExecutionContext, ForbiddenException} from '@nestjs/common';
import {CalendarMembersRepository} from '../calendar-members.repository';

@Injectable()
export class OwnCalendarMemberGuard implements CanActivate {
    constructor(
        private readonly usersCalendarsRepository: CalendarMembersRepository
    ) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.userId;
        const userIdInParam = parseInt(request.params.id, 10);
        const calendarId = parseInt(request.params.calendarId, 10);

        const calendarMemberRecord = await this.usersCalendarsRepository.findByUserAndCalendar(
            userIdInParam,
            calendarId
        );

        if (!calendarMemberRecord) {
            throw new ForbiddenException('User-calendar record not found');
        }

        if (userId === userIdInParam) {
            return true;
        }

        throw new ForbiddenException('You can only access your own data');
    }
}