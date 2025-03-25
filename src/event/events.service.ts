// src/event/events.service.ts //TODO: добавить везде название файла вот так.
import {
    forwardRef,
    Inject,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import {EventsRepository} from './events.repository';
import {Event, EventType} from './entity/event.entity';
import {CreateEventBaseDto} from './dto/create-event-base.dto';
import {CreateEventTaskDto} from './dto/create-event-task.dto';
import {CreateEventArrangementDto} from './dto/create-event-arrangement.dto';
import {UpdateEventDto} from './dto/update-event.dto';
import {UpdateEventTaskDto} from './dto/update-event-task.dto';
import {EventTasksService} from '../event-task/event-tasks.service';
import {EventParticipationsService} from '../event-participation/event-participations.service';
import {CalendarMembersService} from '../calendar-member/calendar-members.service';
import {ResponseStatus} from '../event-participation/entity/event-participation.entity';
import {UsersService} from '../user/users.service';
import {EventCursor} from "../common/types/cursor.pagination.types";

@Injectable()
export class EventsService {
    constructor(
        private readonly eventsRepository: EventsRepository,
        @Inject(forwardRef(() => EventTasksService))
        private readonly eventTasksService: EventTasksService,
        @Inject(forwardRef(() => EventParticipationsService))
        private readonly eventParticipationsService: EventParticipationsService,
        @Inject(forwardRef(() => CalendarMembersService))
        private readonly calendarMembersService: CalendarMembersService,
        @Inject(forwardRef(() => UsersService))
        private readonly usersService: UsersService
    ) {
    }

    async getEventByIdWithParticipations(id: number, isResponseStatusNull: boolean): Promise<Event> {
        const event = await this.eventsRepository.findEventWithParticipations(id, isResponseStatusNull);

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        return event;
    }

    async getEventById(id: number): Promise<Event> {
        const event = await this.eventsRepository.findById(id);

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        return event;
    }

    async createEvent(userId: number, dto: CreateEventBaseDto): Promise<Event> {
        const calendarMember = await this.calendarMembersService.getCalendarMember(userId, dto.calendarId);

        if (!calendarMember) {
            throw new NotFoundException('Calendar not found or you do not have access');
        }

        let event: Event;

        // Create base event
        event = await this.eventsRepository.createEvent({
            creatorId: userId,
            name: dto.name,
            description: dto.description,
            category: dto.category,
            startedAt: new Date(dto.startedAt),
            endedAt: new Date(dto.endedAt),
            type: dto.type
        });

        // Handle specific event type logic
        switch (dto.type) {
            case EventType.TASK:
                const taskDto = dto as CreateEventTaskDto;
                await this.eventTasksService.createEventTask({
                    eventId: event.id,
                    isCompleted: false,
                    priority: taskDto.priority
                });

                // Add task to the creator's participation
                await this.eventParticipationsService.createEventParticipation({
                    calendarMemberId: calendarMember.id,
                    eventId: event.id,
                    color: dto.color,
                    responseStatus: ResponseStatus.ACCEPTED
                });
                break;

            case EventType.ARRANGEMENT:
                const arrangementDto = dto as CreateEventArrangementDto;

                // Add creator to the event participation
                if (arrangementDto.participantIds && arrangementDto.participantIds.includes(userId)) {
                    await this.eventParticipationsService.createEventParticipation({
                        calendarMemberId: calendarMember.id,
                        eventId: event.id,
                        color: dto.color,
                        responseStatus: ResponseStatus.PENDING
                    });
                }

                // Add all other calendar members with null response status
                const calendarMembers = await this.calendarMembersService.getCalendarUsers(dto.calendarId, userId);
                for (const member of calendarMembers) {
                    if (member.userId !== userId && member.isConfirmed) {
                        await this.eventParticipationsService.createEventParticipation({
                            calendarMemberId: member.id,
                            eventId: event.id,
                            color: dto.color,
                            responseStatus: null
                        });
                    }
                }

                // Add specified participants
                if (arrangementDto.participantIds && arrangementDto.participantIds.length > 0) {
                    for (const participantId of arrangementDto.participantIds) {
                        if (participantId !== userId) { // Skip if it's the creator
                            await this.eventParticipationsService.inviteUserToEvent(
                                event.id,
                                participantId,
                                dto.calendarId,
                                userId,
                                // dto.color
                            );
                        }
                    }
                }
                break;

            case EventType.REMINDER:
                // Add reminder to the creator's participation
                await this.eventParticipationsService.createEventParticipation({
                    calendarMemberId: calendarMember.id,
                    eventId: event.id,
                    color: dto.color,
                    responseStatus: ResponseStatus.ACCEPTED
                });

                // Add reminder to all calendar members
                const reminderCalendarMembers = await this.calendarMembersService.getCalendarUsers(dto.calendarId, userId);
                for (const member of reminderCalendarMembers) {
                    if (member.userId !== userId && member.isConfirmed) {
                        await this.eventParticipationsService.createEventParticipation({
                            calendarMemberId: member.id,
                            eventId: event.id,
                            color: dto.color,
                            responseStatus: ResponseStatus.ACCEPTED
                        });
                    }
                }
                break;
        }

        return this.getEventByIdWithParticipations(event.id, false);
    }

    async updateEvent(id: number, userId: number, dto: UpdateEventDto): Promise<Event> {
        const event = await this.eventsRepository.findById(id);

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        const updateData: Partial<Event> = {};

        if (dto.name !== undefined) updateData.name = dto.name;
        if (dto.description !== undefined) updateData.description = dto.description;
        if (dto.category !== undefined) updateData.category = dto.category;
        if (dto.startedAt !== undefined) updateData.startedAt = new Date(dto.startedAt);
        if (dto.endedAt !== undefined) updateData.endedAt = new Date(dto.endedAt);

        const updatedEvent = await this.eventsRepository.updateEvent(id, updateData);

        if (event.type === EventType.TASK) {
            const taskDto = dto as UpdateEventTaskDto;
            const taskUpdateData: any = {};

            if (taskDto.priority !== undefined) taskUpdateData.priority = taskDto.priority;
            if (taskDto.isCompleted !== undefined) taskUpdateData.isCompleted = taskDto.isCompleted;

            if (Object.keys(taskUpdateData).length > 0) {
                await this.eventTasksService.updateEventTask(id, taskUpdateData);
            }
        }

        return this.getEventByIdWithParticipations(id, false);
    }

    async deleteEvent(id: number, userId: number): Promise<void> {
        const event = await this.eventsRepository.findById(id);

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        await this.eventsRepository.deleteEvent(id);
    }

    async getEventsByStartTimeAndType(type: EventType, startedAtStartTime: Date, startedAtEndTime: Date): Promise<Event[]> {
        return this.eventsRepository.findEventsByType(type, startedAtStartTime, startedAtEndTime);
    }

    async getUserEventsOffset(
        userId: number,
        name: string,
        page: number,
        limit: number
    ): Promise<{ events: any; total: number; page: number; limit: number; totalPages: number }> {
        return await this.eventParticipationsService.getUserEventsOffset(userId, name, page, limit);
    }

    async getUserEventsCursor(
        userId: number,
        name: string,
        after: EventCursor | null,
        limit: number
    ): Promise<{
        events: any;
        nextCursor: EventCursor | null;
        hasMore: boolean,
        total: number,
        after: EventCursor | null,
        limit: number,
        remaining: number
    }> {
        return await this.eventParticipationsService.getUserEventsCursor(userId, name, after, limit);
    }

}
