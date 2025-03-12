import {AuthGuard} from '@nestjs/passport';
import {Type, Injectable} from '@nestjs/common';

export function createJwtGuard(strategy: string): Type<any> {
    @Injectable()
    class JwtGuardClass extends AuthGuard(strategy) {
    }

    // Set proper name for better debugging and DI
    Object.defineProperty(JwtGuardClass, 'name', {value: `Jwt${strategy.charAt(0).toUpperCase() + strategy.slice(1)}Guard`});

    return JwtGuardClass;
}