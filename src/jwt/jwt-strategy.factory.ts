// src/common/factories/jwt-strategy.factory.ts

import { Injectable, Type } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Algorithm } from 'jsonwebtoken';

// Импортируем типы, используемые в конфигурации
import { TokenType, JwtContext, TOKEN_CONTEXT_MAP } from './jwt.types';

// Интерфейс для конфигурации фабрики
export interface JwtStrategyConfig {
    strategyName: string; // Например, 'jwt-access', 'jwt-refresh', 'jwt-confirm-email' и т.д.
    tokenType: TokenType; // Тип токена (access, refresh, confirmEmail и т.д.)
    // Функция-извлекатель токена, например, ExtractJwt.fromAuthHeaderAsBearerToken() или своя функция
    extractor: (req: any) => any;
    // Функция validate – уникальная для каждой стратегии
    validateFn: (payload: any) => any;
}

/**
 * Фабрика для создания стратегии Passport для JWT.
 * Принимает конфигурацию, которая определяет название стратегии, тип токена,
 * функцию извлечения токена и validate-функцию.
 */
export function createJwtStrategy(
    config: JwtStrategyConfig,
): Type<any> {
    @Injectable()
    class GenericJwtStrategy extends PassportStrategy(Strategy, config.strategyName) {
        constructor(private readonly configService: ConfigService) {
            // Опции стратегии собираются на основе типа токена:
            const tokenType: TokenType = config.tokenType;
            const context: JwtContext = TOKEN_CONTEXT_MAP[tokenType];

            const strategyOptions: StrategyOptions = {
                jwtFromRequest: config.extractor,
                ignoreExpiration: false,
                secretOrKey: String(configService.get<string>(`jwt.secrets.${tokenType}`)),
                audience: String(configService.get<string>(`jwt.audience.${context}`)),
                issuer: String(configService.get<string>(`jwt.issuer.${context}`)),
                algorithms: [
                    String(configService.get<string>('jwt.algorithm')) as Algorithm,
                ],
            };
            super(strategyOptions);
        }

        validate(payload: any): any {
            // Вызов уникальной validate-функции, переданной в конфигурации
            return config.validateFn(payload);
        }
    }
    return GenericJwtStrategy;
}
