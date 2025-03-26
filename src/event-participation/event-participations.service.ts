// src/event-participation/event-participations.service.ts
import {
    BadRequestException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import {EventParticipationsRepository} from './event-participations.repository';
import {EventParticipation, ResponseStatus} from './entity/event-participation.entity';
import {UpdateEventParticipationDto} from './dto/update-event-participation.dto';
import {CalendarMembersService} from '../calendar-member/calendar-members.service';
import {UsersService} from '../user/users.service';
import {EventsService} from '../event/events.service';
import {CalendarMember, CalendarType} from '../calendar-member/entity/calendar-member.entity';
import {EmailService} from '../email/email.service';
import {JwtUtils} from '../jwt/jwt-token.utils';
import {ConfigService} from '@nestjs/config';
import {EventCursor} from "../common/types/cursor.pagination.types";

@Injectable()
export class EventParticipationsService {
    private frontendUrl: string;

    constructor(
        private readonly eventParticipationsRepository: EventParticipationsRepository,
        @Inject(forwardRef(() => CalendarMembersService))
        private readonly calendarMembersService: CalendarMembersService,
        @Inject(forwardRef(() => UsersService))
        private readonly usersService: UsersService,
        @Inject(forwardRef(() => EventsService))
        private readonly eventsService: EventsService,
        private readonly emailService: EmailService,
        private readonly jwtUtils: JwtUtils,
        private readonly configService: ConfigService
    ) {
        this.frontendUrl = String(this.configService.get<string>('app.frontendLink'));
    }

    async getEventParticipation(id: number): Promise<EventParticipation> {
        const participation = await this.eventParticipationsRepository.findById(id);

        if (!participation) {
            throw new NotFoundException('Event participation not found1');
        }

        return participation;
    }

    async getEventParticipationByMemberAndEvent(calendarMemberId: number, eventId: number): Promise<EventParticipation> {
        const participation = await this.eventParticipationsRepository.findByCalendarMemberAndEvent(calendarMemberId, eventId);

        if (!participation) {
            console.log("calendarMemberId eventId: ", calendarMemberId, " ", eventId)
            throw new NotFoundException('Event participation not found2');
        }

        return participation;
    }

    async getEventParticipations(eventId: number): Promise<EventParticipation[]> {
        const result = await this.eventParticipationsRepository.findByEventId(eventId);
        if (!result) {
            throw new NotFoundException('Event participations not found');
        }
        return result;
    }

    async createEventParticipation(data: Partial<EventParticipation>): Promise<EventParticipation> {
        return this.eventParticipationsRepository.createEventParticipation(data);
    }

    async inviteUserToEvent(
        eventId: number,
        userId: number,
        calendarId: number,
        inviterId: number,
    ): Promise<EventParticipation> {
        // Check if event exists
        const event = await this.eventsService.getEventByIdWithParticipations(eventId, true);
        if (!event) {
            throw new NotFoundException('Event not found');
        }

        // Find or create calendar membership for invited user
        let calendarMember = await this.calendarMembersService.getCalendarMember(userId, calendarId);
        let mainCalendarMember;

        // Always add to user's main calendar as well
        try {
            const userCalendars = await this.calendarMembersService.getUserCalendars(userId);
            mainCalendarMember = userCalendars.find(c => c.calendarType === CalendarType.MAIN);

            if (!mainCalendarMember) {
                throw new NotFoundException('User\'s main calendar not found');
            }
        } catch (error) {
            throw new BadRequestException('Failed to find user\'s main calendar');
        }

        // Find creator's participation to get color
        const inviterMember = await this.calendarMembersService.getCalendarMember(inviterId, calendarId);
        const inviterParticipation = await this.eventParticipationsRepository.findByCalendarMemberAndEvent(
            inviterMember.id,
            eventId
        );
        let participationColor;
        if (!inviterParticipation) {
            participationColor = calendarMember.color;
        } else {
            participationColor = inviterParticipation.color;
        }


        // Check if user is already a participant
        let participation;

        if (calendarMember && calendarMember.isConfirmed) {
            participation = await this.eventParticipationsRepository.findByCalendarMemberAndEvent(
                calendarMember.id,
                eventId
            );
        }

        // Send invitation email
        const inviter = await this.usersService.getUserByIdWithoutPassword(inviterId);
        const invitedUser = await this.usersService.getUserById(userId);

        // console.log("invitedUser", invitedUser);

        if (!invitedUser.emailVerified) {
            throw new BadRequestException('User must verify their email first');
        }

        let participationId;

        // Create or update participation in shared calendar
        if (participation) {
            // User is already on the event, just update the status
            console.log("participation", participation.responseStatus !== null);
            console.log("participation", participation.responseStatus !== ResponseStatus.INVITED);
            if (participation.responseStatus !== null && participation.responseStatus !== ResponseStatus.INVITED) {
                throw new BadRequestException(`User is already a participant of this event, userId = ${participation.calendarMember.userId}`);
            }
            if (userId === inviterId) {
                participation.responseStatus = ResponseStatus.PENDING;
            } else {
                participation.responseStatus = ResponseStatus.INVITED;
            }
            await this.eventParticipationsRepository.updateEventParticipation(
                participation.id,
                {responseStatus: participation.responseStatus}
            );
            participationId = participation.id;
        } else if (calendarMember && calendarMember.isConfirmed) {
            // User is a member of the calendar but not yet on this event
            const newParticipation = await this.eventParticipationsRepository.createEventParticipation({
                calendarMemberId: calendarMember.id,
                eventId,
                color: participationColor,
                responseStatus: ResponseStatus.INVITED
            });
            participationId = newParticipation.id;
        }

        // Always add to main calendar
        const mainParticipation = await this.eventParticipationsRepository.findByCalendarMemberAndEvent(
            mainCalendarMember.id,
            eventId
        );

        if (!mainParticipation) {
            const newMainParticipation = await this.eventParticipationsRepository.createEventParticipation({
                calendarMemberId: mainCalendarMember.id,
                eventId,
                color: participationColor,
                responseStatus: ResponseStatus.INVITED
            });

            // If no shared calendar participation, use the main one
            if (!participationId) {
                participationId = newMainParticipation.id;
            }
        } else if (!participationId) {
            participationId = mainParticipation.id;

            if (mainParticipation.responseStatus !== null || mainParticipation.responseStatus !== ResponseStatus.INVITED) {
                throw new BadRequestException('User is already a participant of this event');
            }
            if (userId === inviterId) {
                mainParticipation.responseStatus = ResponseStatus.PENDING;
            } else {
                mainParticipation.responseStatus = ResponseStatus.INVITED;
            }

            // Update status if already exists
            await this.eventParticipationsRepository.updateEventParticipation(
                mainParticipation.id,
                {responseStatus: mainParticipation.responseStatus}
            );
        }

        // Generate token for confirmation
        const token = this.jwtUtils.generateToken({
            sub: userId,
            eventParticipationId: participationId
        }, 'confirmArrangement');

        const confirmLink = `${this.frontendUrl}events/${eventId}/calendar-members/${calendarMember?.id || mainCalendarMember.id}/confirm-participation/${token}`;

        // For simplicity, just log the link in dev environment
        console.log(`Confirmation link: ${confirmLink}`);

        // Get all participants for the email
        const allParticipations = await this.getEventParticipations(eventId);
        const participantEmails = await Promise.all(
            allParticipations
                .filter(p => p.responseStatus !== null)
                .map(async p => {
                    const user = await this.usersService.getUserByIdWithoutPassword(p.calendarMember.userId);
                    return user.email;
                })
        );

        // Format with ISO string (2023-04-05T12:30:00.000Z)
        // const eventDateTimeStartedAt = event.startedAt.toISOString();
        // const eventDateTimeEndedAt = event.endedAt.toISOString();

        // Format as YYYY-MM-DD HH:MM UTC
        // const eventDateTimeStartedAt = `${event.startedAt.getUTCFullYear()}-${(event.startedAt.getUTCMonth() + 1).toString().padStart(2, '0')}-${event.startedAt.getUTCDate().toString().padStart(2, '0')} ${event.startedAt.getUTCHours().toString().padStart(2, '0')}:${event.startedAt.getUTCMinutes().toString().padStart(2, '0')} UTC`;
        // const eventDateTimeEndedAt = `${event.endedAt.getUTCFullYear()}-${(event.endedAt.getUTCMonth() + 1).toString().padStart(2, '0')}-${event.endedAt.getUTCDate().toString().padStart(2, '0')} ${event.endedAt.getUTCHours().toString().padStart(2, '0')}:${event.endedAt.getUTCMinutes().toString().padStart(2, '0')} UTC`;


        const eventDateTimeStartedAt = event.startedAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC'
        });

        const eventDateTimeEndedAt = event.endedAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC'
        });

        // Send email
        this.emailService.sendEventInvitationEmail(
            invitedUser.email,
            inviter.email,
            event.name,
            eventDateTimeStartedAt,
            eventDateTimeEndedAt,
            confirmLink,
            participantEmails
        );

        // Return the participation that was created or updated
        if (participation) {
            return participation;
        } else if (calendarMember && calendarMember.isConfirmed) {
            const result = await this.eventParticipationsRepository.findByCalendarMemberAndEvent(
                calendarMember.id,
                eventId
            );
            if (!result) {
                throw new NotFoundException('Event participation not found3');
            }
            return result;
        } else {
            const result = await this.eventParticipationsRepository.findByCalendarMemberAndEvent(
                mainCalendarMember.id,
                eventId
            );
            if (!result) {
                throw new NotFoundException('Event participation not found4');
            }
            return result;
        }
    }

    async updateEventParticipation(calendarMamberId: number, eventId: number, dto: UpdateEventParticipationDto): Promise<EventParticipation> { //calendarMemberId того, кого хотят обовить, userId того, кто хочет обновить
        const calendaMemberToUpdate = await this.calendarMembersService.getCalendarMenberById(calendarMamberId);
        if (!calendaMemberToUpdate) {
            throw new NotFoundException('Calendar member not found');
        }

        const participation = await this.eventParticipationsRepository.findByCalendarMemberAndEvent(calendarMamberId, eventId);
        if (!participation) {
            throw new NotFoundException('Event participation not found5');
        }

        const updateData: Partial<EventParticipation> = {};

        if (dto.color !== undefined) {
            updateData.color = dto.color;
            await this.eventParticipationsRepository.updateEventParticipation(participation.id, updateData);
        }

        if (dto.responseStatus !== undefined) {
            if (dto.responseStatus === ResponseStatus.ACCEPTED || dto.responseStatus === ResponseStatus.DECLINED || dto.responseStatus === ResponseStatus.PENDING) {
                await this.updateResponseStatusInAllCalendars(
                    calendaMemberToUpdate.userId,
                    participation.eventId,
                    dto.responseStatus,
                    // participation.calendarMember.id
                );
            }
        }

        console.log(calendaMemberToUpdate.userId)
        const updatedParticipation = await this.eventParticipationsRepository.findById(participation.id);

        if (!updatedParticipation) {
            throw new NotFoundException('Event participation not found6');
        }

        return updatedParticipation;
    }

    async confirmEventParticipation(eventParticipationId: number): Promise<EventParticipation> {
        const participation = await this.eventParticipationsRepository.findById(eventParticipationId);

        if (!participation) {
            throw new NotFoundException('Event participation not found7');
        }
        const userId = participation.calendarMember.userId;

        await this.updateResponseStatusInAllCalendars(
            userId,
            participation.eventId,
            ResponseStatus.PENDING,
            //calendarType
        );

        const updatedParticipation = await this.eventParticipationsRepository.findById(participation.id);

        if (!updatedParticipation) throw new NotFoundException('Event participation not found8');

        return updatedParticipation;
    }

    // private async updateResponseStatusInAllCalendars(
    //     userId: number,
    //     eventId: number,
    //     status: ResponseStatus,
    //     currentCalendarType: CalendarType
    // ): Promise<void> {
    //     // Get all user's calendar memberships
    //     const calendars = await this.calendarMembersService.getUserCalendars(userId);

    //     if (currentCalendarType === CalendarType.MAIN) {
    //         // If updating from main calendar, update all other calendars
    //         for (const calendar of calendars) {
    //             if (calendar.calendarType !== CalendarType.MAIN) {
    //                 try {
    //                     const participation = await this.eventParticipationsRepository.findByCalendarMemberAndEvent(
    //                         calendar.id,
    //                         eventId
    //                     );

    //                     if (participation) {
    //                         await this.eventParticipationsRepository.updateEventParticipation(
    //                             participation.id,
    //                             {responseStatus: status}
    //                         );
    //                     }
    //                 } catch (error) {
    //                     // Participation doesn't exist in this calendar, that's ok
    //                 }
    //             }
    //         }
    //     } else {
    //         // If updating from shared calendar, update main calendar
    //         const mainCalendar = calendars.find(c => c.calendarType === CalendarType.MAIN);

    //         if (mainCalendar) {
    //             try {
    //                 const participation = await this.eventParticipationsRepository.findByCalendarMemberAndEvent(
    //                     mainCalendar.id,
    //                     eventId
    //                 );

    //                 if (participation) {
    //                     await this.eventParticipationsRepository.updateEventParticipation(
    //                         participation.id,
    //                         {responseStatus: status}
    //                     );
    //                 }
    //             } catch (error) {
    //                 // Participation doesn't exist in main calendar, that's ok
    //             }
    //         }
    //     }
    // }

    private async updateResponseStatusInAllCalendars(
        userId: number,
        eventId: number,
        status: ResponseStatus,
        currentCalendar?: number
    ): Promise<void> {
        const calendarMembers = await this.calendarMembersService.getUserCalendars(userId);

        for (const calendarMember of calendarMembers) {
            const result = await this.eventParticipationsRepository.findByCalendarMemberAndEvent(calendarMember.id, eventId); //Main и calendar  /Main
            if (result && currentCalendar && result.id === currentCalendar) {
                await this.eventParticipationsRepository.updateEventParticipation(result.id, {
                    responseStatus: status,
                });
            } else if (result) {
                await this.eventParticipationsRepository.updateEventParticipation(result.id, {
                    responseStatus: status,
                });
            }
        }
    }

    async deleteEventParticipation(calendarMamberId: number, eventId: number): Promise<void> { //calendar_member_id(calendar_id и user_id) user_id того, кто удаляет
        const calendarMemberMemberToDelete = await this.calendarMembersService.getCalendarMenberById(calendarMamberId);
        if (!calendarMemberMemberToDelete) {
            throw new NotFoundException('Calendar member not found');
        }

        const participation = await this.eventParticipationsRepository.findByCalendarMemberAndEvent(calendarMamberId, eventId);
        if (!participation) {
            throw new NotFoundException('Event participation not found9');
        }

        const calendarMembers = await this.calendarMembersService.getUserCalendars(calendarMemberMemberToDelete?.userId);

        for (const calendarMember of calendarMembers) {
            const existingParticipation = await this.eventParticipationsRepository.findByCalendarMemberAndEvent(
                calendarMember.id,
                eventId
            );
            if (existingParticipation) {
                console.log(calendarMember)
                if (calendarMember.calendarType === CalendarType.MAIN) {
                    console.log("delete")
                    await this.eventParticipationsRepository.deleteEventParticipation(existingParticipation.id);
                } else {
                    console.log("update")
                    await this.eventParticipationsRepository.updateEventParticipation(existingParticipation.id, {
                        responseStatus: null
                    });
                }
            }
        }
    }

    private async prepareUserEventConditions(userId: number): Promise<{
        mainConditions: { calendarMemberIds: number[], responseStatuses: (ResponseStatus | null)[] },
        sharedConditions: { calendarMemberIds: number[], responseStatuses: (ResponseStatus | null)[] }
    }> {
        const calendarMembers = await this.calendarMembersService.getUserCalendars(userId);
        const mainCalendarMembers = calendarMembers.filter(cm => cm.calendarType === CalendarType.MAIN);
        const sharedCalendarMembers = calendarMembers.filter(cm => cm.calendarType !== CalendarType.MAIN);

        return {
            mainConditions: {
                calendarMemberIds: mainCalendarMembers.map(cm => cm.id),
                responseStatuses: [null, ResponseStatus.ACCEPTED, ResponseStatus.DECLINED, ResponseStatus.PENDING]
            },
            sharedConditions: {
                calendarMemberIds: sharedCalendarMembers.map(cm => cm.id),
                responseStatuses: [...Object.values(ResponseStatus), null]
            }
        };
    }

    async getUserEventsOffset(
        userId: number,
        name: string,
        page: number,
        limit: number
    ): Promise<{ events: any; total: number; page: number; limit: number; totalPages: number }> {
        const {mainConditions, sharedConditions} = await this.prepareUserEventConditions(userId);

        const result = await this.eventParticipationsRepository.findEventsByUserAndNameOffset(
            name || '',
            page,
            limit,
            mainConditions,
            sharedConditions
        );

        const events = result.eventParticipations.map(ep => ({
            ...ep.event,
            calendarMemberId: ep.calendarMemberId,
            calendarId: ep.calendarMember.calendarId
        }));

        return {events, total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages};
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
        const {mainConditions, sharedConditions} = await this.prepareUserEventConditions(userId);

        const result = await this.eventParticipationsRepository.findEventsByUserAndNameCursor(
            name || '',
            after,
            limit,
            mainConditions,
            sharedConditions
        );

        const events = result.eventParticipations.map(ep => ({
            ...ep.event,
            calendarMemberId: ep.calendarMemberId,
            calendarId: ep.calendarMember.calendarId
        }));

        return {
            events,
            nextCursor: result.nextCursor,
            hasMore: result.hasMore,
            total: result.total,
            after: result.after,
            limit: result.limit,
            remaining: result.remaining
        };
    }

    async getMemberEvents(userId: number,
                          calendarId: number,
                          startDate?: Date,
                          endDate?: Date
    ): Promise<EventParticipation[]> {
        const calendarMember: CalendarMember = await this.calendarMembersService.getCalendarMember(userId, calendarId);
        let responseStatuses;
        if (calendarMember.calendarType === CalendarType.MAIN) {
            responseStatuses = [null, ResponseStatus.ACCEPTED, ResponseStatus.DECLINED, ResponseStatus.PENDING]
        } else {
            responseStatuses = [...Object.values(ResponseStatus), null]
        }

        return this.eventParticipationsRepository.findByCalendarMemberIdAndResponseStatus(calendarMember.id, responseStatuses, startDate, endDate);
    }
}
