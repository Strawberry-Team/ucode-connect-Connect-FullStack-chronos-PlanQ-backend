// src/event-participation/event-participations.controller.ts
import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Req,
    UseGuards,
    BadRequestException
} from '@nestjs/common';
import { BaseCrudController } from '../common/controller/base-crud.controller';
import { EventParticipation } from './entity/event-participation.entity';
import { CreateEventParticipationDto } from './dto/create-event-participation.dto';
import { UpdateEventParticipationDto } from './dto/update-event-participation.dto';
import { EventParticipationsService } from './event-participations.service';
import { RequestWithUser } from '../common/types/request.types';
import { Public } from '../common/decorators/public.decorator';

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
        const participation = await this.eventParticipationsService.getEventParticipationByMemberAndEvent(
            id,
            eventId
        );

        // Check if user owns this calendar membership
        if (participation.calendarMember.userId !== req.user.userId) {
            throw new BadRequestException('You do not have permission to access this participation');
        }

        return participation;
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
        const eventId = parseInt(req.params.eventId, 10); //TODO: оно надо?
        return await this.eventParticipationsService.updateEventParticipation(
            id,
            req.user.userId,
            dto
        );
    }

    protected async deleteEntity(id: number, req: RequestWithUser): Promise<void> {
        const eventId = parseInt(req.params.eventId, 10); //TODO: оно надо?
        return await this.eventParticipationsService.deleteEventParticipation(
            id,
            req.user.userId
        );
    }

    // GET /events/{eventId}/calendar-members/{id}
    @Get(':id')
    async getById(@Param('id') id: number, @Req() req: RequestWithUser): Promise<EventParticipation> {
        return super.getById(id, req);
    }

    // POST /events/{eventId}/calendar-members
    @Post()
    async create(@Body() dto: CreateEventParticipationDto, @Req() req: RequestWithUser): Promise<EventParticipation> {
        return super.create(dto, req);
    }

    // PATCH /events/{eventId}/calendar-members/{id}
    @Patch(':id')
    async update(
        @Param('id') id: number,
        @Body() dto: UpdateEventParticipationDto,
        @Req() req: RequestWithUser
    ): Promise<EventParticipation> {
        return super.update(id, dto, req);
    }

    // DELETE /events/{eventId}/calendar-members/{id}
    @Delete(':id')
    async delete(@Param('id') id: number, @Req() req: RequestWithUser): Promise<void> {
        return super.delete(id, req);
    }

    // POST /events/{eventId}/calendar-members/{id}/confirm-participation/{confirm-token}
    @Public()
    // @UseGuards(JwtConfirmEventParticipationGuard)
    @Post(':id/confirm-participation/:confirm_token')
    async confirmEventParticipation(@Req() req: RequestWithUser): Promise<EventParticipation> {
        return await this.eventParticipationsService.confirmEventParticipation(
            // req.user.eventParticipationId
            1
        );
    }
}