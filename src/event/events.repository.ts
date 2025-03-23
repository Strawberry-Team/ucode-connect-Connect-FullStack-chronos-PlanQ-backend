// src/event/events.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Event, EventType } from './entity/event.entity';

@Injectable()
export class EventsRepository {
    constructor(
        @InjectRepository(Event)
        private readonly repo: Repository<Event>,
    ) {}

    async findById(id: number): Promise<Event | null> {
        return this.repo.findOne({
            where: { id },
            relations: ['creator', 'task']
        });
    }

    async findEventWithParticipations(id: number): Promise<Event | null> {
        return this.repo.findOne({
            where: { id },
            relations: ['creator', 'task', 'participations', 'participations.calendarMember', 'participations.calendarMember.user']
        });
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
