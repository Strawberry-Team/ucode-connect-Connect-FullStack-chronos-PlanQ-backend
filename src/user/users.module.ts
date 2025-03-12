import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {UsersController} from './users.controller';
import {UsersService} from './users.service';
import {UsersRepository} from './users.repository';
import {User} from './entity/user.entity';
import {CountryModule} from 'src/country/country.module';
import {PasswordService} from "./passwords.service";

@Module({
    imports: [TypeOrmModule.forFeature([User]), CountryModule],
    controllers: [UsersController],
    providers: [UsersService, UsersRepository, PasswordService],
    exports: [UsersService, UsersRepository, PasswordService],
})
export class UsersModule {
}
