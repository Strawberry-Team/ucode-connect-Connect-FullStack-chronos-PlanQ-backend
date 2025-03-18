// src/calendars/calendars.service.ts
import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    Inject,
    forwardRef
} from '@nestjs/common';
import {CalendarsRepository} from './calendars.repository';
import {UsersCalendarsRepository} from '../user-calendar/users-calendars.repository';
import {CreateCalendarDto} from './dto/create-calendar.dto';
import {UpdateCalendarDto} from './dto/update-calendar.dto';
import {Calendar} from './entity/calendar.entity';
import {UserCalendar, CalendarRole} from '../user-calendar/entity/user-calendar.entity';
import {UsersService} from '../user/users.service';
import {plainToInstance} from "class-transformer";
import {SERIALIZATION_GROUPS, User} from "../user/entity/user.entity";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class CalendarsService {
    constructor(
        private readonly calendarsRepository: CalendarsRepository,
        @Inject(forwardRef(() => UsersCalendarsRepository))
        private readonly usersCalendarsRepository: UsersCalendarsRepository,
        private readonly configService: ConfigService
    ) {
    }

    async createDefaultCalendar(userId: number): Promise<Calendar> {
        // Create default calendar
        const defaultCalendar = await this.calendarsRepository.createCalendar({
            ownerId: userId,
            name: String(this.configService.get<string>('calendar.default.name')),
            description: String(this.configService.get<string>('calendar.default.description'))
        });

        // Add user to the calendar with main status
        await this.usersCalendarsRepository.createUserCalendar({
            userId,
            calendarId: defaultCalendar.id,
            isMain: true,
            role: CalendarRole.OWNER,
            color: String(this.configService.get<string>('calendar.default.color')),
            isConfirmed: true
        });

        return defaultCalendar;
    }

    async getCalendarById(id: number): Promise<Calendar> {
        const calendar = await this.calendarsRepository.findById(id);
        if (!calendar) {
            throw new NotFoundException('Calendar not found');
        }

        return calendar;
    }

    async createCalendar(userId: number, dto: CreateCalendarDto): Promise<Calendar> {
        // Create the calendar
        const calendar = await this.calendarsRepository.createCalendar({
            ownerId: userId,
            name: dto.name,
            ...(dto.description !== undefined ? {description: dto.description} : {})
        });

        // Add user to the calendar
        await this.usersCalendarsRepository.createUserCalendar({
            userId,
            calendarId: calendar.id,
            isMain: false,
            role: CalendarRole.OWNER,
            color: dto.color,
            isConfirmed: true
        });

        return calendar;
    }

    async updateCalendar(
        calendarId: number,
        dto: UpdateCalendarDto
    ): Promise<Calendar> {
        // Update calendar properties
        const updateData: Partial<Calendar> = {};
        if (dto.name !== undefined) {
            updateData.name = dto.name;
        }
        if (dto.description !== undefined) {
            updateData.description = dto.description;
        }

        const result = await this.calendarsRepository.updateCalendar(calendarId, updateData);

        if (!result) {
            throw new NotFoundException('Calendar not found');
        }

        return result;
        // // If color is provided, update it in the user-calendar relationship
        // if (dto.color !== undefined) {
        //     await this.usersCalendarsRepository.updateUserCalendarByUserAndCalendar(
        //         userId,
        //         calendarId,
        //         { color: dto.color }
        //     );
        // } //TODO: перенести в users-calendars.service.ts, тут обновление цвета нету
    }

    async deleteCalendar(userId: number, calendarId: number): Promise<void> {
        const userCalendar = await this.usersCalendarsRepository.findByUserAndCalendar(userId, calendarId);

        if (!userCalendar) {
            throw new NotFoundException('Calendar not found');
        }

        if (userCalendar.isMain) {
            throw new BadRequestException('Cannot delete your main calendar');
        }

        await this.calendarsRepository.deleteCalendar(calendarId);
    }
}
