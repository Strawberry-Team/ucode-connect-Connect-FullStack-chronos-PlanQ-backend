// src/event-participation/event-participations.service.ts
import {
    BadRequestException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { EventParticipationsRepository } from './event-participations.repository';
import { EventParticipation, ResponseStatus } from './entity/event-participation.entity';
import { CreateEventParticipationDto } from './dto/create-event-participation.dto';
import { UpdateEventParticipationDto } from './dto/update-event-participation.dto';
import { CalendarMembersService } from '../calendar-member/calendar-members.service';
import { UsersService } from '../user/users.service';
import { EventsService } from '../event/events.service';
import { CalendarType } from '../calendar-member/entity/calendar-member.entity';
import { EmailService } from '../email/email.service';
import { JwtUtils } from '../jwt/jwt-token.utils';
import { ConfigService } from '@nestjs/config';

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
        // this.frontendUrl = this.configService.get<string>('app.frontendLink');
    }

    async getEventParticipation(id: number): Promise<EventParticipation> {
        const participation = await this.eventParticipationsRepository.findById(id);

        if (!participation) {
            throw new NotFoundException('Event participation not found');
        }

        return participation;
    }

    async getEventParticipationByMemberAndEvent(calendarMemberId: number, eventId: number): Promise<EventParticipation> {
        const participation = await this.eventParticipationsRepository.findByCalendarMemberAndEvent(calendarMemberId, eventId);

        if (!participation) {
            throw new NotFoundException('Event participation not found');
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

    async getMemberEvents(calendarMemberId: number): Promise<EventParticipation[]> {
        return this.eventParticipationsRepository.findByCalendarMemberId(calendarMemberId);
    }

    async createEventParticipation(data: Partial<EventParticipation>): Promise<EventParticipation> {
        return this.eventParticipationsRepository.createEventParticipation(data);
    }

    async inviteUserToEvent ( //TODO: себя приглашать. Проверять приглашен ли уже человек.
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

        if (!inviterParticipation) {
            throw new BadRequestException('Inviter is not a participant of this event');
        }

        // Get the color from creator's participation or use provided color
        const participationColor = inviterParticipation.color;

        // Check if user is already a participant
        let participation;

        if (calendarMember && calendarMember.isConfirmed) {
            try {
                participation = await this.eventParticipationsRepository.findByCalendarMemberAndEvent(
                    calendarMember.id,
                    eventId
                );
            } catch (error) {
                // Participation doesn't exist yet
            }
        }

        // Send invitation email
        try {
            const inviter = await this.usersService.getUserByIdWithoutPassword(inviterId);
            const invitedUser = await this.usersService.getUserByIdWithoutPassword(userId);

            if (!invitedUser.emailVerified) {
                throw new BadRequestException('User must verify their email first');
            }

            let participationId;

            // Create or update participation in shared calendar
            if (participation) {
                // User is already on the event, just update the status
                participation.responseStatus = ResponseStatus.INVITED;
                await this.eventParticipationsRepository.updateEventParticipation(
                    participation.id,
                    { responseStatus: ResponseStatus.INVITED }
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
                // Update status if already exists
                await this.eventParticipationsRepository.updateEventParticipation(
                    mainParticipation.id,
                    { responseStatus: ResponseStatus.INVITED }
                );
            }

            // Generate token for confirmation
            const token = this.jwtUtils.generateToken({
                sub: userId,
                // eventParticipationId: participationId
            }, 'confirmArrangement');

            const confirmLink = `${this.frontendUrl}events/${eventId}/calendar-members/${calendarMember?.id || mainCalendarMember.id}/confirm-participation/${token}`;

            // For simplicity, just log the link in dev environment
            console.log(`Confirmation link: ${confirmLink}`);

            // Get all participants for the email
            const allParticipations = await this.getEventParticipations(eventId);
            const participantEmails = await Promise.all(
                allParticipations
                    .filter(p => p.responseStatus === ResponseStatus.ACCEPTED || p.responseStatus === ResponseStatus.PENDING)
                    .map(async p => {
                        const user = await this.usersService.getUserByIdWithoutPassword(p.calendarMember.userId);
                        return user.email;
                    })
            );

            // Format date for email
            const eventDate = new Date(event.startedAt).toLocaleDateString();
            const eventTime = new Date(event.startedAt).toLocaleTimeString();

            // Send email
            await this.emailService.sendEventInvitationEmail(
                invitedUser.email,
                inviter.email,
                event.name,
                eventDate,
                eventTime,
                confirmLink,
                participantEmails
            );

            // Return the participation that was created or updated
            if (participation) {
                return participation;
            } else if (calendarMember && calendarMember.isConfirmed) {
                // return await this.eventParticipationsRepository.findByCalendarMemberAndEvent(
                //     calendarMember.id,
                //     eventId
                // );
            } else {
                // return await this.eventParticipationsRepository.findByCalendarMemberAndEvent(
                //     mainCalendarMember.id,
                //     eventId
                // );
            }

            return participation; //TODO: это неправильно
        } catch (error) {
            console.error('Failed to send invitation email', error);
            throw new BadRequestException('Failed to send invitation email');
        }
    }

    async updateEventParticipation(id: number, userId: number, dto: UpdateEventParticipationDto): Promise<EventParticipation> {
        const participation = await this.eventParticipationsRepository.findById(id);

        if (!participation) {
            throw new NotFoundException('Event participation not found');
        }

        // Check if the user owns this participation
        const calendarMember = await this.calendarMembersService.getCalendarMember(
            userId,
            participation.calendarMember.calendarId
        );

        if (!calendarMember || calendarMember.id !== participation.calendarMemberId) {
            throw new BadRequestException('You do not have permission to update this participation');
        }

        const updateData: Partial<EventParticipation> = {};

        if (dto.color !== undefined) updateData.color = dto.color;
        if (dto.responseStatus !== undefined) {
            updateData.responseStatus = dto.responseStatus;

            // If changing response status, also update in other calendars
            if (dto.responseStatus === ResponseStatus.ACCEPTED || dto.responseStatus === ResponseStatus.DECLINED) {
                await this.updateResponseStatusInAllCalendars(
                    userId,
                    participation.eventId,
                    dto.responseStatus,
                    participation.calendarMember.calendarType
                );
            }
        }

        // const updatedParticipation = await this.eventParticipationsRepository.updateEventParticipation(id, updateData);
        // return updatedParticipation;
        return participation; //TODO: это неправильно
    }

    async confirmEventParticipation(eventParticipationId: number): Promise<EventParticipation> {
        const participation = await this.eventParticipationsRepository.findById(eventParticipationId);

        if (!participation) {
            throw new NotFoundException('Event participation not found');
        }

        // Update response status to PENDING
        const updatedParticipation = await this.eventParticipationsRepository.updateEventParticipation(
            eventParticipationId,
            { responseStatus: ResponseStatus.PENDING }
        );

        // Get user's ID and calendar type
        const userId = participation.calendarMember.userId;
        const calendarType = participation.calendarMember.calendarType;

        // Update status in all related calendars
        await this.updateResponseStatusInAllCalendars(
            userId,
            participation.eventId,
            ResponseStatus.PENDING,
            calendarType
        );

        // return updatedParticipation;
        return participation; //TODO: это неправильно
    }

    private async updateResponseStatusInAllCalendars(
        userId: number,
        eventId: number,
        status: ResponseStatus,
        currentCalendarType: CalendarType
    ): Promise<void> {
        // Get all user's calendar memberships
        const calendars = await this.calendarMembersService.getUserCalendars(userId);

        if (currentCalendarType === CalendarType.MAIN) {
            // If updating from main calendar, update all other calendars
            for (const calendar of calendars) {
                if (calendar.calendarType !== CalendarType.MAIN) {
                    try {
                        const participation = await this.eventParticipationsRepository.findByCalendarMemberAndEvent(
                            calendar.id,
                            eventId
                        );

                        if (participation) {
                            await this.eventParticipationsRepository.updateEventParticipation(
                                participation.id,
                                { responseStatus: status }
                            );
                        }
                    } catch (error) {
                        // Participation doesn't exist in this calendar, that's ok
                    }
                }
            }
        } else {
            // If updating from shared calendar, update main calendar
            const mainCalendar = calendars.find(c => c.calendarType === CalendarType.MAIN);

            if (mainCalendar) {
                try {
                    const participation = await this.eventParticipationsRepository.findByCalendarMemberAndEvent(
                        mainCalendar.id,
                        eventId
                    );

                    if (participation) {
                        await this.eventParticipationsRepository.updateEventParticipation(
                            participation.id,
                            { responseStatus: status }
                        );
                    }
                } catch (error) {
                    // Participation doesn't exist in main calendar, that's ok
                }
            }
        }
    }

    async deleteEventParticipation(id: number, userId: number): Promise<void> {
        const participation = await this.eventParticipationsRepository.findById(id);

        if (!participation) {
            throw new NotFoundException('Event participation not found');
        }

        // Check if user is deleting their own participation
        const isSelfRemoval = participation.calendarMember.userId === userId;

        if (isSelfRemoval) {
            const calendarType = participation.calendarMember.calendarType;

            if (calendarType === CalendarType.MAIN) {
                // If it's main calendar, just delete the participation
                await this.eventParticipationsRepository.deleteEventParticipation(id);
            } else {
                // If it's shared calendar, set response_status to null
                await this.eventParticipationsRepository.updateEventParticipation(
                    id,
                    {
                        // responseStatus: null
                    }
                );
            }
        } else {
            // Someone else is trying to remove a user, check permissions
            const eventId = participation.eventId;
            const event = await this.eventsService.getEventByIdWithParticipations(eventId, false); //TODO: не знаем

            // Only owner, editor or creator can remove others
            if (event.creatorId === userId) {
                // Event creator can remove anyone
                const targetUserId = participation.calendarMember.userId;
                const calendarType = participation.calendarMember.calendarType;

                if (calendarType === CalendarType.MAIN) {
                    // For main calendar, find all user's participations in other calendars
                    const userCalendars = await this.calendarMembersService.getUserCalendars(targetUserId);

                    // If user is in other calendars too, set their response_status to null
                    for (const calendar of userCalendars) {
                        if (calendar.calendarType !== CalendarType.MAIN) {
                            try {
                                const otherParticipation = await this.eventParticipationsRepository.findByCalendarMemberAndEvent(
                                    calendar.id,
                                    eventId
                                );

                                if (otherParticipation) {
                                    await this.eventParticipationsRepository.updateEventParticipation(
                                        otherParticipation.id,
                                        {
                                            // responseStatus: null
                                        }
                                    );
                                }
                            } catch (error) {
                                // Participation doesn't exist, that's ok
                            }
                        }
                    }

                    // Now delete the main calendar participation
                    await this.eventParticipationsRepository.deleteEventParticipation(id);
                } else {
                    // For shared calendar, set response_status to null
                    await this.eventParticipationsRepository.updateEventParticipation(
                        id,
                        {
                            // responseStatus: null
                        }
                    );

                    // Also find and delete the main calendar participation
                    const userCalendars = await this.calendarMembersService.getUserCalendars(targetUserId);
                    const mainCalendar = userCalendars.find(c => c.calendarType === CalendarType.MAIN);

                    if (mainCalendar) {
                        try {
                            const mainParticipation = await this.eventParticipationsRepository.findByCalendarMemberAndEvent(
                                mainCalendar.id,
                                eventId
                            );

                            if (mainParticipation) {
                                await this.eventParticipationsRepository.deleteEventParticipation(mainParticipation.id);
                            }
                        } catch (error) {
                            // Main participation doesn't exist, that's ok
                        }
                    }
                }
            } else {
                throw new BadRequestException('You do not have permission to remove this participant');
            }
        }
    }
}
