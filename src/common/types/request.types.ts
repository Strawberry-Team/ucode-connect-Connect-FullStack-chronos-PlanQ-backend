// src/common/types/request.types.ts
import { Request } from 'express';
import { CalendarRole } from 'src/calendar-member/entity/calendar-member.entity';

export interface RequestWithUser extends Request {
    user: {
        userId: number;
        expiresIn?: number;
        createdAt?: number;
        nonce?: string;
        calendarId?: number;
    };
}