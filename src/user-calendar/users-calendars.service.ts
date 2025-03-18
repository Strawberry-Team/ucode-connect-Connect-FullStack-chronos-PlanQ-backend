import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    ConflictException,
    Inject,
    forwardRef
} from '@nestjs/common';
import {UsersCalendarsRepository} from './users-calendars.repository';
import {CalendarsRepository} from '../calendar/calendars.repository';
import {UsersService} from '../user/users.service';
import {AddUserToCalendarDto} from './dto/add-user-to-calendar.dto';
import {UpdateUserInCalendarDto} from './dto/update-user-in-calendar.dto';
import {UserCalendar, CalendarRole} from './entity/user-calendar.entity';

@Injectable()
export class UsersCalendarsService {
    constructor(
        private readonly usersCalendarsRepository: UsersCalendarsRepository,
        @Inject(forwardRef(() => CalendarsRepository))
        private readonly calendarsRepository: CalendarsRepository,
        private readonly usersService: UsersService
    ) {
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
        // Check if calendar exists
        // await this.getCalendarById(calendarId);
        const calendar = await this.calendarsRepository.findById(calendarId);
        if (!calendar) {
            throw new NotFoundException('Calendar not found');
        }

        const currentUserCalendar = await this.usersCalendarsRepository.findByUserAndCalendar(
            requestingUserId,
            calendarId
        );

        const isOwner = (currentUserCalendar?.role === CalendarRole.OWNER) ||
            (calendar.ownerId === requestingUserId);

        return this.usersCalendarsRepository.findCalendarUsers(calendarId, isOwner);
    }

    async addUserToCalendar(
        calendarId: number,
        currentUserId: number,
        dto: AddUserToCalendarDto
    ): Promise<UserCalendar> {
        // Check if calendar exists
        const calendar = await this.calendarsRepository.findById(calendarId);
        if (!calendar) {
            throw new NotFoundException('Calendar not found');
        }

        // Check if current user is the owner
        const currentUserCalendar = await this.usersCalendarsRepository.findByUserAndCalendar(
            currentUserId,
            calendarId
        );

        if (!currentUserCalendar) {
            throw new NotFoundException('User-calendar relationship not found');
        }

        // Check if it's trying to add to a main calendar
        if (Boolean(currentUserCalendar.isMain[0])) {
            throw new BadRequestException('Cannot invite users to your main calendar');
        }

        // Find the user to add
        const userToAdd = await this.usersService.getUserByEmail(dto.userEmail);

        if (!userToAdd) {
            throw new NotFoundException(`User with email ${dto.userEmail} not found`);
        }

        if (userToAdd.emailVerified) {
            throw new BadRequestException('User must confirm their email first');
        }

        // Check if user is already in the calendar
        const existingUserCalendar = await this.usersCalendarsRepository.findByUserAndCalendar(
            userToAdd.id,
            calendarId
        );

        if (existingUserCalendar) {
            throw new ConflictException('User already has access to this calendar');
        }

        // Create the user-calendar relationship
        return this.usersCalendarsRepository.createUserCalendar({
            userId: userToAdd.id,
            calendarId,
            isMain: false,
            role: dto.role,
            color: currentUserCalendar.color,
            isConfirmed: false // Requires confirmation
        });
        //TODO: сделать отправку почты
    }

    async updateUserInCalendar(
        calendarId: number,
        userIdToUpdate: number,
        dto: UpdateUserInCalendarDto
    ): Promise<UserCalendar> {
        // Check if calendar exists
        const calendar = await this.calendarsRepository.findById(calendarId);
        if (!calendar) {
            throw new NotFoundException('Calendar not found');
        }

        // Get the user to update
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
        // Check if calendar exists
        const calendar = await this.calendarsRepository.findById(calendarId);
        if (!calendar) {
            throw new NotFoundException('Calendar not found');
        }

        if (calendar.ownerId === userIdToRemove) {
            throw new BadRequestException('Cannot remove the creator from their calendar');
        }

        // Get the user to remove
        const userCalendarToRemove = await this.usersCalendarsRepository.findByUserAndCalendar(
            userIdToRemove,
            calendarId
        );

        if (!userCalendarToRemove) {
            throw new NotFoundException('User does not have access to this calendar');
        }

        // Remove the user
        await this.usersCalendarsRepository.deleteUserCalendar(userCalendarToRemove.id);
    }
}
