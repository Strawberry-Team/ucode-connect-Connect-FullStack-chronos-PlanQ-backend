// src/event-participation/event-participations.repository.ts
import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {In, Repository} from 'typeorm';
import {EventParticipation, ResponseStatus} from './entity/event-participation.entity';
import {plainToInstance} from "class-transformer";
import {SERIALIZATION_GROUPS, User} from "../user/entity/user.entity";
import {BaseRepository} from "../common/repository/base.repository";
import {calculateOffsetPaginationMetadata} from "../common/utils/offset.pagination.utils";
import {EventCursor} from "../common/types/cursor.pagination.types";

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
            where: {id},
            relations: ['calendarMember', 'event']
        });
    }

    async findByCalendarMemberAndEvent(calendarMemberId: number, eventId: number): Promise<EventParticipation | null> {
        const result = await this.repo.findOne({
            where: {calendarMemberId, eventId},
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
            where: {eventId},
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
            where: {calendarMemberId},
            relations: ['event', 'event.task']
        });
    }

    // async findByCalendarMemberIdAndResponseStatus(
    //     calendarMemberId: number,
    //     responseStatus: ResponseStatus[]
    // ): Promise<EventParticipation[]> {
    //     return this.repo.find({
    //         where: {
    //             calendarMemberId,
    //             responseStatus: responseStatus.length === 1 ? responseStatus[0] : In(responseStatus)
    //         },
    //         relations: ['event', 'event.task']
    //     });
    // }

    // async findByCalendarMemberIdAndResponseStatus(
    //     calendarMemberId: number,
    //     responseStatuses: (ResponseStatus | null)[]
    // ): Promise<EventParticipation[]> {
    //     // Separate null and non-null statuses
    //     const statusesNotNull = responseStatuses.filter(status => status !== null) as ResponseStatus[];
    //     const hasNull = responseStatuses.includes(null);
    //
    //     const queryBuilder = this.repo.createQueryBuilder('ep')
    //         .innerJoinAndSelect('ep.event', 'event')
    //         .leftJoinAndSelect('event.task', 'task')
    //         .where('ep.calendarMemberId = :calendarMemberId', { calendarMemberId });
    //
    //     // Handle both null and non-null status conditions
    //     if (statusesNotNull.length > 0 && hasNull) {
    //         queryBuilder.andWhere('(ep.responseStatus IN (:...statusesNotNull) OR ep.responseStatus IS NULL)', {
    //             statusesNotNull
    //         });
    //     } else if (statusesNotNull.length > 0) {
    //         queryBuilder.andWhere('ep.responseStatus IN (:...statusesNotNull)', {
    //             statusesNotNull
    //         });
    //     } else if (hasNull) {
    //         queryBuilder.andWhere('ep.responseStatus IS NULL');
    //     }
    //
    //     return queryBuilder.getMany();
    // }

    async findByCalendarMemberIdAndResponseStatus(
        calendarMemberId: number,
        responseStatuses: (ResponseStatus | null)[],
        startDate?: Date,
        endDate?: Date
    ): Promise<EventParticipation[]> {
        // Separate null and non-null statuses
        const statusesNotNull = responseStatuses.filter(status => status !== null) as ResponseStatus[];
        const hasNull = responseStatuses.includes(null);

        const queryBuilder = this.repo.createQueryBuilder('ep')
            .innerJoinAndSelect('ep.event', 'event')
            .leftJoinAndSelect('event.task', 'task')
            .where('ep.calendarMemberId = :calendarMemberId', {calendarMemberId});

        // Handle both null and non-null status conditions
        if (statusesNotNull.length > 0 && hasNull) {
            queryBuilder.andWhere('(ep.responseStatus IN (:...statusesNotNull) OR ep.responseStatus IS NULL)', {
                statusesNotNull
            });
        } else if (statusesNotNull.length > 0) {
            queryBuilder.andWhere('ep.responseStatus IN (:...statusesNotNull)', {
                statusesNotNull
            });
        } else if (hasNull) {
            queryBuilder.andWhere('ep.responseStatus IS NULL');
        }

        // Add date filtering if dates are provided
        if (startDate && endDate) {
            queryBuilder.andWhere(
                '(event.startedAt <= :endDate AND event.endedAt >= :startDate)',
                {startDate, endDate}
            );
        } else if (startDate) {
            queryBuilder.andWhere('event.endedAt >= :startDate', {startDate});
        } else if (endDate) {
            queryBuilder.andWhere('event.startedAt <= :endDate', {endDate});
        }

        return queryBuilder.getMany();
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

    private buildQueryBuilder(
        name: string,
        mainConditions: { calendarMemberIds: number[], responseStatuses: (ResponseStatus | null)[] },
        sharedConditions: { calendarMemberIds: number[], responseStatuses: (ResponseStatus | null)[] }
    ) {
        const mainStatusesNotNull = mainConditions.responseStatuses.filter(status => status !== null) as ResponseStatus[];
        const mainHasNull = mainConditions.responseStatuses.includes(null);
        const sharedStatusesNotNull = sharedConditions.responseStatuses.filter(status => status !== null) as ResponseStatus[];
        const sharedHasNull = sharedConditions.responseStatuses.includes(null);

        return this.repo.createQueryBuilder('ep')
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
            .andWhere('LOWER(event.name) LIKE LOWER(:name)', {name: `%${name}%`})
            .orderBy('event.created_at', 'DESC')
            .addOrderBy('ep.id', 'ASC');
    }

    async findEventsByUserAndNameOffset(
        name: string,
        page: number,
        limit: number,
        mainConditions: { calendarMemberIds: number[], responseStatuses: (ResponseStatus | null)[] },
        sharedConditions: { calendarMemberIds: number[], responseStatuses: (ResponseStatus | null)[] }
    ): Promise<{
        eventParticipations: EventParticipation[],
        total: number,
        totalPages: number,
        page: number,
        limit: number
    }> {
        const queryBuilder = this.buildQueryBuilder(name, mainConditions, sharedConditions);

        // const mainStatusesNotNull = mainConditions.responseStatuses.filter(status => status !== null) as ResponseStatus[];
        // const mainHasNull = mainConditions.responseStatuses.includes(null);
        // const sharedStatusesNotNull = sharedConditions.responseStatuses.filter(status => status !== null) as ResponseStatus[];
        // const sharedHasNull = sharedConditions.responseStatuses.includes(null);

        // const queryBuilder = this.repo.createQueryBuilder('ep')
        //     .innerJoinAndSelect('ep.event', 'event')
        //     .innerJoinAndSelect('ep.calendarMember', 'calendarMember')
        //     .where(
        //         '(ep.calendarMemberId IN (:...mainIds) AND ' +
        //         (mainStatusesNotNull.length > 0
        //             ? `(ep.responseStatus IN (:...mainStatusesNotNull)${mainHasNull ? ' OR ep.responseStatus IS NULL' : ''})`
        //             : (mainHasNull ? 'ep.responseStatus IS NULL' : 'FALSE')) + ') OR ' +
        //         '(ep.calendarMemberId IN (:...sharedIds) AND ' +
        //         (sharedStatusesNotNull.length > 0
        //             ? `(ep.responseStatus IN (:...sharedStatusesNotNull)${sharedHasNull ? ' OR ep.responseStatus IS NULL' : ''})`
        //             : (sharedHasNull ? 'ep.responseStatus IS NULL' : 'FALSE')) + ')',
        //         {
        //             mainIds: mainConditions.calendarMemberIds.length ? mainConditions.calendarMemberIds : [0],
        //             mainStatusesNotNull,
        //             sharedIds: sharedConditions.calendarMemberIds.length ? sharedConditions.calendarMemberIds : [0],
        //             sharedStatusesNotNull
        //         }
        //     )
        //     .andWhere('LOWER(event.name) LIKE LOWER(:name)', {name: `%${name}%`})
        //     .orderBy('event.startedAt', 'DESC')
        //     .addOrderBy('ep.id', 'ASC');

        const {items, total} = await this.paginateOffset(queryBuilder, page, limit);

        const paginationMetadata = calculateOffsetPaginationMetadata(total, limit, page);
        return {eventParticipations: items, ...paginationMetadata};
    }

    // Cursor-based method
    async findEventsByUserAndNameCursor(
        name: string,
        after: EventCursor | null,
        limit: number,
        mainConditions: { calendarMemberIds: number[], responseStatuses: (ResponseStatus | null)[] },
        sharedConditions: { calendarMemberIds: number[], responseStatuses: (ResponseStatus | null)[] }
    ): Promise<{
        eventParticipations: EventParticipation[],
        nextCursor: EventCursor | null,
        hasMore: boolean,
        total: number,
        after: EventCursor | null,
        limit: number,
        remaining: number
    }> {
        const queryBuilder = this.buildQueryBuilder(name, mainConditions, sharedConditions);

        // const mainStatusesNotNull = mainConditions.responseStatuses.filter(status => status !== null) as ResponseStatus[];
        // const mainHasNull = mainConditions.responseStatuses.includes(null);
        // const sharedStatusesNotNull = sharedConditions.responseStatuses.filter(status => status !== null) as ResponseStatus[];
        // const sharedHasNull = sharedConditions.responseStatuses.includes(null);

        // const queryBuilder = this.repo.createQueryBuilder('ep')
        //     .innerJoinAndSelect('ep.event', 'event')
        //     .innerJoinAndSelect('ep.calendarMember', 'calendarMember')
        //     .where(
        //         '(ep.calendarMemberId IN (:...mainIds) AND ' +
        //         (mainStatusesNotNull.length > 0
        //             ? `(ep.responseStatus IN (:...mainStatusesNotNull)${mainHasNull ? ' OR ep.responseStatus IS NULL' : ''})`
        //             : (mainHasNull ? 'ep.responseStatus IS NULL' : 'FALSE')) + ') OR ' +
        //         '(ep.calendarMemberId IN (:...sharedIds) AND ' +
        //         (sharedStatusesNotNull.length > 0
        //             ? `(ep.responseStatus IN (:...sharedStatusesNotNull)${sharedHasNull ? ' OR ep.responseStatus IS NULL' : ''})`
        //             : (sharedHasNull ? 'ep.responseStatus IS NULL' : 'FALSE')) + ')',
        //         {
        //             mainIds: mainConditions.calendarMemberIds.length ? mainConditions.calendarMemberIds : [0],
        //             mainStatusesNotNull,
        //             sharedIds: sharedConditions.calendarMemberIds.length ? sharedConditions.calendarMemberIds : [0],
        //             sharedStatusesNotNull
        //         }
        //     )
        //     .andWhere('LOWER(event.name) LIKE LOWER(:name)', {name: `%${name}%`})
        //     .orderBy('event.created_at', 'DESC')
        //     .addOrderBy('ep.id', 'ASC');

        // Сортировка по ID для стабильности курсора

        const result = await this.paginateCursor<EventCursor>(
            queryBuilder,
            after,
            limit,
            {
                cursorFields: ['created_at', 'id'], // В порядке важности для сортировки
                entityAliases: {
                    'created_at': 'event',
                    'id': 'ep'
                }
            }
        );

        return {
            eventParticipations: result.items,
            nextCursor: result.nextCursor,
            hasMore: result.hasMore,
            total: result.total,
            after,
            limit,
            remaining: result.remaining
        };

        // const { items, nextCursor, hasMore, total, remaining } = await this.paginateCursor(queryBuilder, after, limit);
        // return { eventParticipations: items, nextCursor, hasMore, total, after, limit, remaining };
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
