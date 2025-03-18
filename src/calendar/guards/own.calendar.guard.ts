import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
    NotFoundException,
    BadRequestException
} from '@nestjs/common';
import { CalendarsService } from '../calendars.service';
import {UsersCalendarsRepository} from "../../user-calendar/users-calendars.repository";
import {CalendarRole} from "../../user-calendar/entity/user-calendar.entity";

@Injectable()
export class CalendarOwnerGuard implements CanActivate {
    constructor(
        private readonly calendarsService: CalendarsService,
        private readonly usersCalendarsRepository: UsersCalendarsRepository,
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

        // Проверяем, является ли пользователь владельцем календаря напрямую
        if (calendar.ownerId == userId) {
            return true; // Пользователь - владелец календаря, разрешаем доступ
        }

        // Если пользователь не является прямым владельцем,
        // проверяем, есть ли у него роль OWNER в таблице связей
        const userCalendar = await this.usersCalendarsRepository.findByUserAndCalendar(userId, calendarId);
        if (userCalendar && userCalendar.role === CalendarRole.OWNER) {
            return true; // Пользователь имеет роль OWNER в usersCalendars
        }

        // Если ни одно из условий не выполнилось, доступ запрещен
        throw new ForbiddenException('You do not have permission to modify this calendar');
    }
}