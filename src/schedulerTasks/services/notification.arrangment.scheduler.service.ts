// src/schedulerTasks/services/notification.arrangment.scheduler.service.ts
import { Injectable } from '@nestjs/common';
import { Cron, Timeout } from '@nestjs/schedule';
import { EventsService } from '../../event/events.service';
import { EmailService } from '../../email/email.service';
import { EventType } from '../../event/entity/event.entity';
import { ResponseStatus } from '../../event-participation/entity/event-participation.entity';
import { SchedulerConfig } from '../../config/scheduler.config';
import { CalendarType } from "../../calendar-member/entity/calendar-member.entity";

@Injectable()
export class ArrangementSchedulerService {
    constructor(
        private readonly eventsService: EventsService,
        private readonly emailService: EmailService,
    ) {
    }


    @Timeout(10000)
    @Cron(SchedulerConfig.prototype.checkArrangements)
    async checkArrangements() {
        try {
            const now = new Date(Date.UTC(
                new Date().getUTCFullYear(),
                new Date().getUTCMonth(),
                new Date().getUTCDate(),
                new Date().getUTCHours(),
                new Date().getUTCMinutes(),
                new Date().getUTCSeconds()
            ));
            const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
            const endTime = new Date(thirtyMinutesFromNow.getTime() + 59000);

            const arrangements = await this.eventsService.getEventsByStartTimeAndType(
                EventType.ARRANGEMENT,
                thirtyMinutesFromNow,
                endTime,
            );

            console.log(`Found ${arrangements.length} arrangements to process`);

            for (const arrangement of arrangements) {
                const event = await this.eventsService.getEventByIdWithParticipations(
                    arrangement.id,
                    false
                );

                const eventTime = event.startedAt.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'UTC',
                });

                const processedEmails = new Set<string>();

                const relevantParticipations = event.participations
                    .filter(p =>
                        p.responseStatus === ResponseStatus.ACCEPTED ||
                        p.responseStatus === ResponseStatus.PENDING
                    );

                for (const participation of relevantParticipations) {
                    const user = participation.calendarMember.user;
                    const email = user.email;
                    const calendarType = participation.calendarMember.calendarType;

                    if (calendarType === CalendarType.MAIN) continue;
                    if (processedEmails.has(email)) continue;

                    processedEmails.add(email);

                    const calendarName = participation.calendarMember.calendar.name;

                    await this.emailService.sendEventReminderEmail(
                        email,
                        event.name,
                        calendarName,
                        eventTime
                    );
                }

                for (const participation of relevantParticipations) {
                    const user = participation.calendarMember.user;
                    const email = user.email;
                    const calendarType = participation.calendarMember.calendarType;

                    if (calendarType !== CalendarType.MAIN) continue;
                    if (processedEmails.has(email)) continue;

                    processedEmails.add(email);

                    const calendarName = participation.calendarMember.calendar.name;

                    await this.emailService.sendEventReminderEmail(
                        email,
                        event.name,
                        calendarName,
                        eventTime
                    );
                }
            }
        } catch (error) {
            console.error(`Error in arrangement scheduler: ${error.message}`);
        }
    }
}
