// src/tasks/tasks.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';
import { convertToSeconds } from 'src/common/utils/time.utils';
import { RefreshTokenService } from 'src/token/refresh-token.service';
import { User } from 'src/user/entity/user.entity';
import { UsersService } from 'src/user/users.service';

@Injectable()
export class NotificationSchedulerService {
  constructor(
    private readonly usersService: UsersService,
    private configService: ConfigService,
  ) {
  }

  @Cron(CronExpression.EVERY_MINUTE)
  calendarNotification() {
    console.log('NotificationSchedulerService: Выполняется каждую минуту');
  }

  @Cron(CronExpression["EVERY_30_MINUTES"]) //TODO: перенести в .env, если получится
  async unactivatedAccountNotification() {
    const EXPIRATION_TIME = convertToSeconds(parseInt(String(this.configService.get<string>(`jwt.expiresIn.confirmEmail`))), 'h');
    // console.log("EXPIRATION_DAYS = ", EXPIRATION_TIME)
    const users: User[] = await this.usersService.getAllUnactivatedUsers(EXPIRATION_TIME);
    // console.log("refreshTokens = ", refreshTokens)
    const now = new Date();

    if (users.length > 0) {
      await Promise.all(users.map(user =>
        this.usersService.deleteUser(user.id)
      ));

      // console.log(`Удалено просроченных users: ${users}`);
    } else {
      // console.log('Нет просроченных users');
    }
  }
}
