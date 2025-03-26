// src/calendar-member/guards/calendar.member.removal.guard.ts
import {
    ExecutionContext,
    Injectable,
    ForbiddenException,
    BadRequestException,
    NotFoundException
} from '@nestjs/common';
import {CalendarOwnerGuard} from '../../calendar/guards/own.calendar.guard';

@Injectable()
export class CalendarMemberRemovalGuard extends CalendarOwnerGuard {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const targetUserId = parseInt(request.params.id, 10);
        const calendarId = parseInt(request.params.calendarId, 10);
        const userId = user?.userId;

        if (!user) {
            throw new BadRequestException('User not found');
        }

        const calendar = await this.calendarsService.getCalendarById(calendarId);
        if (!calendar) {
            throw new NotFoundException('Calendar not found');
        }

        if (isNaN(calendarId) || isNaN(targetUserId)) {
            throw new BadRequestException('Invalid parameters');
        }

        // Self removal case
        if (userId === targetUserId) {
            // Check if user is an owner
            if (calendar.creatorId == userId) {
                throw new ForbiddenException('Owners cannot remove themselves. Delete the calendar instead.');
            }
            return true; // Allow non-owners to remove themselves
        }

        // For removing others, use the standard owner check
        return super.canActivate(context);
    }
}