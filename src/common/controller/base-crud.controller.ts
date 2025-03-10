import {
    Body,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Patch,
    Req,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * Универсальный абстрактный контроллер для CRUD-операций.
 * Ключевые методы:
 *   getById – получение сущности по ID;
 *   create – создание новой сущности;
 *   update – обновление сущности (частичное или полное);
 *   delete – удаление сущности.
 *
 * Абстрактные методы должны быть реализованы наследниками.
 *
 * @template T — тип сущности (например, User)
 * @template CreateDto — тип DTO для создания
 * @template UpdateDto — тип DTO для обновления
 */
export abstract class BaseCrudController<
    T,
    CreateDto,
    UpdateDto
> {
    /**
     * Возвращает сущность по ID.
     * Если сущность не найдена, выбрасывается HttpException (Not Found).
     */
    protected abstract findById(id: number): Promise<T>;

    /**
     * Создаёт новую сущность.
     * Если происходит ошибка (например, дублирование), выбрасывается HttpException.
     */
    protected abstract createEntity(dto: CreateDto): Promise<T>;

    /**
     * Обновляет сущность по ID.
     * Если обновление невозможно или сущность не найдена, выбрасывается HttpException.
     */
    protected abstract updateEntity(
        id: number,
        dto: UpdateDto,
    ): Promise<T>;

    /**
     * Удаляет сущность по ID.
     * Если сущность не найдена — выбрасывается HttpException.
     */
    protected abstract deleteEntity(id: number): Promise<void>;

    @Get(':id')
    async getById(@Param('id') id: number): Promise<T> {
        try {
            return await this.findById(id);
        } catch (error) {
            throw new HttpException(
                error.message || 'Entity not found',
                HttpStatus.NOT_FOUND,
            );
        }
    }

    @Post()
    async create(@Body() dto: CreateDto, @Req() req: Request): Promise<T> {
        try {
            const entity = await this.createEntity(dto);
            return entity;
        } catch (error) {
            throw new HttpException(
                error.message || 'Creation failed',
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Patch(':id')
    async update(
        @Param('id') id: number,
        @Body() dto: UpdateDto,
    ): Promise<T> {
        try {
            return await this.updateEntity(id, dto);
        } catch (error) {
            throw new HttpException(
                error.message || 'Update failed',
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Delete(':id')
    async delete(@Param('id') id: number): Promise<void> {
        try {
            await this.deleteEntity(id);
        } catch (error) {
            throw new HttpException(
                error.message || 'Deletion failed',
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }
}
