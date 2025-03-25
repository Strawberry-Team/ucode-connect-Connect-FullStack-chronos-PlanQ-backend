// calendar-member/dto/get-member-events.dto.ts
import {IsISO8601Date} from "../../common/validators/date.validator";

export class GetMemberEventsDto {
    @IsISO8601Date(true)
    startDate?: string;

    @IsISO8601Date(true)
    endDate?: string;
}