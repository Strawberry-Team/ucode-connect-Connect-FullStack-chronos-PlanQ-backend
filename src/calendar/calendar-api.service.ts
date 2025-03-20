import {Injectable, NotFoundException} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {GoogleOAuthService} from '../google/google-oauth.service';
import {google} from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CalendarApiService {
    private calendarData: Record<string, string>;
    private readonly calendarFilePath: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly googleOAuthService: GoogleOAuthService
    ) {
        this.calendarFilePath = path.resolve(
            __dirname,
            String(this.configService.get<string>('google.calendarApi.dataFile.path'))
        );

        this.googleOAuthService.setCredentials(String(this.configService.get<string>('google.calendarApi.refreshToken')));

        this.loadCalendarData();
    }

    private loadCalendarData(): void {
        try {
            const rawData = fs.readFileSync(this.calendarFilePath, 'utf-8');
            this.calendarData = JSON.parse(rawData);
        } catch (error) {
            throw new Error('Failed to load calendar data' + error.message);
        }
    }

    private getCalendarId(countryCode: string): string {
        const calendarId = this.calendarData[countryCode.toUpperCase()];
        if (!calendarId) {
            throw new NotFoundException(
                `Calendar not found for country code: ${countryCode}`
            );
        }
        return calendarId;
    }

    async getCountryHolidays(
        countryCode: string,
        startDate?: string,
        endDate?: string
    ): Promise<any[]> {
        const calendarId = this.getCalendarId(countryCode);

        if (!calendarId) {
            throw new NotFoundException(`Calendar not found for country code: ${countryCode}`);
        }

        const accessToken = await this.googleOAuthService.getAccessToken();

        const calendar = google.calendar({
            version: 'v3',
            headers: {Authorization: `Bearer ${accessToken}`},
        });

        const params: any = {
            calendarId,
        };

        if (startDate) {
            params.timeMin = startDate;
        }

        if (endDate) {
            params.timeMax = endDate;
        }

        params.maxResults = this.configService.get<number>('google.calendarApi.maxResults');

        const response = await calendar.events.list(params);

        return (response.data.items || []).map(item => {
            const eventData: any = {
                title: item.summary
            };

            if (item.start) {
                eventData.startedAt = item.start.date || item.start.dateTime || null;
            } else {
                eventData.startedAt = null;
            }

            if (item.end) {
                eventData.endedAt = item.end.date || item.end.dateTime || null;
            } else {
                eventData.endedAt = null;
            }

            eventData.description = item.description || null;

            return eventData;
        });


    }

    async getHolidaysForDateRange(
        countryCode: string,
        startDate: string,
        endDate: string
    ): Promise<any[]> {
        return this.getCountryHolidays(countryCode, startDate, endDate);
    }
}