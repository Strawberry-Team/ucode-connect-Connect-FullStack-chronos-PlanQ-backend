import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {UsersController} from './users.controller';
import {UsersService} from './users.service';
import {UsersRepository} from './users.repository';
import {User} from './entity/user.entity';
import {CountryModule} from 'src/country/country.module';
import {PasswordService} from "./passwords.service";
import {OwnAccountGuard} from './guards/own-account.guard';
import {CalendarsModule} from "../calendar/calendars.module";
import {UsersCalendarsModule} from "../user-calendar/users-calendars.module";


@Module({
    imports: [TypeOrmModule.forFeature([User]), CountryModule, CalendarsModule, UsersCalendarsModule],
    controllers: [UsersController],
    providers: [UsersService, UsersRepository, PasswordService, OwnAccountGuard,
    ],
    exports: [UsersService, UsersRepository, PasswordService],
})
export class UsersModule {
}
