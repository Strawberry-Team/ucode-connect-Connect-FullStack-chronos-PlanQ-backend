// src/event-participation/event-participations.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {In, Repository} from 'typeorm';
import { EventParticipation, ResponseStatus } from './entity/event-participation.entity';
import {plainToInstance} from "class-transformer";
import {SERIALIZATION_GROUPS, User} from "../user/entity/user.entity";
import {BaseRepository} from "../common/repository/base.repository";

@Injectable()
export class EventParticipationsRepository extends BaseRepository<EventParticipation> {
    constructor(
        @InjectRepository(EventParticipation)
        repo: Repository<EventParticipation>,
    ) {
        super(repo);
    }

    async findById(id: number): Promise<EventParticipation | null> {
        return this.repo.findOne({
            where: { id },
            relations: ['calendarMember', 'event']
        });
    }

    async findByCalendarMemberAndEvent(calendarMemberId: number, eventId: number): Promise<EventParticipation | null> {
        const result = await this.repo.findOne({
            where: { calendarMemberId, eventId },
            relations: ['calendarMember', 'event', 'calendarMember.user']
        });
        if (!result) {
            return null;
        }

        if (result.calendarMember.user) {
            result.calendarMember.user = plainToInstance(User, result.calendarMember.user, {groups: SERIALIZATION_GROUPS.BASIC});
        }

        return result;
    }

    async findByEventId(eventId: number): Promise<EventParticipation[] | null> {
        const result = await this.repo.find({
            where: { eventId },
            relations: ['calendarMember', 'calendarMember.user']
        });

        if (!result) {
            return null;
        }

        result.forEach(calendarMember => {
            if (calendarMember.calendarMember.user) {
                calendarMember.calendarMember.user = plainToInstance(User, calendarMember.calendarMember.user, {groups: SERIALIZATION_GROUPS.BASIC});
            }
        })

        return result;
    }

    async findByCalendarMemberId(calendarMemberId: number): Promise<EventParticipation[]> {
        return this.repo.find({
            where: { calendarMemberId },
            relations: ['event', 'event.task']
        });
    }

    async findByCalendarMemberIdAndResponseStatus(
        calendarMemberId: number,
        responseStatus: ResponseStatus[]
    ): Promise<EventParticipation[]> {
        return this.repo.find({
            where: {
                calendarMemberId,
                responseStatus: responseStatus.length === 1 ? responseStatus[0] : In(responseStatus)
            },
            relations: ['event', 'event.task']
        });
    }

    // async findEventsByUserAndName(
    //     name: string,
    //     page: number,
    //     limit: number,
    //     mainConditions: { calendarMemberIds: number[], responseStatuses: (ResponseStatus | null)[] },
    //     sharedConditions: { calendarMemberIds: number[], responseStatuses: (ResponseStatus | null)[] }
    // ): Promise<{ eventParticipations: EventParticipation[], total: number }> {
    //     // Разделяем статусы для mainConditions
    //     const mainStatusesNotNull = mainConditions.responseStatuses.filter(status => status !== null) as ResponseStatus[];
    //     const mainHasNull = mainConditions.responseStatuses.includes(null);
    //
    //     // Разделяем статусы для sharedConditions
    //     const sharedStatusesNotNull = sharedConditions.responseStatuses.filter(status => status !== null) as ResponseStatus[];
    //     const sharedHasNull = sharedConditions.responseStatuses.includes(null);
    //
    //     const queryBuilder = this.repo.createQueryBuilder('ep')
    //         .innerJoinAndSelect('ep.event', 'event')
    //         .innerJoinAndSelect('ep.calendarMember', 'calendarMember')
    //         .where(
    //             // Условие для main календарей
    //             '(ep.calendarMemberId IN (:...mainIds) AND ' +
    //             (mainStatusesNotNull.length > 0
    //                     ? `(ep.responseStatus IN (:...mainStatusesNotNull)${mainHasNull ? ' OR ep.responseStatus IS NULL' : ''})`
    //                     : (mainHasNull ? 'ep.responseStatus IS NULL' : 'FALSE')
    //             ) + ') OR ' +
    //             // Условие для shared календарей
    //             '(ep.calendarMemberId IN (:...sharedIds) AND ' +
    //             (sharedStatusesNotNull.length > 0
    //                     ? `(ep.responseStatus IN (:...sharedStatusesNotNull)${sharedHasNull ? ' OR ep.responseStatus IS NULL' : ''})`
    //                     : (sharedHasNull ? 'ep.responseStatus IS NULL' : 'FALSE')
    //             ) + ')',
    //             {
    //                 mainIds: mainConditions.calendarMemberIds.length ? mainConditions.calendarMemberIds : [0],
    //                 mainStatusesNotNull: mainStatusesNotNull,
    //                 sharedIds: sharedConditions.calendarMemberIds.length ? sharedConditions.calendarMemberIds : [0],
    //                 sharedStatusesNotNull: sharedStatusesNotNull
    //             }
    //         )
    //         .andWhere('LOWER(event.name) LIKE LOWER(:name)', { name: `%${name}%` })
    //         .orderBy('event.startedAt', 'DESC');
    //
    //     const { items, total } = await this.paginate(queryBuilder, page, limit);
    //     return { eventParticipations: items, total };
    // }

    async findEventsByUserAndNameOffset(
        name: string,
        page: number,
        limit: number,
        mainConditions: { calendarMemberIds: number[], responseStatuses: (ResponseStatus | null)[] },
        sharedConditions: { calendarMemberIds: number[], responseStatuses: (ResponseStatus | null)[] }
    ): Promise<{ eventParticipations: EventParticipation[], total: number }> {
        const mainStatusesNotNull = mainConditions.responseStatuses.filter(status => status !== null) as ResponseStatus[];
        const mainHasNull = mainConditions.responseStatuses.includes(null);
        const sharedStatusesNotNull = sharedConditions.responseStatuses.filter(status => status !== null) as ResponseStatus[];
        const sharedHasNull = sharedConditions.responseStatuses.includes(null);

        const queryBuilder = this.repo.createQueryBuilder('ep')
            .innerJoinAndSelect('ep.event', 'event')
            .innerJoinAndSelect('ep.calendarMember', 'calendarMember')
            .where(
                '(ep.calendarMemberId IN (:...mainIds) AND ' +
                (mainStatusesNotNull.length > 0
                    ? `(ep.responseStatus IN (:...mainStatusesNotNull)${mainHasNull ? ' OR ep.responseStatus IS NULL' : ''})`
                    : (mainHasNull ? 'ep.responseStatus IS NULL' : 'FALSE')) + ') OR ' +
                '(ep.calendarMemberId IN (:...sharedIds) AND ' +
                (sharedStatusesNotNull.length > 0
                    ? `(ep.responseStatus IN (:...sharedStatusesNotNull)${sharedHasNull ? ' OR ep.responseStatus IS NULL' : ''})`
                    : (sharedHasNull ? 'ep.responseStatus IS NULL' : 'FALSE')) + ')',
                {
                    mainIds: mainConditions.calendarMemberIds.length ? mainConditions.calendarMemberIds : [0],
                    mainStatusesNotNull,
                    sharedIds: sharedConditions.calendarMemberIds.length ? sharedConditions.calendarMemberIds : [0],
                    sharedStatusesNotNull
                }
            )
            .andWhere('LOWER(event.name) LIKE LOWER(:name)', { name: `%${name}%` })
            .orderBy('event.startedAt', 'DESC');

        const { items, total } = await this.paginateOffset(queryBuilder, page, limit);
        return { eventParticipations: items, total };
    }

    // Cursor-based method
    async findEventsByUserAndNameCursor(
        name: string,
        after: number | null,
        limit: number,
        mainConditions: { calendarMemberIds: number[], responseStatuses: (ResponseStatus | null)[] },
        sharedConditions: { calendarMemberIds: number[], responseStatuses: (ResponseStatus | null)[] }
    ): Promise<{ eventParticipations: EventParticipation[], nextCursor: number | null, hasMore: boolean }> {
        const mainStatusesNotNull = mainConditions.responseStatuses.filter(status => status !== null) as ResponseStatus[];
        const mainHasNull = mainConditions.responseStatuses.includes(null);
        const sharedStatusesNotNull = sharedConditions.responseStatuses.filter(status => status !== null) as ResponseStatus[];
        const sharedHasNull = sharedConditions.responseStatuses.includes(null);

        const queryBuilder = this.repo.createQueryBuilder('ep')
            .innerJoinAndSelect('ep.event', 'event')
            .innerJoinAndSelect('ep.calendarMember', 'calendarMember')
            .where(
                '(ep.calendarMemberId IN (:...mainIds) AND ' +
                (mainStatusesNotNull.length > 0
                    ? `(ep.responseStatus IN (:...mainStatusesNotNull)${mainHasNull ? ' OR ep.responseStatus IS NULL' : ''})`
                    : (mainHasNull ? 'ep.responseStatus IS NULL' : 'FALSE')) + ') OR ' +
                '(ep.calendarMemberId IN (:...sharedIds) AND ' +
                (sharedStatusesNotNull.length > 0
                    ? `(ep.responseStatus IN (:...sharedStatusesNotNull)${sharedHasNull ? ' OR ep.responseStatus IS NULL' : ''})`
                    : (sharedHasNull ? 'ep.responseStatus IS NULL' : 'FALSE')) + ')',
                {
                    mainIds: mainConditions.calendarMemberIds.length ? mainConditions.calendarMemberIds : [0],
                    mainStatusesNotNull,
                    sharedIds: sharedConditions.calendarMemberIds.length ? sharedConditions.calendarMemberIds : [0],
                    sharedStatusesNotNull
                }
            )
            .andWhere('LOWER(event.name) LIKE LOWER(:name)', { name: `%${name}%` })
            .orderBy('ep.id', 'ASC'); // Сортировка по ID для стабильности курсора

        const { items, nextCursor, hasMore } = await this.paginateCursor(queryBuilder, after, limit);
        return { eventParticipations: items, nextCursor, hasMore };
    }

    async createEventParticipation(data: Partial<EventParticipation>): Promise<EventParticipation> {
        const participation = this.repo.create(data);
        return this.repo.save(participation);
    }

    async updateEventParticipation(id: number, updateData: Partial<EventParticipation>): Promise<EventParticipation | null> {
        await this.repo.update(id, updateData);
        return this.findById(id);
    }

    async deleteEventParticipation(id: number): Promise<void> {
        await this.repo.delete(id);
    }
}
