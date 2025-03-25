// src/event-task/event-tasks.service.ts
import {Injectable} from '@nestjs/common';
import {EventTasksRepository} from './event-tasks.repository';
import {EventTask} from './entity/event-task.entity';

@Injectable()
export class EventTasksService {
    constructor(
        private readonly eventTasksRepository: EventTasksRepository
    ) {
    }

    async getEventTask(eventId: number): Promise<EventTask | null> {
        return this.eventTasksRepository.findById(eventId);
    }

    async createEventTask(data: Partial<EventTask>): Promise<EventTask> {
        return this.eventTasksRepository.createEventTask(data);
    }

    async updateEventTask(eventId: number, updateData: Partial<EventTask>): Promise<EventTask | null> {
        return this.eventTasksRepository.updateEventTask(eventId, updateData);
    }

    async deleteEventTask(eventId: number): Promise<void> {
        return this.eventTasksRepository.deleteEventTask(eventId);
    }
}
