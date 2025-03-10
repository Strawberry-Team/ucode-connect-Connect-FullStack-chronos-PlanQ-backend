import {
    Controller,
    UsePipes,
    ValidationPipe,
    UseInterceptors,
    UploadedFile,
    BadRequestException, Post,
} from '@nestjs/common';
import { BaseCrudController } from '../common/controller/base-crud.controller';
import { User } from './entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { Express } from 'express';
import {createFileUploadInterceptor} from "../common/interceptor/file-upload.interceptor";



@Controller('users')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class UsersController extends BaseCrudController<
    User,
    CreateUserDto,
    UpdateUserDto
> {
    constructor(private readonly usersService: UsersService) {
        super();
    }

    // Реализация абстрактных методов

    protected async findById(id: number): Promise<User> {
        return await this.usersService.getUserByIdWithoutPassword(id);
    }

    protected async createEntity(dto: CreateUserDto): Promise<User> {
        return await this.usersService.createUser(dto);
    }

    protected async updateEntity(
        id: number,
        dto: UpdateUserDto,
    ): Promise<User> {
        if (dto.oldPassword || dto.newPassword) {
            if (!dto.oldPassword || !dto.newPassword) {
                throw new BadRequestException(
                    'Both old and new passwords are required to update password',
                );
            }
        }
        return await this.usersService.updateUser(id, dto);
    }

    protected async deleteEntity(id: number): Promise<void> {
        return await this.usersService.deleteUser(id);
    }

    @Post('upload-avatar')
    @UseInterceptors(
        createFileUploadInterceptor({
            destination: './public/uploads/avatars',
            allowedTypes: /\/(jpg|jpeg|png)$/,
            maxSize: 5 * 1024 * 1024,
        })
    )
    async uploadAvatar(
        @UploadedFile() file: Express.Multer.File,
    ): Promise<{ server_filename: string }> {
        if (!file) {
            throw new BadRequestException('No file uploaded.');
        }
        return { server_filename: file.filename };
    }
}
