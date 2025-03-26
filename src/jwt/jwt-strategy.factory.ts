// src/jwt/jwt-strategy.factory.ts
import { Injectable, Type } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Algorithm } from 'jsonwebtoken';

import { TokenType, JwtContext, TOKEN_CONTEXT_MAP } from './jwt.types';

export interface JwtStrategyConfig {
    strategyName: string;
    tokenType: TokenType;
    extractor: (req: any) => any;
    validateFn: (payload: any, req?: any) => any;
}

export function createJwtStrategy(
    config: JwtStrategyConfig,
): Type<any> {
    @Injectable()
    class GenericJwtStrategy extends PassportStrategy(Strategy, config.strategyName) {
        constructor(private readonly configService: ConfigService) {
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

        validate(payload: any, req?: any): any {
            return config.validateFn(payload, req);
        }
    }

    return GenericJwtStrategy;
}
