// src/event-task/event-tasks.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventTask } from './entity/event-task.entity';

@Injectable()
export class EventTasksRepository {
    constructor(
        @InjectRepository(EventTask)
        private readonly repo: Repository<EventTask>,
    ) {}

    async findById(eventId: number): Promise<EventTask | null> {
        return this.repo.findOne({
            where: { eventId },
            relations: ['event']
        });
    }

    async createEventTask(data: Partial<EventTask>): Promise<EventTask> {
        const eventTask = this.repo.create(data);
        return this.repo.save(eventTask);
    }

    async updateEventTask(eventId: number, updateData: Partial<EventTask>): Promise<EventTask | null> {
        await this.repo.update(eventId, updateData);
        return this.findById(eventId);
    }

    async deleteEventTask(eventId: number): Promise<void> {
        await this.repo.delete(eventId);
    }
}
