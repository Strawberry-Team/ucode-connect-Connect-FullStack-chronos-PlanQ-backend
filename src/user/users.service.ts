import {
    Injectable,
    BadRequestException,
    NotFoundException,
    UnauthorizedException, ConflictException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entity/user.entity';
import {PasswordService} from "./passwords.service";

@Injectable()
export class UsersService {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly passwordService: PasswordService
    ) {}

    private async getUserById(id: number): Promise<User> {
        const user = await this.usersRepository.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    } //TODO: подумать делать ли проверку на null тут

    async getUserByIdWithoutPassword(id: number): Promise<User> {
        const result = await this.getUserById(id);
        delete result.password;
        return result;
    }


    async getUserByEmail(email: string): Promise<User> {
        const result = await this.usersRepository.findByEmail(email);
        if (!result) {
            throw new NotFoundException('User not found');
        }
        return result;
    }

    async getUserByEmailWithoutPassword(email: string): Promise<User> {
        const result = await this.getUserByEmail(email);
        delete result.password;
        return result;
    }


    async createUser(dto: CreateUserDto): Promise<User> {
        const existing = await this.usersRepository.findByEmail(dto.email);
        if (existing) {
            throw new ConflictException('Email already in use');
        }
        dto.password = await this.passwordService.hash(dto.password);
        const result = await this.usersRepository.createUser(dto);
        delete result.password;
        return result;
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
            const updateData: Partial<User> = { ...dto };
            updateData.password = hashedNewPassword;
            result = await this.usersRepository.updateUser(id, updateData);
        } else {
            result = await this.usersRepository.updateUser(id, dto);
        }
        if (!result) {
            throw new NotFoundException('User not found');
        }
        delete result.password;
        return result;
    }

    async deleteUser(id: number): Promise<void> {
        await this.usersRepository.deleteUser(id);
    }

    async confirmEmail(userId: number) {
        const updateData: Partial<User> = { emailVerified: true };
        
        const result = await this.usersRepository.updateUser(userId, updateData);

        return result;
    }
}
