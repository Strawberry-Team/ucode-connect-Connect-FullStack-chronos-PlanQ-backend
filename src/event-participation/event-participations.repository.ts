// src/event-participation/event-participations.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {In, Repository} from 'typeorm';
import { EventParticipation, ResponseStatus } from './entity/event-participation.entity';
import {plainToInstance} from "class-transformer";
import {SERIALIZATION_GROUPS, User} from "../user/entity/user.entity";

@Injectable()
export class EventParticipationsRepository {
    constructor(
        @InjectRepository(EventParticipation)
        private readonly repo: Repository<EventParticipation>,
    ) {}

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
