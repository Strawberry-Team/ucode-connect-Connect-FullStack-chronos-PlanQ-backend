import {IsId} from "../validators/id.validator";
import {IsISO8601Date} from "../validators/date.validator";

export class BaseCursor {
    @IsId(false, true)
    id: number;
}

export class EventCursor extends BaseCursor {
    @IsISO8601Date(false, true)
    createdAt: string;
}

export enum CursorType {
    EVENT = 'event',
}