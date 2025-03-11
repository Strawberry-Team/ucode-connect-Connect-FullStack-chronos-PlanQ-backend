import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenType, JwtContext, TOKEN_CONTEXT_MAP, JwtPayload } from './jwt.types';

@Injectable()
export class JwtUtils {
    private secrets: Record<TokenType, string>;
    private expirationTimes: Record<TokenType, string>;
    private issuers: Record<JwtContext, string>;
    private audiences: Record<JwtContext, string>;
    private algorithm: string;

    constructor(
        private configService: ConfigService,
        private jwtService: JwtService,
    ) {
        this.initializeConfig();
    }

    private initializeConfig() {
        const tokenTypes: TokenType[] = [
            'access', 'refresh', 'confirmEmail', 'resetPassword',
            'confirmCalendar', 'confirmArrangement'
        ];
        const contexts: JwtContext[] = ['auth', 'calendar', 'event'];

        this.secrets = {} as Record<TokenType, string>;
        this.expirationTimes = {} as Record<TokenType, string>;
        this.issuers = {} as Record<JwtContext, string>;
        this.audiences = {} as Record<JwtContext, string>;

        // Инициализация настроек из конфига
        tokenTypes.forEach(type => {
            this.secrets[type] = String(this.configService.get<string>(`jwt.secrets.${type}`));
            this.expirationTimes[type] = String(this.configService.get<string>(`jwt.expiresIn.${type}`));
        });

        contexts.forEach(context => {
            this.issuers[context] = String(this.configService.get<string>(`jwt.issuer.${context}`));
            this.audiences[context] = String(this.configService.get<string>(`jwt.audience.${context}`));
        });

        this.algorithm = String(this.configService.get<string>('jwt.algorithm'));
    }

    generateToken(payload: Omit<JwtPayload, 'iss' | 'aud' | 'iat' | 'exp'>, type: TokenType): string {
        const context = TOKEN_CONTEXT_MAP[type];
        return this.jwtService.sign(
            {
                ...payload,
                iss: this.issuers[context],
                aud: this.audiences[context],
            },
            {
                secret: this.secrets[type],
                expiresIn: this.expirationTimes[type],
                algorithm: this.algorithm as any,
            },
        );
    }

    // verifyToken(token: string, type: TokenType): JwtPayload {
    //     const context = TOKEN_CONTEXT_MAP[type];
    //     return this.jwtService.verify(token, {
    //         secret: this.secrets[type],
    //         audience: this.audiences[context],
    //         issuer: this.issuers[context],
    //     });
    // }
}