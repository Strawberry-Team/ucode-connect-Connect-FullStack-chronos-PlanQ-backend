import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import {
    getConfirmationEmailTemplate,
    getResetPasswordEmailTemplate,
    getCalendarShareEmailTemplate,
    getEventInvitationEmailTemplate,
    getEventReminderEmailTemplate,
    getCalendarReminderEmailTemplate,
} from './email.templates';
import { GoogleOAuthService } from '../google/google-oauth.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
    private gmailUser: string;
    private appName: string;
    private logo: any;

    constructor(
        private readonly configService: ConfigService,
        private readonly googleOAuthService: GoogleOAuthService
    ) {
        this.gmailUser = String(this.configService.get<string>('google.gmailApi.user'));
        this.appName = String(this.configService.get<string>('app.name'));
        // Initialise the oAuth2 client by setting the refresh token
        this.googleOAuthService.setCredentials(String(this.configService.get<string>('google.gmailApi.refreshToken')));

        this.init();
    }

    private async init() {
        this.logo = await this.readLogoFile('./public/uploads/logo/logo.png');
        console.log("logo: ", this.logo);
    }

    private async readLogoFile(filePath: string): Promise<Buffer> {
        return fs.readFileSync(path.resolve(filePath));
      }

    private async readHtmlFile(filePath: string): Promise<string> {
        return fs.readFileSync(path.resolve(filePath), 'utf-8');
    };

    private async createTransport() {
        const accessToken = await this.googleOAuthService.getAccessToken();
        const oauthDetails = this.googleOAuthService.getOAuthCredentials();
        console.log("createdTransport")
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: this.gmailUser,
                clientId: oauthDetails.clientId,
                clientSecret: oauthDetails.clientSecret,
                refreshToken: oauthDetails.refreshToken,
                redirectUri: oauthDetails.redirectUri,
            },
        });
    }

    async sendEmail(to: string, subject: string, html: string): Promise<void> {
        try {
            const transporter = await this.createTransport();
            transporter.on("token", (token) => {
                console.log("A new access token was generated");
                console.log("User: %s", token.user);
                console.log("Access Token: %s", token.accessToken);
                console.log("Expires: %s", new Date(token.expires));
                console.log("Date: %s", new Date());
            });

            console.log("transporter: ", transporter)

            console.log('sendMail.info: ', {
                from: this.gmailUser,
                to,
                subject,
                html,
            })
            const info = await transporter.sendMail({
                from: this.gmailUser,
                to,
                subject,
                html,
                attachments: [
                    {
                        filename: 'logo.png',
                        content: this.logo,
                        cid: 'logo@project',
                    },
                ],
            });
            console.log(`Email sent successfully: ${info.messageId}`);
        } catch (error) {
            console.error(`Failed to send email to ${to}`, error);
            throw error;
        }
    }

    async sendConfirmationEmail(to: string, confirmationLink: string): Promise<void> {
        // if (!this.logoSVG) {
        //     this.logoSVG = await this.readHtmlFile('./public/uploads/logo/logo_svg.txt');
        // }
        // console.log("image_svg", this.logoSVG);
        const html = getConfirmationEmailTemplate(confirmationLink, this.appName);
        console.log("html: ", html);
        await this.sendEmail(to, `Email Confirmation for ${this.appName}`, html);
    }

    async sendResetPasswordEmail(to: string, resetLink: string): Promise<void> {
        console.log("resetLink: ", resetLink);
        const html = getResetPasswordEmailTemplate(resetLink, this.appName);
        console.log("html1: ", html);
        // await this.sendEmail(to, `Reset Password for ${this.appName}`, html);
    }

    async sendCalendarShareEmail(
        to: string,
        calendarName: string,
        shareLink: string,
        inviter: string,
    ): Promise<void> {
        const html = getCalendarShareEmailTemplate(calendarName, shareLink, inviter, this.appName);
        await this.sendEmail(to, `Calendar Access Invitation: ${calendarName}`, html);
    }

    async sendEventInvitationEmail(
        to: string,
        inviter: string,
        eventName: string,
        eventDate: string,
        eventTime: string,
        shareLink: string,
        guestEmails: string[]
    ): Promise<void> {
        const html = getEventInvitationEmailTemplate(
            inviter,
            eventName,
            eventDate,
            eventTime,
            shareLink,
            guestEmails,
            this.appName
        );
        await this.sendEmail(to, `Event Invitation: ${eventName}`, html);
    }

    async sendEventReminderEmail(
        to: string,
        eventTitle: string,
        calendarName: string,
        eventTime: string
    ): Promise<void> {
        const html = getEventReminderEmailTemplate(eventTitle, calendarName, eventTime, this.appName);
        await this.sendEmail(
            to,
            `Reminder: ${eventTitle} starts in 30 minutes`,
            html
        );
    }

    async sendCalendarReminderEmail(
        to: string,
        reminderName: string,
        description: string,
        calendarName: string
    ): Promise<void> {
        const html = getCalendarReminderEmailTemplate(reminderName, description, calendarName, this.appName);
        await this.sendEmail(
            to,
            `Reminder: ${reminderName} in calendar ${calendarName}`,
            html
        );
    }
}
