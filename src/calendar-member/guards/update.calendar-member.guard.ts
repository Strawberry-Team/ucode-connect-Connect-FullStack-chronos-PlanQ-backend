import {Injectable} from '@nestjs/common';
import {CanActivate, ExecutionContext} from '@nestjs/common';
import {OwnCalendarMemberGuard} from './own.calendar-member.guard';
import {CalendarOwnerGuard} from '../../calendar/guards/own.calendar.guard';

@Injectable()
export class UpdateCalendarMemberGuard implements CanActivate {
    constructor(
        private ownCalendarMemberGuard: OwnCalendarMemberGuard,
        private calendarOwnerGuard: CalendarOwnerGuard
    ) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const dto = request.body;

        if (dto.role !== undefined) {
            Reflect.defineMetadata('onlyCreator', true, context.getHandler());
            return this.calendarOwnerGuard.canActivate(context);
        }

        return this.ownCalendarMemberGuard.canActivate(context);
    }
}