// src/users-calendars/users-calendars.controller.ts
import {
    Controller,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Req,
    UseGuards,
    UsePipes,
    ValidationPipe,
    Get,
    NotFoundException
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/auth.jwt-guards';
import { UsersCalendarsService } from './users-calendars.service';
import { AddUserToCalendarDto } from './dto/add-user-to-calendar.dto';
import { UpdateUserInCalendarDto } from './dto/update-user-in-calendar.dto';
import { UserCalendar } from './entity/user-calendar.entity';
import { RequestWithUser } from "../common/types/request.types";
import { BaseCrudController } from '../common/controller/base-crud.controller';
import {CalendarOwnerGuard, OnlyDirectOwner} from "../calendar/guards/own.calendar.guard";
import {OwnUserCalendarGuard} from "./guards/own.user-calendar.guard";
import {UpdateUserCalendarGuard} from "./guards/update.user-calendar.guard";
import { CalendarParticipantGuard } from './guards/user-calendar-role.guard';

@Controller('calendars/:calendarId/users')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class UsersCalendarsController extends BaseCrudController<
    UserCalendar,
    AddUserToCalendarDto,
    UpdateUserInCalendarDto
> {
    constructor(private readonly usersCalendarsService: UsersCalendarsService) {
        super();
    }

    protected async findById(id: number, req: RequestWithUser): Promise<UserCalendar> {
        const calendarId = parseInt(req.params.calendarId, 10);
        return await this.usersCalendarsService.getUserCalendar(id, calendarId);
    }

    protected async createEntity(dto: AddUserToCalendarDto, req: RequestWithUser): Promise<UserCalendar> {
        const calendarId = parseInt(req.params.calendarId, 10);
        return await this.usersCalendarsService.addUserToCalendar(calendarId, req.user.userId, dto);
    }

    protected async updateEntity(
        id: number,
        dto: UpdateUserInCalendarDto,
        req: RequestWithUser
    ): Promise<UserCalendar> {
        const calendarId = parseInt(req.params.calendarId, 10);
        return await this.usersCalendarsService.updateUserInCalendar(
            calendarId,
            id,
            req.user.userId,
            dto
        );
    }

    protected async deleteEntity(id: number, req: RequestWithUser): Promise<void> {
        const calendarId = parseInt(req.params.calendarId, 10);
        return await this.usersCalendarsService.removeUserFromCalendar(
            calendarId,
            id,
            req.user.userId
        );
    }

    @UseGuards(CalendarParticipantGuard)
    @Get() //TODO: add guard только участники календаря могут видеть список участников
    async getCalendarUsers(@Param('calendarId') calendarId: number, @Req() req: RequestWithUser): Promise<UserCalendar[]> {
        return await this.usersCalendarsService.getCalendarUsers(calendarId, req.user.userId);
    }

    @UseGuards(OwnUserCalendarGuard)
    @Get(':id')
    async getById(@Param('id') id: number, @Req() req: RequestWithUser): Promise<UserCalendar> {
        return super.getById(id, req);
    }

    @UseGuards(CalendarOwnerGuard)
    @OnlyDirectOwner(false)
    @Post()
    async create(@Body() dto: AddUserToCalendarDto, @Req() req: RequestWithUser): Promise<UserCalendar> {
        return super.create(dto, req);
    }

    @UseGuards(UpdateUserCalendarGuard)
    @Patch(':id')
    async update(
        @Param('id') id: number,
        @Body() dto: UpdateUserInCalendarDto,
        @Req() req: RequestWithUser
    ): Promise<UserCalendar> {
        return super.update(id, dto, req);
    }

    @UseGuards(CalendarOwnerGuard)
    @OnlyDirectOwner(false)
    @Delete(':id')
    async delete(@Param('id') id: number, @Req() req: RequestWithUser): Promise<void> {
        return super.delete(id, req);
    }
}