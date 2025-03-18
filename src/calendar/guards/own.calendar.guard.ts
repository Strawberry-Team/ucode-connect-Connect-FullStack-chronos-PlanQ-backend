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

// A clear flag name - when true, ONLY the direct owner can access
export const ONLY_DIRECT_OWNER = 'onlyDirectOwner';
export const OnlyDirectOwner = (check: boolean) => SetMetadata(ONLY_DIRECT_OWNER, check);

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
        const calendarId: number = parseInt(request.params.id, 10);
        const userId = user?.userId;

        if (!user || isNaN(calendarId)) {
            throw new BadRequestException('calendarId must be a number');
        }

        // Get the calendar to check ownership
        const calendar = await this.calendarsService.getCalendarById(calendarId);
        if (!calendar) {
            throw new NotFoundException('Calendar not found');
        }

        // Check if we should only allow direct owner
        const onlyDirectOwner = this.reflector.getAllAndOverride<boolean>(
            ONLY_DIRECT_OWNER,
            [context.getHandler(), context.getClass()]
        );

        // Direct ownership check
        if (calendar.ownerId == userId) {
            return true; // User is direct owner
        }

        // If we only want the direct owner, and they're not, deny access
        if (onlyDirectOwner) {
            throw new ForbiddenException('Only the direct owner can perform this action');
        }

        // Otherwise check for role-based ownership
        const userCalendar = await this.usersCalendarsRepository.findByUserAndCalendar(userId, calendarId);
        if (userCalendar && userCalendar.role === CalendarRole.OWNER) {
            return true; // User has OWNER role
        }

        throw new ForbiddenException('You do not have permission to modify this calendar');
    }
}