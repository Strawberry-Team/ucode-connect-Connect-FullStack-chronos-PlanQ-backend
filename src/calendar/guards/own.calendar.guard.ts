import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
    NotFoundException,
    BadRequestException,
    SetMetadata
} from '@nestjs/common';
import { CalendarsService } from '../calendars.service';
import {CalendarMembersRepository} from "../../calendar-member/calendar-members.repository";
import {CalendarRole} from "../../calendar-member/entity/calendar-member.entity";
import {Reflector} from "@nestjs/core";

export const ONLY_CREATOR = 'onlyCreator';
export const OnlyCreator = (check: boolean) => SetMetadata(ONLY_CREATOR, check);

@Injectable()
export class CalendarOwnerGuard implements CanActivate {
    constructor(
        protected readonly calendarsService: CalendarsService,
        private readonly usersCalendarsRepository: CalendarMembersRepository, //TODO: использовать сервис
        private readonly reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const calendarId: number = parseInt(request.params.calendarId, 10) || parseInt(request.params.id, 10) ;
        const userId = user?.userId;

        if (!user){
            throw new BadRequestException('User not found');
        }

        if (isNaN(calendarId)) {
            throw new BadRequestException('calendarId must be a number');
        }

        const calendar = await this.calendarsService.getCalendarById(calendarId);
        if (!calendar) {
            throw new NotFoundException('Calendar not found');
        }

        const onlyCreator = this.reflector.getAllAndOverride<boolean>(
            ONLY_CREATOR,
            [context.getHandler(), context.getClass()]
        );

        if (calendar.creatorId == userId) {
            return true;
        }

        if (onlyCreator) {
            throw new ForbiddenException('Only the direct creator can perform this action');
        }

        const calendarMember = await this.usersCalendarsRepository.findByUserAndCalendar(userId, calendarId);
        if (calendarMember && calendarMember.role === CalendarRole.OWNER) {
            return true;
        }

        throw new ForbiddenException('You do not have permission to modify this calendar');
    }
}