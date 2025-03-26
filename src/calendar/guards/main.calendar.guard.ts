// calendar/guards/main.calendar.guard.ts
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import {CalendarsService} from '../calendars.service';
import {CalendarMembersRepository} from "../../calendar-member/calendar-members.repository";
import {CalendarType} from "../../calendar-member/entity/calendar-member.entity";

@Injectable()
export class CalendarMainGuard implements CanActivate {
    constructor(
        private readonly calendarsService: CalendarsService,
        private readonly usersCalendarsRepository: CalendarMembersRepository,
    ) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const calendarId: number = parseInt(request.params.calendarId, 10) || parseInt(request.params.id, 10);
        const userId = user?.userId;

        if (!user) {
            throw new BadRequestException('User not found');
        }

        if (isNaN(calendarId)) {
            throw new BadRequestException('calendarId must be a number');
        }

        const calendar = await this.calendarsService.getCalendarById(calendarId);
        if (!calendar) {
            throw new NotFoundException('Calendar not found');
        }

        const calendarMember = await this.usersCalendarsRepository.findByUserAndCalendar(userId, calendarId);
        if (calendarMember && (calendarMember.calendarType === CalendarType.MAIN
            || calendarMember.calendarType === CalendarType.HOLIDAY)) {
            throw new ForbiddenException('You do not have permission to modify main or holiday calendar');
        }

        return true;
    }
}