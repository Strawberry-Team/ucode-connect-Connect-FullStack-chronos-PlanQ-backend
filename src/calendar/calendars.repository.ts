// src/calendars/calendars.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Calendar } from './entity/calendar.entity';

@Injectable()
export class CalendarsRepository {
    constructor(
        @InjectRepository(Calendar)
        private readonly repo: Repository<Calendar>,
    ) {}

    async findById(id: number): Promise<Calendar | null> {
        return this.repo.findOne({
            where: { id },
            relations: ['owner']
        });
    }

    async findByOwner(ownerId: number): Promise<Calendar[]> {
        return this.repo.find({ where: { ownerId } });
    }

    async createCalendar(data: Partial<Calendar>): Promise<Calendar> {
        const calendar = this.repo.create(data);
        return this.repo.save(calendar);
    }

    async updateCalendar(id: number, updateData: Partial<Calendar>): Promise<Calendar | null> {
        await this.repo.update(id, updateData);
        return this.findById(id);
    }

    async deleteCalendar(id: number): Promise<void> {
        await this.repo.delete(id);
    }
}
