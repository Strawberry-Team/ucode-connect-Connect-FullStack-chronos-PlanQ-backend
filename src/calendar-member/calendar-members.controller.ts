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
    BadRequestException
} from '@nestjs/common';
import {CalendarMembersService} from './calendar-members.service';
import {AddMemberToCalendarDto} from './dto/add-member-to-calendar.dto';
import {UpdateMemberInCalendarDto} from './dto/update-member-in-calendar.dto';
import {CalendarMember} from './entity/calendar-member.entity';
import {RequestWithUser} from "../common/types/request.types";
import {BaseCrudController} from '../common/controller/base-crud.controller';
import {CalendarOwnerGuard, OnlyCreator} from "../calendar/guards/own.calendar.guard";
import {UpdateCalendarMemberGuard} from "./guards/update.calendar-member.guard";
import {CalendarMemberGuard} from './guards/calendar.member.guard';
import {JwtConfirmCalendarGuard} from 'src/calendar/guards/jwt-confirm-calendar.guard';
import {Public} from '../common/decorators/public.decorator';
import {CalendarMemberRemovalGuard} from "./guards/calendar.member.removal.guard";
import {EventParticipation} from "../event-participation/entity/event-participation.entity";
import {EventParticipationsService} from "../event-participation/event-participations.service";

@Controller('calendars/:calendarId/members') //TODO: REST API оформлено немного неправильно. Надо /calendar-members
export class CalendarMembersController extends BaseCrudController<
    CalendarMember,
    AddMemberToCalendarDto,
    UpdateMemberInCalendarDto
> {
    constructor(
        private readonly usersCalendarsService: CalendarMembersService,
        private readonly eventParticipationsService: EventParticipationsService,
        private readonly calendarMembersSevice: CalendarMembersService
        ) {
        super();
    }

    protected async findById(id: number, req: RequestWithUser): Promise<CalendarMember> {
        const calendarId = parseInt(req.params.calendarId, 10);
        return await this.usersCalendarsService.getCalendarMember(id, calendarId);
    }

    protected async createEntity(dto: AddMemberToCalendarDto, req: RequestWithUser): Promise<CalendarMember> {
        const calendarId = parseInt(req.params.calendarId, 10);
        return await this.usersCalendarsService.addUserToCalendar(calendarId, req.user.userId, dto);
    }

    protected async updateEntity(
        id: number,
        dto: UpdateMemberInCalendarDto,
        req: RequestWithUser
    ): Promise<CalendarMember> {
        // const dtoEntries = Object.entries(dto).filter(([_, value]) => value !== undefined);
        //
        // if (dtoEntries.length > 1) {
        //     throw new BadRequestException('You can update either role, color or isVisible, but not both at the same time');
        // } else if (dtoEntries.length < 1) {
        //     throw new BadRequestException('Either role, color or isVisible must be provided');
        // }

        const calendarId = parseInt(req.params.calendarId, 10);
        return await this.usersCalendarsService.updateUserInCalendar(
            calendarId,
            id,
            dto
        );
    }

    protected async deleteEntity(id: number, req: RequestWithUser): Promise<void> {
        const calendarId = parseInt(req.params.calendarId, 10);
        return await this.usersCalendarsService.removeUserFromCalendar(
            calendarId,
            id
        );
    }

    @UseGuards(CalendarMemberGuard)
    @Get()
    async getCalendarUsers(@Param('calendarId') calendarId: number, @Req() req: RequestWithUser): Promise<CalendarMember[]> {
        return await this.usersCalendarsService.getCalendarUsers(calendarId, req.user.userId);
    }

    @UseGuards(CalendarMemberGuard)
    @Get(':id')
    async getById(@Param('id') id: number, @Req() req: RequestWithUser): Promise<CalendarMember> {
        return super.getById(id, req);
    }

    @UseGuards(CalendarOwnerGuard)
    @OnlyCreator(true)
    @Post()
    async create(@Body() dto: AddMemberToCalendarDto, @Req() req: RequestWithUser): Promise<CalendarMember> {
        return super.create(dto, req);
    }


    @UseGuards(UpdateCalendarMemberGuard)
    @Patch(':id')
    async update(
        @Param('id') id: number,
        @Body() dto: UpdateMemberInCalendarDto,
        @Req() req: RequestWithUser
    ): Promise<CalendarMember> {
        return super.update(id, dto, req);
    }

    //TODO: дать возможность человеку себя удалить с календаря, если он не владелец календрая.
    @UseGuards(CalendarMemberRemovalGuard)
    @OnlyCreator(true)
    @Delete(':id')
    async delete(@Param('id') id: number, @Req() req: RequestWithUser): Promise<void> {
        return super.delete(id, req);
    }

    @Public()
    @UseGuards(JwtConfirmCalendarGuard)
    @Post('/confirm-calendar/:confirm_token')
    async confirmCalendarWithConfirmToken(@Req() req: RequestWithUser) {
        return this.usersCalendarsService.confirmCalendar(req.user.userId, Number(req.user.calendarId));
    }

    // GET /members/{id}/events
    @Get(':userId/events')
    async getMemberEvents( //TODO: По датам надо фильтровать все ивенты.
        @Param('userId') id: number,
        @Req() req: RequestWithUser
    ): Promise<EventParticipation[]> {
        const calendarId = parseInt(req.params.calendarId, 10);

        const calendarMember: CalendarMember = await this.calendarMembersSevice.getCalendarMember(id, calendarId);
        const participations = await this.eventParticipationsService.getMemberEvents(calendarMember.id);

        // Check first participation to verify ownership
        if (participations.length > 0 && participations[0].calendarMember.userId !== req.user.userId) {
            throw new BadRequestException('You do not have permission to access these events');
        }

        return participations;
    }
}