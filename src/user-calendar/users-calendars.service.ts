import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
    Inject,
    forwardRef
} from '@nestjs/common';
import {UsersCalendarsRepository} from './users-calendars.repository';
import {CalendarsRepository} from '../calendar/calendars.repository';
import {UsersService} from '../user/users.service';
import {AddUserToCalendarDto} from './dto/add-user-to-calendar.dto';
import {UpdateUserInCalendarDto} from './dto/update-user-in-calendar.dto';
import {UserCalendar} from './entity/user-calendar.entity';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'src/email/email.service';
import { JwtUtils } from 'src/jwt/jwt-token.utils';

@Injectable()
export class UsersCalendarsService {
    private frontUrl: string;

    constructor(
        private readonly usersCalendarsRepository: UsersCalendarsRepository,
        @Inject(forwardRef(() => CalendarsRepository))
        private readonly calendarsRepository: CalendarsRepository,
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
        private readonly emailService: EmailService,
        private readonly jwtUtils: JwtUtils,
    ) {
        this.frontUrl = String(this.configService.get<string>('app.frontendLink'));
    }

    async getUserCalendars(userId: number): Promise<UserCalendar[]> {
        const user = await this.usersService.getUserByIdWithoutPassword(userId);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.usersCalendarsRepository.findUserCalendars(userId);
    }

    async getUserCalendar(userId: number, calendarId: number): Promise<UserCalendar> {
        const result = await this.usersCalendarsRepository.findByUserAndCalendar(userId, calendarId);

        if (!result) {
            throw new NotFoundException('User does not have access to this calendar');
        }

        return result;
    }

    async getCalendarUsers(calendarId: number, requestingUserId: number): Promise<UserCalendar[]> {
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
        dto: AddUserToCalendarDto
    ): Promise<UserCalendar> {
        const calendar = await this.calendarsRepository.findById(calendarId);
        if (!calendar) {
            throw new NotFoundException('Calendar not found');
        }

        const currentUserCalendar = await this.usersCalendarsRepository.findByUserAndCalendar(
            currentUserId,
            calendarId
        );

        if (!currentUserCalendar) {
            throw new NotFoundException('User-calendar relationship not found');
        }

        if (currentUserCalendar.isMain) {
            throw new BadRequestException('Cannot invite users to your main calendar');
        }

        const userToAdd = await this.usersService.getUserByEmail(dto.userEmail);

        if (!userToAdd) {
            throw new NotFoundException(`User with email ${dto.userEmail} not found`);
        }

        if (!userToAdd.emailVerified) {
            throw new BadRequestException('User must confirm their email first');
        }

        const existingUserCalendar = await this.usersCalendarsRepository.findByUserAndCalendar(
            userToAdd.id,
            calendarId
        );

        if (existingUserCalendar) {
            throw new ConflictException('User already has access to this calendar');
        }

        const userInviter = await this.usersService.getUserByIdWithoutPassword(currentUserId);

        const AddUserToCalendarToken = this.jwtUtils.generateToken({sub: userToAdd.id, calendarId: calendarId}, 'confirmCalendar');

        const link = this.frontUrl + 'calendars/confirm-calendar/' + AddUserToCalendarToken;
        console.log("confirmCalendarLink: ", link); 

        this.emailService.sendCalendarShareEmail(userToAdd.email, calendar.name, link, userInviter.email); 

        return this.usersCalendarsRepository.createUserCalendar({
            userId: userToAdd.id,
            calendarId,
            isMain: false,
            role: dto.role,
            color: currentUserCalendar.color,
            isConfirmed: false
        });
    }

    async updateUserInCalendar(
        calendarId: number,
        userIdToUpdate: number,
        dto: UpdateUserInCalendarDto
    ): Promise<UserCalendar> {
        const calendar = await this.calendarsRepository.findById(calendarId);
        if (!calendar) {
            throw new NotFoundException('Calendar not found');
        }

        const userCalendarToUpdate = await this.usersCalendarsRepository.findByUserAndCalendar(
            userIdToUpdate,
            calendarId
        );

        if (!userCalendarToUpdate) {
            throw new NotFoundException('User does not have access to this calendar');
        }

        const updateData = dto.role !== undefined ? {role: dto.role} : {color: dto.color};

        const result = await this.usersCalendarsRepository.updateUserCalendar(
            userCalendarToUpdate.id,
            updateData
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

        const userCalendarToRemove = await this.usersCalendarsRepository.findByUserAndCalendar(
            userIdToRemove,
            calendarId
        );

        if (!userCalendarToRemove) {
            throw new NotFoundException('User does not have access to this calendar');
        }

        await this.usersCalendarsRepository.deleteUserCalendar(userCalendarToRemove.id);
    }

    async confirmCalendar(
        userId: number,
        calendarId: number,
    ) {
        const result = await this.usersCalendarsRepository.updateUserCalendarByUserAndCalendar(
            userId,
            calendarId,
            {
                isConfirmed: true
            }
        );

        if (!result){
            throw new BadRequestException("Cannot confirm the calendar")
        }

        return result;
    }
}
