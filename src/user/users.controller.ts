import {
    Controller,
    UsePipes,
    ValidationPipe,
    UseInterceptors,
    UploadedFile,
    BadRequestException, Post,
} from '@nestjs/common';
import { BaseCrudController } from '../common/base-crud.controller';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Express } from 'express';
import { v4 as uuidv4 } from 'uuid';



@Controller('api/users')
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
        return await this.usersService.getUserById(id);
    }

    protected async createEntity(dto: CreateUserDto): Promise<User> {
        return await this.usersService.createUser(dto);
    }

    protected async updateEntity(
        id: number,
        dto: UpdateUserDto,
    ): Promise<User> {
        return await this.usersService.updateUser(id, dto);
    }

    protected async deleteEntity(id: number): Promise<void> {
        return await this.usersService.deleteUser(id);
    }

    // Дополнительный эндпоинт: загрузка аватарки
    @Post('upload-avatar')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './public/uploads/avatars',
                filename: (req, file, callback) => {
                    // Using UUID instead of timestamp-random
                    const fileName = `${uuidv4()}${extname(file.originalname)}`;
                    callback(null, fileName);
                },
            }),
            fileFilter: (req, file, callback) => {
                if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
                    return callback(
                        new BadRequestException('Only image files are allowed!'),
                        false,
                    );
                }
                callback(null, true);
            },
            limits: {
                fileSize: 5 * 1024 * 1024, // ограничение 5 МБ
            },
        }),
    )
    async uploadAvatar(
        @UploadedFile() file: Express.Multer.File,
    ): Promise<{ server_filename: string }> {
        if (!file) {
            throw new BadRequestException('No file uploaded.');
        }
        // Возвращаем только название файла для фронтенда
        return { server_filename: file.filename };
    }
}
