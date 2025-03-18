import {
    Controller,
    Patch,
    Delete,
    Param,
    Body,
    Req,
    UseGuards, Get,
} from '@nestjs/common';
import {BaseCrudController} from '../common/controller/base-crud.controller';
import {Calendar} from './entity/calendar.entity';
import {CreateCalendarDto} from './dto/create-calendar.dto';
import {UpdateCalendarDto} from './dto/update-calendar.dto';
import {CalendarsService} from './calendars.service';
import {RequestWithUser} from "../common/types/request.types";
import {CalendarOwnerGuard, OnlyDirectOwner} from "./guards/own.calendar.guard";
import {CalendarParticipantGuard} from "../user-calendar/guards/calendar.participant.guard";

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

    @UseGuards(CalendarParticipantGuard)
    @Get(':id')
    async getById(@Param('id') id: number, @Req() req: RequestWithUser): Promise<Calendar> {
        return await this.findById(id, req);
    }

    // @Post()
    // async create(@Body() dto: CreateCalendarDto, @Req() req: RequestWithUser): Promise<Calendar> {
    //     return super.create(dto, req);
    // }
    //

    @UseGuards(CalendarOwnerGuard)
    @OnlyDirectOwner(false)
    @Patch(':id')
    async update(
        @Param('id') id: number,
        @Body() dto: UpdateCalendarDto,
        @Req() req: RequestWithUser
    ): Promise<Calendar> {
        return super.update(id, dto, req);
    }

    @UseGuards(CalendarOwnerGuard)
    @OnlyDirectOwner(true)
    @Delete(':id')
    async delete(@Param('id') id: number, @Req() req: RequestWithUser): Promise<void> {
        return super.delete(id, req);
    }
}
