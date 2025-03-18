import {
    Controller,
    UsePipes,
    ValidationPipe,
    UseInterceptors,
    UploadedFile,
    BadRequestException, Post,
    Body, Req, NotImplementedException, Param, Patch, Delete,
    UseGuards, Get, SerializeOptions,
} from '@nestjs/common';
import {BaseCrudController} from '../common/controller/base-crud.controller';
import {SERIALIZATION_GROUPS, User} from './entity/user.entity';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {UsersService} from './users.service';
import {Express} from 'express';
import {createFileUploadInterceptor} from "../common/interceptor/file-upload.interceptor";
import {AvatarConfig} from '../config/avatar.config';
import {OwnAccountGuard} from './guards/own-account.guard';
import {RequestWithUser} from "../common/types/request.types";
import {UsersCalendarsService} from "../user-calendar/users-calendars.service";
import {UserCalendar} from "../user-calendar/entity/user-calendar.entity";

@Controller('users')
@UsePipes(new ValidationPipe({whitelist: true}))
@SerializeOptions({
    groups: SERIALIZATION_GROUPS.BASIC
})
export class UsersController extends BaseCrudController<
    User,
    CreateUserDto,
    UpdateUserDto
> {
    constructor(
        private readonly usersService: UsersService,
        private readonly usersCalendarsService: UsersCalendarsService) {
        super();
    }

    protected async findById(id: number, req: RequestWithUser): Promise<User> {
        return await this.usersService.getUserByIdWithoutPassword(id);
    }

    protected async createEntity(dto: CreateUserDto, req: RequestWithUser): Promise<User> {
        return await this.usersService.createUser(dto);
    }

    protected async updateEntity(
        id: number,
        dto: UpdateUserDto,
        req: RequestWithUser
    ): Promise<User> {
        const dtoKeys = Object.keys(dto);
        const hasPasswordFields = dto.oldPassword !== undefined || dto.newPassword !== undefined;
        const nonPasswordFields = dtoKeys.filter(key => key !== 'oldPassword' && key !== 'newPassword');

        if (hasPasswordFields) {
            if (!dto.oldPassword || !dto.newPassword) {
                throw new BadRequestException(
                    'Both old and new passwords are required to update password',
                );
            }

            if (nonPasswordFields.length > 0) {
                throw new BadRequestException(
                    'Password update must be performed separately from other field updates',
                );
            }
        } else if (dtoKeys.length === 0) {
            throw new BadRequestException('At least one field must be provided for update');
        }

        return await this.usersService.updateUser(id, dto);
    }

    protected async deleteEntity(id: number, req: RequestWithUser): Promise<void> {
        return await this.usersService.deleteUser(id);
    }

    @Post()
    async create(@Body() dto: CreateUserDto, @Req() req: RequestWithUser): Promise<User> {
        throw new NotImplementedException();
    }

    @Patch(':id')
    @UseGuards(OwnAccountGuard)
    async update(@Param('id') id: number, @Body() dto: UpdateUserDto, @Req() req: RequestWithUser): Promise<User> {
        return super.update(id, dto, req);
    }

    @Delete(':id')
    @UseGuards(OwnAccountGuard)
    async delete(@Param('id') id: number, @Req() req: RequestWithUser): Promise<void> {
        return super.delete(id, req);
    }

    @Post('upload-avatar')
    @UseInterceptors(
        createFileUploadInterceptor({
            destination: './public/uploads/avatars',
            allowedTypes: AvatarConfig.prototype.allowedTypesForInterceptor,
            maxSize: 5 * 1024 * 1024,
        })
    )

    async uploadAvatar(
        @UploadedFile() file: Express.Multer.File,
    ): Promise<{ server_filename: string }> {
        //TODO: Удалять старые фотки(которые человек просто загружал) сделать в Scheduler
        if (!file) {
            throw new BadRequestException('No file uploaded.');
        }
        return {server_filename: file.filename};
    }

    @Get(':id/calendars')
    @UseGuards(OwnAccountGuard)
    async getUserCalendars(@Param('id') id: number): Promise<UserCalendar[]> {
        return this.usersCalendarsService.getUserCalendars(id);
    }
}
