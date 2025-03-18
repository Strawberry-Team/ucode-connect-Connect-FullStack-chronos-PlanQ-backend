import {applyDecorators, Injectable} from '@nestjs/common';
import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
    registerDecorator,
    ValidationOptions,
    IsOptional,
} from 'class-validator';
import {CountryService} from './country.service';

@ValidatorConstraint({async: true})
@Injectable()
export class IsValidCountryCodeConstraint implements ValidatorConstraintInterface {
    async validate(countryCode: string, args: ValidationArguments) {
        const validCodes = await CountryService.getValidCountryCodes();
        return validCodes.includes(countryCode);
    }

    defaultMessage(args: ValidationArguments) {
        return 'Invalid country code. Please provide a valid 2-character country code.';
    }
}

export function IsValidCountryCode(validationOptions?: ValidationOptions, isOptional: boolean = false) {
    return applyDecorators(
        ...(isOptional ? [IsOptional()] : []),
        function (object: Object, propertyName: string) {
            registerDecorator({
                target: object.constructor,
                propertyName,
                options: validationOptions,
                constraints: [],
                validator: IsValidCountryCodeConstraint,
            });
        }
    );
}