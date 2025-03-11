import { AuthGuard } from '@nestjs/passport';
import { Type, Injectable } from '@nestjs/common';


/**
 * Creates a JWT guard for the specified strategy.
 * @param strategy The JWT strategy name
 * @returns A new guard class for the specified strategy
 */
export function createJwtGuard(strategy: string): Type<any> {
    @Injectable()
    class JwtGuardClass extends AuthGuard(strategy) {}

    // Set proper name for better debugging and DI
    Object.defineProperty(JwtGuardClass, 'name', { value: `Jwt${strategy.charAt(0).toUpperCase() + strategy.slice(1)}Guard` });

    return JwtGuardClass;
}