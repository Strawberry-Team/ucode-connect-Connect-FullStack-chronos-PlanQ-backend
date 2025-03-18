import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import {UsersRepository} from './users.repository';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {User} from './entity/user.entity';
import {PasswordService} from "./passwords.service";
import {CalendarsService} from "../calendar/calendars.service";
import {plainToClass, plainToInstance} from "class-transformer";

@Injectable()
export class UsersService {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly passwordService: PasswordService,
        private readonly calendarsService: CalendarsService,
    ) {
    }

    private async getUserById(id: number): Promise<User> {
        const user = await this.usersRepository.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return plainToInstance(User, user, { groups: ['confidential'] });
    }

    async getUserByIdWithoutPassword(id: number): Promise<User> {
        const result = await this.getUserById(id);
        return plainToInstance(User, result, { groups: ['basic'] });
    }


    async getUserByEmail(email: string): Promise<User> {
        const result = await this.usersRepository.findByEmail(email);
        if (!result) {
            throw new NotFoundException('User with this email not found');
        }
        return plainToInstance(User, result, { groups: ['confidential'] });
    }

    async getUserByEmailWithoutPassword(email: string): Promise<User> {
        const result = await this.getUserByEmail(email);
        return plainToInstance(User, result, { groups: ['basic'] });
    }


    async createUser(dto: CreateUserDto): Promise<User> {
        const existing = await this.usersRepository.findByEmail(dto.email);
        if (existing) {
            throw new ConflictException('Email already in use');
        }
        dto.password = await this.passwordService.hash(dto.password);
        const result = await this.usersRepository.createUser(dto);

        await this.calendarsService.createDefaultCalendar(result.id);

        return plainToInstance(User, result, { groups: ['basic'] });
    }

    async updateUser(id: number, dto: UpdateUserDto): Promise<User> {
        if (dto.email !== undefined) {
            throw new BadRequestException('Email update is temporarily unavailable');
        }

        const user = await this.getUserById(id);
        let result;
        if (dto.oldPassword || dto.newPassword) {
            const isMatch = await this.passwordService.compare(String(dto.oldPassword), String(user.password));
            if (!isMatch) {
                throw new UnauthorizedException('Old password does not match');
            }
            const hashedNewPassword = await this.passwordService.hash(String(dto.newPassword));
            delete dto.oldPassword;
            delete dto.newPassword;
            const updateData: Partial<User> = {...dto};
            updateData.password = hashedNewPassword;
            result = await this.usersRepository.updateUser(id, updateData);
        } else {
            result = await this.usersRepository.updateUser(id, dto);
        }
        if (!result) {
            throw new NotFoundException('User not found');
        }
        return plainToInstance(User, result, { groups: ['basic'] });
    }

    async updatePassword(id: number, newPassword: string): Promise<User> {
        const hashedPassword = await this.passwordService.hash(newPassword);
        const updateData: Partial<User> = {password: hashedPassword};
        const result = await this.usersRepository.updateUser(id, updateData);
        if (!result) {
            throw new NotFoundException('User not found');
        }
        return plainToInstance(User, result, { groups: ['basic'] });
    }

    async deleteUser(id: number): Promise<void> {
        await this.usersRepository.deleteUser(id);
    }

    async confirmEmail(userId: number) {
        const updateData: Partial<User> = {emailVerified: true};
        const result = await this.usersRepository.updateUser(userId, updateData);
        return plainToInstance(User, result, { groups: ['basic'] });
    }

    async getAllUnactivatedUsers(time: number): Promise<User[]> {
        const users = await this.usersRepository.getAllUnactivatedUsers(time);
        return users.map(user => plainToInstance(User, user, { groups: ['confidential'] }));
    }
}
