import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

// Функция-извлекатель для refresh токена из тела запроса
const confirmEmailExtractor = (req: any) => {
    return req?.params?.confirm_token;
};

@Injectable()
export class JwtConfirmEmailStrategy extends PassportStrategy(
    Strategy,
    'jwt-confirm-email'
) {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: confirmEmailExtractor,
            ignoreExpiration: false,
            secretOrKey: String(configService.get<string>('jwt.secrets.confirmEmail')),
        });
    }

    validate(payload: any) {
        return { userId: payload.sub };
    }
}
