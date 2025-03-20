import {
    BadRequestException,
    ConflictException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import {CalendarMembersRepository} from './calendar-members.repository';
import {CalendarsRepository} from '../calendar/calendars.repository';
import {UsersService} from '../user/users.service';
import {AddMemberToCalendarDto} from './dto/add-member-to-calendar.dto';
import {UpdateMemberInCalendarDto} from './dto/update-member-in-calendar.dto';
import {CalendarMember, CalendarType} from './entity/calendar-member.entity';
import {ConfigService} from '@nestjs/config';
import {EmailService} from 'src/email/email.service';
import {JwtUtils} from 'src/jwt/jwt-token.utils';

@Injectable()
export class CalendarMembersService {
    private frontUrl: string;

    constructor(
        private readonly usersCalendarsRepository: CalendarMembersRepository,
        @Inject(forwardRef(() => CalendarsRepository))
        private readonly calendarsRepository: CalendarsRepository,
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
        private readonly emailService: EmailService,
        private readonly jwtUtils: JwtUtils,
    ) {
        this.frontUrl = String(this.configService.get<string>('app.frontendLink'));
    }

    async getUserCalendars(userId: number): Promise<CalendarMember[]> {
        const user = await this.usersService.getUserByIdWithoutPassword(userId);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.usersCalendarsRepository.findUserCalendars(userId);
    }

    async getCalendarMember(userId: number, calendarId: number): Promise<CalendarMember> {
        const result = await this.usersCalendarsRepository.findByUserAndCalendar(userId, calendarId);

        if (!result) {
            throw new NotFoundException('User does not have access to this calendar');
        }

        return result;
    }

    async getCalendarUsers(calendarId: number, requestingUserId: number): Promise<CalendarMember[]> {
        const calendar = await this.calendarsRepository.findById(calendarId);
        if (!calendar) {
            throw new NotFoundException('Calendar not found');
        }

        const isCreator = calendar.creatorId === requestingUserId;

        return this.usersCalendarsRepository.findCalendarUsers(calendarId, isCreator);
    }

    async addUserToCalendar(
        calendarId: number,
        currentUserId: number,
        dto: AddMemberToCalendarDto
    ): Promise<CalendarMember> {
        const calendar = await this.calendarsRepository.findById(calendarId);
        if (!calendar) {
            throw new NotFoundException('Calendar not found');
        }

        const currentCalendarMember = await this.usersCalendarsRepository.findByUserAndCalendar(
            currentUserId,
            calendarId
        );

        if (!currentCalendarMember) {
            throw new NotFoundException('User-calendar relationship not found');
        }

        if (currentCalendarMember.calendarType === CalendarType.MAIN
            || currentCalendarMember.calendarType === CalendarType.HOLIDAY) {
            throw new BadRequestException('Cannot invite users to your main calendar');
        }

        const userToAdd = await this.usersService.getUserByEmail(dto.userEmail);

        if (!userToAdd) {
            throw new NotFoundException(`User with email ${dto.userEmail} not found`);
        }

        if (!userToAdd.emailVerified) {
            throw new BadRequestException('User must confirm their email first');
        }

        const existingCalendarMember = await this.usersCalendarsRepository.findByUserAndCalendar(
            userToAdd.id,
            calendarId
        );

        if (existingCalendarMember) {
            throw new ConflictException('User already has access to this calendar');
        }

        const userInviter = await this.usersService.getUserByIdWithoutPassword(currentUserId);

        const AddUserToCalendarToken = this.jwtUtils.generateToken({
            sub: userToAdd.id,
            calendarId: calendarId
        }, 'confirmCalendar');

        const link = this.frontUrl + 'calendars/confirm-calendar/' + AddUserToCalendarToken;
        console.log("confirmCalendarLink: ", link);

        this.emailService.sendCalendarShareEmail(userToAdd.email, calendar.name, link, userInviter.email);

        return this.usersCalendarsRepository.createCalendarMember({
            userId: userToAdd.id,
            calendarId,
            role: dto.role,
            color: currentCalendarMember.color,
            isConfirmed: false
        });
    }

    async updateUserInCalendar(
        calendarId: number,
        userIdToUpdate: number,
        dto: UpdateMemberInCalendarDto
    ): Promise<CalendarMember> {
        const calendar = await this.calendarsRepository.findById(calendarId);
        if (!calendar) {
            throw new NotFoundException('Calendar not found');
        }

        const calendarMemberToUpdate = await this.usersCalendarsRepository.findByUserAndCalendar(
            userIdToUpdate,
            calendarId
        );

        if (!calendarMemberToUpdate) {
            throw new NotFoundException('User does not have access to this calendar');
        }

        const result = await this.usersCalendarsRepository.updateCalendarMember(
            calendarMemberToUpdate.id,
            dto
        );

        if (!result) {
            throw new NotFoundException('User not found');
        }

        return result;
    }

    async removeUserFromCalendar(
        calendarId: number,
        userIdToRemove: number
    ): Promise<void> {
        const calendar = await this.calendarsRepository.findById(calendarId);
        if (!calendar) {
            throw new NotFoundException('Calendar not found');
        }

        if (calendar.creatorId === userIdToRemove) {
            throw new BadRequestException('Cannot remove the creator from their calendar');
        }

        const calendarMemberToRemove = await this.usersCalendarsRepository.findByUserAndCalendar(
            userIdToRemove,
            calendarId
        );

        if (!calendarMemberToRemove) {
            throw new NotFoundException('User does not have access to this calendar');
        }

        await this.usersCalendarsRepository.deleteCalendarMember(calendarMemberToRemove.id);
    }

    async confirmCalendar(
        userId: number,
        calendarId: number,
    ) {
        const result = await this.usersCalendarsRepository.updateCalendarMemberByUserAndCalendar(
            userId,
            calendarId,
            {
                isConfirmed: true
            }
        );

        if (!result) {
            throw new BadRequestException("Cannot confirm the calendar")
        }

        return result;
    }
}
