import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CalendarMember} from './entity/calendar-member.entity';
import {plainToInstance} from 'class-transformer';
import {SERIALIZATION_GROUPS, User} from 'src/user/entity/user.entity';

@Injectable()
export class CalendarMembersRepository {
    constructor(
        @InjectRepository(CalendarMember)
        private readonly repo: Repository<CalendarMember>,
    ) {
    }

    async findById(id: number): Promise<CalendarMember | null> {
        return this.repo.findOne({where: {id}});
    }

    async findByUserAndCalendar(userId: number, calendarId: number): Promise<CalendarMember | null> {
        return this.repo.findOne({
            where: {userId, calendarId},
            relations: ['calendar']
        });
    }

    async findCalendarUsers(calendarId: number, isCreator: boolean): Promise<CalendarMember[]> {
        const whereCondition: any = {calendarId};

        if (!isCreator) {
            whereCondition.isConfirmed = true;
        }

        const results = await this.repo.find({
            where: whereCondition,
            relations: ['user']
        });

        for (const result of results) {
            if (result.user) {
                result.user = plainToInstance(User, result.user, {
                    groups: SERIALIZATION_GROUPS.BASIC
                });
            }
        }

        return results;
    }

    async findUserCalendars(userId: number): Promise<CalendarMember[]> {
        return this.repo.find({
            where: {
                userId,
                isConfirmed: true
            },
            relations: ['calendar']
        });
    }

    async createCalendarMember(data: Partial<CalendarMember>): Promise<CalendarMember> {
        const calendarMember = this.repo.create(data);
        return this.repo.save(calendarMember);
    }

    async updateCalendarMember(id: number, updateData: Partial<CalendarMember>): Promise<CalendarMember | null> {
        await this.repo.update(id, updateData);
        return this.findById(id);
    }

    async updateCalendarMemberByUserAndCalendar(
        userId: number,
        calendarId: number,
        updateData: Partial<CalendarMember>
    ): Promise<CalendarMember | null> {
        const calendarMember = await this.findByUserAndCalendar(userId, calendarId);
        if (calendarMember) {
            await this.repo.update(calendarMember.id, updateData);
            return this.findById(calendarMember.id);
        }
        return null;
    }

    async deleteCalendarMember(id: number): Promise<void> {
        await this.repo.delete(id);
    }

    async deleteUserFromCalendar(userId: number, calendarId: number): Promise<void> {
        const calendarMember = await this.findByUserAndCalendar(userId, calendarId);
        if (calendarMember) {
            await this.repo.delete(calendarMember.id);
        }
    }
}
