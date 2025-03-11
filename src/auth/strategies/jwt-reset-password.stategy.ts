import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

// Функция-извлекатель для refresh токена из тела запроса
const passwordResetExtractor = (req: any) => {
    return req?.params?.confirm_token;
};

@Injectable()
export class JwtResetPasswordStrategy extends PassportStrategy(
    Strategy,
    'jwt-password-reset'
) {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: passwordResetExtractor,
            ignoreExpiration: false,
            secretOrKey: String(configService.get<string>('jwt.secrets.passwordReset')),
        });
    }

    validate(payload: any) {
        return { userId: payload.sub };
    }
}
