import {
    Controller,
    Patch,
    Delete,
    Param,
    Body,
    Req,
    UseGuards, Get,
    Post,
} from '@nestjs/common';
import {BaseCrudController} from '../common/controller/base-crud.controller';
import {Calendar} from './entity/calendar.entity';
import {CreateCalendarDto} from './dto/create-calendar.dto';
import {UpdateCalendarDto} from './dto/update-calendar.dto';
import {CalendarsService} from './calendars.service';
import {RequestWithUser} from "../common/types/request.types";
import {CalendarOwnerGuard, OnlyCreator} from "./guards/own.calendar.guard";
import {CalendarMemberGuard} from "../calendar-member/guards/calendar.member.guard";
import {CalendarMainGuard} from './guards/main.calendar.guard';

@Controller('calendars')
export class CalendarsController extends BaseCrudController<
    Calendar,
    CreateCalendarDto,
    UpdateCalendarDto
> {
    constructor(private readonly calendarsService: CalendarsService) {
        super();
    }

    protected async findById(id: number, req: RequestWithUser): Promise<Calendar> {
        return await this.calendarsService.getCalendarById(id);
    }

    protected async createEntity(dto: CreateCalendarDto, req: RequestWithUser): Promise<Calendar> {
        return await this.calendarsService.createCalendar(req.user.userId, dto);
    }

    protected async updateEntity(
        id: number,
        dto: UpdateCalendarDto,
        req: RequestWithUser
    ): Promise<Calendar> {
        return await this.calendarsService.updateCalendar(id, dto);
    }

    protected async deleteEntity(id: number, req: RequestWithUser): Promise<void> {
        return await this.calendarsService.deleteCalendar(req.user.userId, id);
    }

    @Get('holidays')
    async getCountryHolidays(@Req() req: RequestWithUser): Promise<any> {
        ;
        //TODO: added another language support(apart from English)
        return await this.calendarsService.getCountryHolidays(req.user.userId);
    }

    @UseGuards(CalendarMemberGuard)
    @Get(':id')
    async getById(@Param('id') id: number, @Req() req: RequestWithUser): Promise<Calendar> {
        return await super.getById(id, req);
    }

    @Post()
    async create(@Body() dto: CreateCalendarDto, @Req() req: RequestWithUser): Promise<Calendar> {
        return await super.create(dto, req);
    }


    @UseGuards(CalendarOwnerGuard)
    @UseGuards(CalendarMainGuard)
    @OnlyCreator(false)
    @Patch(':id')
    async update(
        @Param('id') id: number,
        @Body() dto: UpdateCalendarDto,
        @Req() req: RequestWithUser
    ): Promise<Calendar> {
        return await super.update(id, dto, req);
    }

    @UseGuards(CalendarOwnerGuard)
    @UseGuards(CalendarMainGuard)
    @OnlyCreator(true)
    @Delete(':id')
    async delete(@Param('id') id: number, @Req() req: RequestWithUser): Promise<void> {
        return await super.delete(id, req);
    }
}
