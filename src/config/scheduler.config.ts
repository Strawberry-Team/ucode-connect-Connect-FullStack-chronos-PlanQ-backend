// src/config/scheduler.config.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CronExpression } from '@nestjs/schedule';
import * as dotenv from 'dotenv';
import {validateEnv} from '../common/utils/env.utils';

dotenv.config();

@Injectable()
export class SchedulerConfig {
  constructor(private configService: ConfigService) {}

  get unactivatedAccountNotification(): string {
    return CronExpression[validateEnv('UNACTIVATED_ACCOUNT_NOTIFICATION')];
  }
  get calendarNotification(): string {
    return CronExpression[validateEnv('CALENDAR_NOTIFICATION')];
  }
  get cleanRefreshTokensFromDb(): string {
    return CronExpression[validateEnv('CLEAN_REFRESH_TOKENS_FROM_DB_TIME')];
  }
  get updateCountries(): string {
    return CronExpression[validateEnv('UPDATE_COUNTRIES')];
  }
}
