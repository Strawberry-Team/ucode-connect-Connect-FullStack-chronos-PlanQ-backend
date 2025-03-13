import {applyDecorators, Inject, Injectable} from '@nestjs/common';
import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
    registerDecorator,
    ValidationOptions,
} from 'class-validator';
import {CountryService} from './country.service';

@ValidatorConstraint({async: true})
@Injectable()
export class IsValidCountryCodeConstraint implements ValidatorConstraintInterface {
    constructor(
        @Inject(CountryService) private readonly countryService: CountryService
    ) {}

    async validate(countryCode: string, args: ValidationArguments) {
        const validCodes = await this.countryService.getValidCountryCodes();
        return validCodes.includes(countryCode);
    }

    defaultMessage(args: ValidationArguments) {
        return 'Invalid country code. Please provide a valid 2-character country code.';
    }
}

export function IsValidCountryCode(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsValidCountryCodeConstraint,
        });
    };
}