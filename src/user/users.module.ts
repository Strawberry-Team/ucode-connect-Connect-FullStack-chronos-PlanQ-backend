import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {UsersController} from './users.controller';
import {UsersService} from './users.service';
import {UsersRepository} from './users.repository';
import {User} from './entity/user.entity';
import {CountryModule} from 'src/country/country.module';
import {PasswordService} from "./passwords.service";
// import { OwnAccountStrategy } from './strategies/own-account.strategy';
import { OwnAccountGuard } from './guards/own-account.guards';

@Module({
    imports: [TypeOrmModule.forFeature([User]), CountryModule],
    controllers: [UsersController],
    providers: [UsersService, UsersRepository, PasswordService, OwnAccountGuard],
    exports: [UsersService, UsersRepository, PasswordService],
})
export class UsersModule {
}
