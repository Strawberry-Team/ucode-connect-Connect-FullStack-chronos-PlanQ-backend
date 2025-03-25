import {
    Injectable,
    CanActivate,
    ExecutionContext,
    NotFoundException,
} from '@nestjs/common';
import {CalendarMembersService} from '../calendar-members.service';

@Injectable()
export class CalendarMemberGuard implements CanActivate {
    constructor(
        private readonly usersCalendarsService: CalendarMembersService,
    ) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const calendarId: number = Number(request.params.calendarId) || Number(request.params.id);
        const userId: number = Number(request.user?.userId);

        if (!calendarId || !userId) {
            throw new NotFoundException('No calendar or user ID specified');
        }

        const calendarMember = await this.usersCalendarsService.getCalendarMember(userId, calendarId);

        if (!calendarMember || !calendarMember.isConfirmed) {
            throw new NotFoundException('The user does not have access to this calendar4');
        }

        return true;
    }
}
