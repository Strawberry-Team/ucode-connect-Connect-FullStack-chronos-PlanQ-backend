import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { UsersCalendarsRepository } from './users-calendars.repository';
import { CalendarsRepository } from '../calendar/calendars.repository';
import { UsersService } from '../user/users.service';
import { AddUserToCalendarDto } from './dto/add-user-to-calendar.dto';
import { UpdateUserInCalendarDto } from './dto/update-user-in-calendar.dto';
import { UserCalendar, CalendarRole } from './entity/user-calendar.entity';

@Injectable()
export class UsersCalendarsService {
    constructor(
        private readonly usersCalendarsRepository: UsersCalendarsRepository,
        @Inject(forwardRef(() => CalendarsRepository))
        private readonly calendarsRepository: CalendarsRepository,
        private readonly usersService: UsersService
    ) {}

    async getUserCalendars(userId: number): Promise<UserCalendar[]> {
        const user = await this.usersService.getUserByIdWithoutPassword(userId);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.usersCalendarsRepository.findUserCalendars(userId);
    }

    async getUserCalendar(userId: number, calendarId: number): Promise<UserCalendar> {
        const result = await this.usersCalendarsRepository.findByUserAndCalendar(userId, calendarId);

        if(!result) {
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

        if (!currentUserCalendar || currentUserCalendar.role !== CalendarRole.OWNER) {
            throw new ForbiddenException('Only the owner can add users to the calendar');
        }

        // Check if it's trying to add to a main calendar
        if (currentUserCalendar.isMain) {
            throw new BadRequestException('Cannot invite users to your main calendar');
        }

        // Find the user to add
        try {
            const userToAdd = await this.usersService.getUserByEmail(dto.userEmail);

            // Check if user is already in the calendar
            const existingUserCalendar = await this.usersCalendarsRepository.findByUserAndCalendar(
                userToAdd.id,
                calendarId
            );

            if (existingUserCalendar) {
                throw new ConflictException('User already has access to this calendar');
            }

            // Get the owner's color for this calendar
            const color = currentUserCalendar.color;

            // Create the user-calendar relationship
            return this.usersCalendarsRepository.createUserCalendar({
                userId: userToAdd.id,
                calendarId,
                isMain: false,
                role: dto.role,
                color,
                isConfirmed: false // Requires confirmation
            });
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException(`User with email ${dto.userEmail} not found`);
            }
            throw error;
        }
    }

    async updateUserInCalendar(
        calendarId: number,
        userIdToUpdate: number,
        currentUserId: number,
        dto: UpdateUserInCalendarDto
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

        if (!currentUserCalendar || currentUserCalendar.role !== CalendarRole.OWNER) {
            throw new ForbiddenException('Only the owner can update user roles');
        }

        // Get the user to update
        const userCalendarToUpdate = await this.usersCalendarsRepository.findByUserAndCalendar(
            userIdToUpdate,
            calendarId
        );

        if (!userCalendarToUpdate) {
            throw new NotFoundException('User does not have access to this calendar');
        }

        // Cannot change owner's role
        if (userCalendarToUpdate.role === CalendarRole.OWNER) {
            throw new BadRequestException('Cannot change the owner\'s role');
        }

        // Update the role
        const result = await this.usersCalendarsRepository.updateUserCalendar(
            userCalendarToUpdate.id,
            { role: dto.role }
        );

        if (!result) {
            throw new NotFoundException('User not found');
        }

        return result;
    }

    async removeUserFromCalendar(
        calendarId: number,
        userIdToRemove: number,
        currentUserId: number
    ): Promise<void> {
        // Check if calendar exists
        const calendar = await this.calendarsRepository.findById(calendarId);
        if (!calendar) {
            throw new NotFoundException('Calendar not found');
        }

        //TODO: owner нельзя удалить именно настойящего owner
        // Check if current user is the owner
        const currentUserCalendar = await this.usersCalendarsRepository.findByUserAndCalendar(
            currentUserId,
            calendarId
        );

        if (!currentUserCalendar || currentUserCalendar.role !== CalendarRole.OWNER) {
            throw new ForbiddenException('Only the owner can remove users from the calendar');
        }

        // Get the user to remove
        const userCalendarToRemove = await this.usersCalendarsRepository.findByUserAndCalendar(
            userIdToRemove,
            calendarId
        );

        if (!userCalendarToRemove) {
            throw new NotFoundException('User does not have access to this calendar');
        }

        // Cannot remove the owner
        if (userCalendarToRemove.role === CalendarRole.OWNER) {
            throw new BadRequestException('Cannot remove the owner from their calendar');
        }

        // Remove the user
        await this.usersCalendarsRepository.deleteUserCalendar(userCalendarToRemove.id);
    }
}
