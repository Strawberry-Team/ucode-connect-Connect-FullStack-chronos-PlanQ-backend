import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
    NotFoundException,
    BadRequestException,
    SetMetadata
} from '@nestjs/common';
import { CalendarsService } from '../calendars.service';
import {UsersCalendarsRepository} from "../../user-calendar/users-calendars.repository";
import {CalendarRole} from "../../user-calendar/entity/user-calendar.entity";
import {Reflector} from "@nestjs/core";

@Injectable()
export class CalendarMainGuard implements CanActivate {
    constructor(
        private readonly calendarsService: CalendarsService, 
        private readonly usersCalendarsRepository: UsersCalendarsRepository,
        private readonly reflector: Reflector
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const calendarId: number = parseInt(request.params.calendarId, 10) || parseInt(request.params.id, 10) ;
        const userId = user?.userId;

        if (!user){
            throw new BadRequestException('User not found');
        }

        if (isNaN(calendarId)) {
            throw new BadRequestException('calendarId must be a number');
        }

        const calendar = await this.calendarsService.getCalendarById(calendarId);
        if (!calendar) {
            throw new NotFoundException('Calendar not found');
        }

        const userCalendar = await this.usersCalendarsRepository.findByUserAndCalendar(userId, calendarId);
        if (userCalendar && userCalendar.isMain === true) {
            throw new ForbiddenException('You do not have permission to modify main calendar');
        }

        return true;
    }
}