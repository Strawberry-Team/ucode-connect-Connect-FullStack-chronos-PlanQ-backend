// calendar/calendars.repository.ts

import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Calendar} from './entity/calendar.entity';
import {SERIALIZATION_GROUPS, User} from "../user/entity/user.entity";
import {plainToInstance} from "class-transformer";

@Injectable()
export class CalendarsRepository {
    constructor(
        @InjectRepository(Calendar)
        private readonly repo: Repository<Calendar>,
    ) {
    }

    async findById(id: number): Promise<Calendar | null> {
        const result = await this.repo.findOne({
            where: {id},
            relations: ['creator']
        });

        if (!result) {
            return null;
        }

        if (result.creator) {
            result.creator = plainToInstance(User, result.creator, {groups: SERIALIZATION_GROUPS.BASIC});
        }

        return result;
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
