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

export const ONLY_CREATOR = 'onlyCreator';
export const OnlyCreator = (check: boolean) => SetMetadata(ONLY_CREATOR, check);

@Injectable()
export class CalendarOwnerGuard implements CanActivate {
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

        if (!user || isNaN(calendarId)) {
            throw new BadRequestException('calendarId must be a number');
        }

        const calendar = await this.calendarsService.getCalendarById(calendarId);
        if (!calendar) {
            throw new NotFoundException('Calendar not found');
        }

        const onlyCreator = this.reflector.getAllAndOverride<boolean>(
            ONLY_CREATOR,
            [context.getHandler(), context.getClass()]
        );

        if (calendar.creatorId == userId) {
            return true;
        }

        if (onlyCreator) {
            throw new ForbiddenException('Only the direct creator can perform this action');
        }

        const userCalendar = await this.usersCalendarsRepository.findByUserAndCalendar(userId, calendarId);
        if (userCalendar && userCalendar.role === CalendarRole.OWNER) {
            return true;
        }

        throw new ForbiddenException('You do not have permission to modify this calendar');
    }
}