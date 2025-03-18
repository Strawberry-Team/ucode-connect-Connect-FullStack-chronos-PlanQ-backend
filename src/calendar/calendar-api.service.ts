// calendar-api.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleOAuthService } from '../google/google-oauth.service';
import { google } from 'googleapis';
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
            'data/country.holiday-calendar.json'
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

    async getHolidays(
        countryCode: string,
        startDate?: string,
        endDate?: string
    ): Promise<any[]> {
        try {
            const calendarId = this.getCalendarId(countryCode);
            const accessToken = await this.googleOAuthService.getAccessToken();

            const calendar = google.calendar({
                version: 'v3',
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            const response = await calendar.events.list({
                calendarId,
                // timeMin: startDate,
                // timeMax: endDate,
                // singleEvents: true,
                orderBy: 'startTime',
                showDeleted: true,
            });

            return (response.data.items || []).map(item => {
                const eventData: any = {
                    summary: item.summary
                };

                // Безопасное добавление даты начала
                if (item.start) {
                    eventData.start = item.start.date || item.start.dateTime || null;
                } else {
                    eventData.start = null;
                }

                // Безопасное добавление даты окончания
                if (item.end) {
                    eventData.end = item.end.date || item.end.dateTime || null;
                } else {
                    eventData.end = null;
                }

                // Добавление описания, если оно есть
                eventData.description = item.description || null;

                return eventData;
            });

        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new Error(`Failed to fetch holidays: ${error.message}`);
        }
    }

    async getHolidaysForDateRange(
        countryCode: string,
        startDate: string,
        endDate: string
    ): Promise<any[]> {
        return this.getHolidays(countryCode, startDate, endDate);
    }
}