import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Cron} from '@nestjs/schedule';
import {convertToSeconds} from 'src/common/utils/time.utils';
import {User} from 'src/user/entity/user.entity';
import {UsersService} from 'src/user/users.service';
import {SchedulerConfig} from '../../config/scheduler.config';

@Injectable()
export class NotificationSchedulerService {
    constructor(
        private readonly usersService: UsersService,
        private configService: ConfigService,
    ) {
    }

    @Cron(SchedulerConfig.prototype.unactivatedAccountNotification)
    async unactivatedAccountNotification() {
        const EXPIRATION_TIME = convertToSeconds(String(this.configService.get<string>(`jwt.expiresIn.confirmEmail`)));
        console.log("EXPIRATION_DAYS = ", EXPIRATION_TIME)
        const users: User[] = await this.usersService.getAllUnactivatedUsers(EXPIRATION_TIME);
        const now = new Date();

        if (users.length > 0) {
            await Promise.all(users.map(user =>
                this.usersService.deleteUser(user.id)
            ));
        } else {
        }
    }
}
