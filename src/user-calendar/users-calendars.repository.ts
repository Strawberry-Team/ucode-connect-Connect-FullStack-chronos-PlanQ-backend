// src/users-calendars/users-calendars.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCalendar } from './entity/user-calendar.entity';

@Injectable()
export class UsersCalendarsRepository {
    constructor(
        @InjectRepository(UserCalendar)
        private readonly repo: Repository<UserCalendar>,
    ) {}

    async findById(id: number): Promise<UserCalendar | null> {
        return this.repo.findOne({ where: { id } });
    }

    async findByUserAndCalendar(userId: number, calendarId: number): Promise<UserCalendar | null> {
        return this.repo.findOne({
            where: { userId, calendarId },
            relations: ['calendar']
        });
    }

    async findUserMainCalendar(userId: number): Promise<UserCalendar | null> {
        return this.repo.findOne({
            where: {
                userId,
                isMain: true
            },
            relations: ['calendar']
        });
    }

    async findCalendarUsers(calendarId: number): Promise<UserCalendar[]> {
        return this.repo.find({
            where: {
                calendarId,
                isConfirmed: true
            },
            relations: ['user']
        });
    }

    async findUserCalendars(userId: number): Promise<UserCalendar[]> {
        return this.repo.find({
            where: {
                userId,
                isConfirmed: true
            },
            relations: ['calendar']
        });
    }

    async createUserCalendar(data: Partial<UserCalendar>): Promise<UserCalendar> {
        const userCalendar = this.repo.create(data);
        return this.repo.save(userCalendar);
    }

    async updateUserCalendar(id: number, updateData: Partial<UserCalendar>): Promise<UserCalendar | null> {
        await this.repo.update(id, updateData);
        return this.findById(id);
    }

    async updateUserCalendarByUserAndCalendar(
        userId: number,
        calendarId: number,
        updateData: Partial<UserCalendar>
    ): Promise<UserCalendar | null> {
        const userCalendar = await this.findByUserAndCalendar(userId, calendarId);
        if (userCalendar) {
            await this.repo.update(userCalendar.id, updateData);
            return this.findById(userCalendar.id);
        }
        return null;
    }

    async deleteUserCalendar(id: number): Promise<void> {
        await this.repo.delete(id);
    }

    async deleteUserFromCalendar(userId: number, calendarId: number): Promise<void> {
        const userCalendar = await this.findByUserAndCalendar(userId, calendarId);
        if (userCalendar) {
            await this.repo.delete(userCalendar.id);
        }
    }
}
