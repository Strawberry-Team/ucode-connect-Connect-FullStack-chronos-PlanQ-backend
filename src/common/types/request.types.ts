// src/common/types/request.types.ts
import { Request } from 'express';
import { CalendarRole } from 'src/user-calendar/entity/user-calendar.entity';

export interface RequestWithUser extends Request {
    user: {
        userId: number;
        expiresIn?: number;
        createdAt?: number;
        nonce?: string;
    };
}