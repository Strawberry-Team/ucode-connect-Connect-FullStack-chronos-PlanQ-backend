import {BadRequestException, forwardRef, Inject, Injectable, NotFoundException} from '@nestjs/common';
import {CalendarsRepository} from './calendars.repository';
import {UsersCalendarsRepository} from '../user-calendar/users-calendars.repository';
import {CreateCalendarDto} from './dto/create-calendar.dto';
import {UpdateCalendarDto} from './dto/update-calendar.dto';
import {Calendar} from './entity/calendar.entity';
import {CalendarRole} from '../user-calendar/entity/user-calendar.entity';
import {ConfigService} from "@nestjs/config";
import {CalendarApiService} from "./calendar-api.service";
import {UsersService} from "../user/users.service";

@Injectable()
export class CalendarsService {
    constructor(
        private readonly calendarsRepository: CalendarsRepository,
        @Inject(forwardRef(() => UsersCalendarsRepository))
        private readonly usersCalendarsRepository: UsersCalendarsRepository,
        private readonly configService: ConfigService,
        private readonly calendarApiService: CalendarApiService,
        @Inject(forwardRef(() => UsersService))
        private readonly usersService: UsersService) {
    }

    async createDefaultCalendars(userId: number): Promise<Calendar[]> {
        const defaultMainCalendar = await this.calendarsRepository.createCalendar({
            creatorId: userId,
            name: String(this.configService.get<string>('calendar.defaultMain.name')),
            description: String(this.configService.get<string>('calendar.defaultHoliday.description'))
        });

        const defaultHolidayCalendar = await this.calendarsRepository.createCalendar({
            creatorId: userId,
            name: String(this.configService.get<string>('calendar.defaultHoliday.name')),
            description: String(this.configService.get<string>('calendar.defaultHoliday.description'))
        });

        await this.usersCalendarsRepository.createUserCalendar({
            userId,
            calendarId: defaultMainCalendar.id,
            isMain: true,
            role: CalendarRole.OWNER,
            color: String(this.configService.get<string>('calendar.defaultMain.color')),
            isConfirmed: true
        });

        await this.usersCalendarsRepository.createUserCalendar({
            userId,
            calendarId: defaultHolidayCalendar.id,
            isMain: true,
            role: CalendarRole.OWNER,
            color: String(this.configService.get<string>('calendar.defaultHoliday.color')),
            isConfirmed: true
        });

        return [defaultMainCalendar, defaultHolidayCalendar];
    }

    async getCalendarById(id: number): Promise<Calendar> {
        const calendar = await this.calendarsRepository.findById(id);
        if (!calendar) {
            throw new NotFoundException('Calendar not found');
        }

        return calendar;
    }

    async createCalendar(userId: number, dto: CreateCalendarDto): Promise<Calendar> {
        const calendar = await this.calendarsRepository.createCalendar({
            creatorId: userId,
            name: dto.name,
            ...(dto.description !== undefined ? {description: dto.description} : {})
        });

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
    }

    async deleteCalendar(userId: number, calendarId: number): Promise<void> {
        const userCalendar = await this.usersCalendarsRepository.findByUserAndCalendar(userId, calendarId);

        if (!userCalendar) {
            throw new NotFoundException('Calendar not found');
        }

        await this.calendarsRepository.deleteCalendar(calendarId);
    }

    async getCountryHolidays(userId: number): Promise<any> {
        const user = await this.usersService.getUserByIdWithoutPassword(userId);
        return await this.calendarApiService.getCountryHolidays(user.countryCode);
    }
}
