// src/event/events.repository.ts
import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository, Between} from 'typeorm';
import {Event, EventType} from './entity/event.entity';
import {plainToInstance} from "class-transformer";
import {SERIALIZATION_GROUPS, User} from "../user/entity/user.entity";
import {ResponseStatus} from "../event-participation/entity/event-participation.entity";

@Injectable()
export class EventsRepository {
    constructor(
        @InjectRepository(Event)
        private readonly repo: Repository<Event>,
    ) {
    }

    async findById(id: number): Promise<Event | null> {
        const result = await this.repo.findOne({
            where: {id},
            relations: ['creator', 'task']
        });

        if (!result) {
            return null;
        }

        if (result.creator) {
            result.creator = plainToInstance(User, result.creator, {groups: SERIALIZATION_GROUPS.BASIC});
        }

        return result;
    }

    async findEventWithParticipations(id: number, isResponseStatusNull: boolean): Promise<Event | null> {
        const result = await this.repo.findOne({
            where: {id},
            relations: ['creator', 'task', 'participations', 'participations.calendarMember', 'participations.calendarMember.user']
        });

        if (!result) {
            return null;
        }

        if (result.creator) {
            result.creator = plainToInstance(User, result.creator, {groups: SERIALIZATION_GROUPS.BASIC});
        }

        if (!isResponseStatusNull) {
            result.participations.filter(participation => {
                return participation.responseStatus !== null;
            })
        }

        result.participations.forEach(participation => {
            if (participation.calendarMember.user) {
                participation.calendarMember.user = plainToInstance(User, participation.calendarMember.user, {groups: SERIALIZATION_GROUPS.BASIC});
            }
        })

        return result;
    }

    async findEventsByType(type: EventType, startDate: Date): Promise<Event[]> {
        return this.repo.find({
            where: {
                type,
                startedAt: Between(
                    startDate,
                    new Date(startDate.getTime() + 24 * 60 * 60 * 1000) // Next 24 hours
                )
            }
        });
    }

    // Add to EventParticipationsRepository
    // async findByCalendarMemberIdWithNameFilter(
    //     calendarMemberId: number,
    //     calendarType: CalendarType,
    //     name: string
    // ): Promise<EventParticipation[]> {
    //     const queryBuilder = this.repo.createQueryBuilder('participation')
    //         .innerJoinAndSelect('participation.event', 'event')
    //         .innerJoinAndSelect('participation.calendarMember', 'calendarMember')
    //         .leftJoinAndSelect('event.task', 'task')
    //         .where('participation.calendarMemberId = :calendarMemberId', { calendarMemberId });
    //
    //     // Search for name anywhere in the event name
    //     if (name && name.trim()) {
    //         queryBuilder.andWhere('LOWER(event.name) LIKE LOWER(:name)', { name: `%${name}%` });
    //     }
    //
    //     // Filter by status based on calendar type
    //     if (calendarType === CalendarType.MAIN) {
    //         queryBuilder.andWhere(
    //             '(participation.responseStatus IS NULL OR participation.responseStatus IN (:...statuses))',
    //             { statuses: [ResponseStatus.ACCEPTED, ResponseStatus.DECLINED, ResponseStatus.PENDING] }
    //         );
    //     }
    //
    //     return queryBuilder.getMany();
    // }

    async createEvent(data: Partial<Event>): Promise<Event> {
        const event = this.repo.create(data);
        return this.repo.save(event);
    }

    async updateEvent(id: number, updateData: Partial<Event>): Promise<Event | null> {
        await this.repo.update(id, updateData);
        return this.findById(id);
    }

    async deleteEvent(id: number): Promise<void> {
        await this.repo.delete(id);
    }
}
