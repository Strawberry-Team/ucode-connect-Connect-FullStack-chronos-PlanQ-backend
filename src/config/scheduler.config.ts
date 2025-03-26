// src/config/scheduler.config.ts
import {Injectable} from '@nestjs/common';
import {CronExpression} from '@nestjs/schedule';
import * as dotenv from 'dotenv';
import {validateEnv} from '../common/utils/env.utils';

dotenv.config();

@Injectable()
export class SchedulerConfig {
    get unactivatedAccountNotification(): string {
        return CronExpression[validateEnv('SCHEDULER_UNACTIVATED_ACCOUNT_NOTIFICATION')];
    }

    get calendarNotification(): string {
        return CronExpression[validateEnv('SCHEDULER_CALENDAR_NOTIFICATION')];
    }

    get cleanRefreshTokensFromDb(): string {
        return CronExpression[validateEnv('SCHEDULER_CLEAN_REFRESH_TOKENS_FROM_DB_TIME')];
    }

    get updateCountries(): string {
        return CronExpression[validateEnv('SCHEDULER_UPDATE_COUNTRIES')];
    }

    get checkReminders(): string {
        return CronExpression[validateEnv('SCHEDULER_CHECK_REMINDERS')];
    }

    get checkArrangements(): string {
        return CronExpression[validateEnv('SCHEDULER_CHECK_ARRANGEMENTS')];
    }
}
