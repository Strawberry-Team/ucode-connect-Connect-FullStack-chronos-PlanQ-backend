// src/common/types/request.types.ts
import { Request } from 'express';

export interface RequestWithUser extends Request {
    user: {
        userId: number;
        expiresIn?: number;
        createdAt?: number;
    };
}