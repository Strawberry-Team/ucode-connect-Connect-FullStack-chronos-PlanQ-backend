import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CalendarMembersRepository } from '../../calendar-member/calendar-members.repository';
import { CalendarRole, CalendarType } from '../../calendar-member/entity/calendar-member.entity'
import { EventsService } from '../events.service';
import { EventParticipationsService } from "../../event-participation/event-participations.service";
import { EventParticipation } from "../../event-participation/entity/event-participation.entity";

@Injectable()
export class EventGuard implements CanActivate { //TODO: AccessCheckerService добавить и guard писать отдельно.
    constructor(
        private readonly calendarMembersRepository: CalendarMembersRepository,
        private readonly eventsService: EventsService,
        private readonly eventParticipationsService: EventParticipationsService,
    ) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const method = request.method;
        const userId = user?.userId;

        if (!user) {
            throw new BadRequestException('User not found');
        }

        switch (method) {
            case 'GET':
                return this.handleGetRequest(request, userId);
            case 'POST':
                return this.handlePostRequest(request, userId);
            case 'PATCH':
            case 'DELETE':
                return this.handleModifyRequest(request, userId, method);
            default:
                throw new BadRequestException('Unsupported method');
        }
    }

    private async handleGetRequest(request: any, userId: number): Promise<boolean> {
        if (request.params.id || request.params.eventId) {
            const eventId = request.params.id ? parseInt(request.params.id, 10) : parseInt(request.params.eventId, 10);
            if (isNaN(eventId)) {
                throw new BadRequestException('eventId must be a number');
            }

            const event = await this.eventsService.getEventByIdWithParticipations(eventId, true);
            const isParticipant = event.participations.some(
                participation => participation.calendarMember.userId === userId
            );

            if (!isParticipant) {
                throw new BadRequestException('You are not a participant of this event');
            }
        } else if (request.params.userId) {
            if (request.params.userId !== userId) {
                throw new ForbiddenException('You do not have access to this event');
            }
        }

        return true;
    }

    private async handlePostRequest(request: any, userId: number): Promise<boolean> {
        // console.log("handlePostRequest ", request.body);
        if (!request.body?.calendarId) {
            throw new BadRequestException('calendarId is required');
        }

        const calendarId = parseInt(request.body.calendarId, 10);
        if (isNaN(calendarId)) {
            throw new BadRequestException('calendarId must be a number');
        }

        // Проверка прав доступа к календарю
        // console.log({userId: userId, calendarId: calendarId});
        const calendarMember = await this.calendarMembersRepository.findByUserAndCalendar(userId, calendarId);
        const userCalendars = await this.calendarMembersRepository.findCalendarUsers(calendarId, true);
        // console.log(calendarMember);
        // console.log(userCalendars);
        if (!calendarMember) {
            throw new ForbiddenException('You do not have access to this calendar');
        }

        if (request.params.userId) {
            const eventId = parseInt(request.params.id, 10);
            if (isNaN(eventId)) {
                throw new BadRequestException('eventId must be a number');
            }
            const event = await this.eventsService.getEventByIdWithParticipations(eventId, true);

            if (calendarMember.calendarType === CalendarType.MAIN) {
                if (event.creatorId === userId) {
                    return true;
                } else {
                    throw new ForbiddenException('Creators can only delete their own events if you are not in shared calendar');
                }
            }
        }

        if (calendarMember.role === CalendarRole.OWNER || calendarMember.role === CalendarRole.EDITOR) {
            return true;
        }

        throw new ForbiddenException('You need editor or owner role to perform this action');
    }

    private async handleModifyRequest(request: any, userId: number, method: string): Promise<boolean> {
        const paramCalendarMemberId = request.params.calendarMemberId
        if (paramCalendarMemberId) {
            const calendarMember = await this.calendarMembersRepository.findById(paramCalendarMemberId);

            if (!calendarMember) {
                throw new ForbiddenException('You do not have access to this calendar');
            }
            if (method === 'PATCH') {
                return calendarMember.userId === userId;
            } else if (method === 'DELETE') {
                if (calendarMember.userId === userId) {
                    return true;
                }
            }
        }

        const eventId = parseInt(request.params.id, 10);
        if (isNaN(eventId)) {
            throw new BadRequestException('eventId must be a number');
        }

        // Получаем событие, чтобы узнать calendarId
        const event = await this.eventsService.getEventById(eventId);
        if (!event) {
            throw new NotFoundException('Event not found');
        }

        const calendarId = await this.getCalendarIdForEvent(event.creatorId, eventId);
        const calendarMember = await this.calendarMembersRepository.findByUserAndCalendar(userId, calendarId);

        if (!calendarMember) {
            throw new ForbiddenException('You do not have access to this calendar');
        }

        // Проверка для личного календаря
        if (calendarMember.calendarType === CalendarType.MAIN) {
            if (event.creatorId === userId) {
                return true;
            } else {
                throw new ForbiddenException('Creators can only modify their own events if you are not in shared calendar');
            }
        }

        // Для владельца календаря разрешены все действия
        if (calendarMember.role === CalendarRole.OWNER) {
            return true;
        }

        // Для редактора календаря
        if (calendarMember.role === CalendarRole.EDITOR) {
            if (method === 'DELETE' && event.creatorId !== userId && !paramCalendarMemberId) {
                throw new ForbiddenException('Editors can only delete their own events');
            }
            return true;
        }

        throw new ForbiddenException('You do not have permission to delete or patch this event');
    }

    private async getCalendarIdForEvent(creatorId: number, eventId: number): Promise<number> {
        const eventCreatorCalendarsIds = await this.calendarMembersRepository.findUserCalendars(creatorId);
        const eventParticipations: any = [];

        for (const eventCreatorCalendar of eventCreatorCalendarsIds) {
            try {
                const participation: EventParticipation = await this.eventParticipationsService.getEventParticipationByMemberAndEvent(
                    eventCreatorCalendar.id,
                    eventId
                );
                if (participation) {
                    eventParticipations.push(participation);
                }
            }
            catch (err) {
                console.log(err);
            }
        }

        if (eventParticipations.length === 0) {
            throw new NotFoundException('Event participation not found');
        }

        if (eventParticipations.length === 1) {
            return eventParticipations[0].calendarMember.calendarId;
        }

        // Если у нас 2 участия, выбираем не основной календарь
        const nonMainCalendarParticipation = eventParticipations.find(
            p => p.calendarMember.calendarType !== CalendarType.MAIN
        );

        return nonMainCalendarParticipation
            ? nonMainCalendarParticipation.calendarMember.calendarId
            : eventParticipations[0].calendarMember.calendarId;
    }
}