// src/common/validators/date.validator.ts
import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
    IsISO8601,
    IsOptional,
    ValidateIf
} from 'class-validator';
import {applyDecorators} from "@nestjs/common";

export function IsLaterThan(property: string, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isLaterThan',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints;
                    // console.log("args.object ", args.object);
                    const relatedValue = (args.object as any)["startedAt"];
                    // console.log(relatedPropertyName);
                    // console.log(new Date(value), "  ", new Date(relatedValue));
                    return new Date(value) >= new Date(relatedValue);
                },
                defaultMessage(args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints;
                    return `${args.property} must be later than ${relatedPropertyName}`;
                }
            }
        });
    };
}

export function IsISO8601Date(isOptional: boolean, allowNull: boolean = false) {
    const decorators = [IsISO8601({strict: true})];

    if (allowNull) {
        return applyDecorators(
            ValidateIf(value => value !== null),
            ...decorators,
            IsOptional()
        );
    } else if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    } else {
        return applyDecorators(...decorators);
    }
}