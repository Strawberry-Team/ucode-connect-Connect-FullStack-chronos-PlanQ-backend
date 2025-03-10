import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

// Функция-извлекатель для refresh токена из тела запроса
const refreshTokenExtractor = (req: any) => {
  return req?.body?.refreshToken;
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh'
) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: refreshTokenExtractor,
      ignoreExpiration: false,
      secretOrKey: String(configService.get<string>('jwt.secrets.refresh')),
    });
  }

  validate(payload: any) { //TODO: проверить есть ли refresh в БД!!!!!!!!!!!!!!!!!!!!!!
    return { userId: payload.userId};
  }
}
