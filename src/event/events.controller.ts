// src/event/events.controller.ts
import {
    Controller,
    Post,
    Patch,
    Param,
    Body,
    Req,
    UseInterceptors, BadRequestException,
    Delete, Get, UseGuards
} from '@nestjs/common';
import { BaseCrudController } from '../common/controller/base-crud.controller';
import { Event } from './entity/event.entity';
import { EventsService } from './events.service';
import { RequestWithUser } from '../common/types/request.types';
import { EventParticipationsService } from '../event-participation/event-participations.service';
import { CreateEventContainerDto } from './dto/container/create-event-container.dto';
import {EventBodyInterceptor} from "./interceptors/event-body.interceptor";
import {UpdateEventContainerDto} from "./dto/container/update-event-container.dto";
import {EventGuard} from "./guards/event.guard";

@Controller('events')
export class EventsController extends BaseCrudController<
    Event,
    CreateEventContainerDto,
    UpdateEventContainerDto
> {
    constructor(
        private readonly eventsService: EventsService,
        private readonly eventParticipationsService: EventParticipationsService
    ) {
        super();
    }

    protected async findById(id: number, req: RequestWithUser): Promise<Event> {
        return await this.eventsService.getEventByIdWithParticipations(id, false);
    }

    protected async createEntity(dto: CreateEventContainerDto, req: RequestWithUser): Promise<Event> {
        return await this.eventsService.createEvent(req.user.userId, dto.data);
    }

    protected async updateEntity(
        id: number,
        dto: UpdateEventContainerDto,
        req: RequestWithUser
    ): Promise<Event> {
        const dtoData = dto.data;
        // if (
        //     (dtoData.startedAt !== undefined && dtoData.endedAt === undefined) ||
        //     (dtoData.startedAt === undefined && dtoData.endedAt !== undefined)
        // ) {
        //     throw new BadRequestException('Both startedAt and endedAt must be provided together');
        // }
        return await this.eventsService.updateEvent(id, req.user.userId, dtoData);
    }

    protected async deleteEntity(id: number, req: RequestWithUser): Promise<void> {
        return await this.eventsService.deleteEvent(id, req.user.userId);
    }

    @UseGuards(EventGuard)
    @Get(':id')
    async getById(@Param('id') id: number, @Req() req: RequestWithUser): Promise<Event> {
        return await super.getById(id, req);
    }

    @UseInterceptors(EventBodyInterceptor)
    @UseGuards(EventGuard)
    @Post()
    async create(@Body() dto: CreateEventContainerDto, @Req() req: RequestWithUser): Promise<Event> {
        return await super.create(dto, req);
    }

    @UseGuards(EventGuard)
    @UseInterceptors(EventBodyInterceptor)
    @Patch(':id')
    async update(
        @Param('id') id: number,
        @Body() dto: UpdateEventContainerDto,
        @Req() req: RequestWithUser
    ): Promise<Event> {
        return await super.update(id, dto, req);
    }

    @UseGuards(EventGuard)
    @Delete(':id')
    async delete(@Param('id') id: number, @Req() req: RequestWithUser): Promise<void> {
        return await super.delete(id, req);
    }
}
