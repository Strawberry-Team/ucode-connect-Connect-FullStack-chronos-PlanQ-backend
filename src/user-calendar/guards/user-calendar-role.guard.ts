import {
    Injectable,
    CanActivate,
    ExecutionContext,
    NotFoundException,
} from '@nestjs/common';
import { UsersCalendarsService } from '../users-calendars.service';
import { CalendarRole } from '../entity/user-calendar.entity';

@Injectable()
export class CalendarParticipantGuard implements CanActivate {
    constructor(
        private readonly ca: UsersCalendarsService,
        private readonly usersCalendarsService: UsersCalendarsService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const calendarId = Number(request.params.calendarId);
        const userId = request.user?.userId;

        if (!calendarId || !userId) {
            throw new NotFoundException('No calendar or user ID specified');
        }

        const userCalendar = await this.usersCalendarsService.getUserCalendar(userId, calendarId);

        if (!userCalendar || !userCalendar.isConfirmed) {
            throw new NotFoundException('The user does not have access to this calendar');
        }

        return true;
    }
}
