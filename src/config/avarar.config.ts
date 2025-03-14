import * as dotenv from 'dotenv';
import { validateEnv } from '../common/utils/env.utils';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

dotenv.config();

@Injectable()
export class AvararConfig {
    constructor(private configService: ConfigService) { }

    get alowedTypes(): string {
        return validateEnv('ALLOWED_TYPE');
    }

    get alowedTypesForInterceptor(): RegExp {
        const regExp = this.createRegExp(validateEnv('ALLOWED_TYPE'));
        console.log(regExp);
        return regExp;
    }
    
    private createRegExp(types: string): RegExp {
        return new RegExp(`(${types})$`, 'i');
    }
}