import {Transform} from "class-transformer";
import { IsNotEmpty } from "class-validator";

export class TestDto {
    // @Transform(({value, obj}) => {
    //     console.log('Transform context endedAt:', { value, obj });
    //     return new Date(value);
    // })
    @IsNotEmpty()
    name: string;
}
