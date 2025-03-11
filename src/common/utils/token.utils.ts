import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

export type TokenType = 'access' | 'refresh' | 'email' | 'resetPassword';

@Injectable()
export class JwtUtils {
  private secrets: Record<TokenType, string>;
  private expirationTimes: Record<TokenType, string>;

  constructor(private configService: ConfigService) {
    this.secrets = {
      access: String(this.configService.get<string>('jwt.secrets.access')),
      refresh: String(this.configService.get<string>('jwt.secrets.refresh')),
      email: String(this.configService.get<string>('jwt.secrets.email')),
      resetPassword: String(this.configService.get<string>('jwt.secrets.resetPassword')),
    };

    this.expirationTimes = {
      access: String(this.configService.get<string>('jwt.expiresIn.access')),
      refresh: String(this.configService.get<string>('jwt.expiresIn.refresh')),
      email: String(this.configService.get<string>('jwt.expiresIn.email')),
      resetPassword: String(this.configService.get<string>('jwt.expiresIn.resetPassword')),
    };
  }

  generateToken(payload: Record<string, any>, type: TokenType): string {
    console.log("passwordReset: ", this.expirationTimes[type])
    return jwt.sign(payload, this.secrets[type], {
      expiresIn: this.expirationTimes[type],
    });
  }

  // verifyToken(token: string, type: TokenType): any {
  //   try {
  //     return jwt.verify(token, this.secrets[type]);
  //   } catch (error) {
  //     return null;
  //   }
  // } TODO: REMOVE
}
