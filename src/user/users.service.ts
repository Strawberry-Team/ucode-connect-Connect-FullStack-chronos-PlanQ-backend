import {
    Injectable,
    BadRequestException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(private readonly usersRepository: UsersRepository) {}

    async getUserById(id: number): Promise<User> {
        const user = await this.usersRepository.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async createUser(dto: CreateUserDto): Promise<User> {
        // Проверка на дублирование email
        const existing = await this.usersRepository.findByEmail(dto.email);
        if (existing) {
            throw new BadRequestException('Email already in use');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const userData: Partial<User> = {
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            password: hashedPassword,
            countryCode: dto.countryCode,
        };
        return await this.usersRepository.createUser(userData);
    }

    async updateUser(id: number, dto: UpdateUserDto): Promise<User> {
        const user = await this.getUserById(id);
        let result;
        // Если требуется изменить пароль – проверяем, что оба поля переданы
        if (dto.oldPassword || dto.newPassword) {
            // if (!dto.oldPassword || !dto.newPassword) {
            //     throw new BadRequestException(
            //         'Both old and new passwords are required to update password',
            //     );
            // } //TODO перенести в контроллер
            const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
            if (!isMatch) {
                throw new UnauthorizedException('Old password does not match');
            }
            const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);
            const updateData: Partial<User> = { ...dto };
            if (dto.newPassword) {
                updateData.password = hashedNewPassword;
            }
            result = await this.usersRepository.updateUser(id, updateData);
        } else {
            result = await this.usersRepository.updateUser(id, dto);
        }
        if (!result) {
            throw new NotFoundException('User not found');
        }
        return result;
    }

    async deleteUser(id: number): Promise<void> {
        await this.getUserById(id);
        await this.usersRepository.deleteUser(id);
    }
}
