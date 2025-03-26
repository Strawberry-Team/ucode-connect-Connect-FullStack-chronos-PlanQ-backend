// src/event-participation/event-participations.controller.ts
import {Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards} from '@nestjs/common';
import {BaseCrudController} from '../common/controller/base-crud.controller';
import {EventParticipation} from './entity/event-participation.entity';
import {CreateEventParticipationDto} from './dto/create-event-participation.dto';
import {UpdateEventParticipationDto} from './dto/update-event-participation.dto';
import {EventParticipationsService} from './event-participations.service';
import {RequestWithUser} from '../common/types/request.types';
import {Public} from '../common/decorators/public.decorator';
import {EventGuard} from "../event/guards/event.guard";
import {confirmParticipationGuard} from './guards/confirm-participation.guard';

@Controller('events/:eventId/calendar-members')
export class EventParticipationsController extends BaseCrudController<
    EventParticipation,
    CreateEventParticipationDto,
    UpdateEventParticipationDto
> {
    constructor(
        private readonly eventParticipationsService: EventParticipationsService
    ) {
        super();
    }

    protected async findById(id: number, req: RequestWithUser): Promise<EventParticipation> {
        const eventId = parseInt(req.params.eventId, 10);
        return await this.eventParticipationsService.getEventParticipationByMemberAndEvent(
            id,
            eventId
        );
    }

    protected async createEntity(dto: CreateEventParticipationDto, req: RequestWithUser): Promise<EventParticipation> {
        const eventId = parseInt(req.params.eventId, 10);
        return await this.eventParticipationsService.inviteUserToEvent(
            eventId,
            dto.userId,
            dto.calendarId,
            req.user.userId,
        );
    }

    protected async updateEntity(
        id: number,
        dto: UpdateEventParticipationDto,
        req: RequestWithUser
    ): Promise<EventParticipation> {
        const eventId = parseInt(req.params.eventId, 10);
        return await this.eventParticipationsService.updateEventParticipation(
            id,
            eventId,
            dto
        );
    }

    protected async deleteEntity(id: number, req: RequestWithUser): Promise<void> {
        const eventId = parseInt(req.params.eventId, 10);
        return await this.eventParticipationsService.deleteEventParticipation(
            id,
            eventId
        );
    }

    @UseGuards(EventGuard)
    @Get(':calendarMemberId')
    async getById(@Param('calendarMemberId') id: number, @Req() req: RequestWithUser): Promise<EventParticipation> {
        return super.getById(id, req);
    }

    @UseGuards(EventGuard)
    @Post()
    async create(@Body() dto: CreateEventParticipationDto, @Req() req: RequestWithUser): Promise<EventParticipation> {
        return super.create(dto, req);
    }

    @Patch(':calendarMemberId')
    async update(
        @Param('calendarMemberId') id: number,
        @Body() dto: UpdateEventParticipationDto,
        @Req() req: RequestWithUser
    ): Promise<EventParticipation> {
        return super.update(id, dto, req);
    }

    @Delete(':calendarMemberId')
    async delete(@Param('calendarMemberId') id: number, @Req() req: RequestWithUser): Promise<void> {
        return super.delete(id, req);
    }

    @Public()
    @UseGuards(confirmParticipationGuard)
    @Post(':calendarMemberId/confirm-participation/:confirm_token')
    async confirmEventParticipation(@Req() req: RequestWithUser): Promise<EventParticipation> {
        console.log("req.user.eventParticipationId: ", req.user.eventParticipationId);
        return await this.eventParticipationsService.confirmEventParticipation(
            Number(req.user.eventParticipationId)
        );
    }
}