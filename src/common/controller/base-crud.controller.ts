import {
    Body,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    InternalServerErrorException, NotFoundException,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import {Request} from 'express';
import {JwtAuthGuard} from "../../auth/guards/auth.jwt-guards";

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
@UseGuards(JwtAuthGuard)
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
        return await this.findById(id);

    }

    @Post()
    async create(@Body() dto: CreateDto, @Req() req: Request): Promise<T> {
        return await this.createEntity(dto);
    }

    @Patch(':id')
    async update(
        @Param('id') id: number,
        @Body() dto: UpdateDto,
    ): Promise<T> {
        const existing = await this.findById(id);
        if (!existing) {
            throw new NotFoundException("Entity not found");
        }
        return await this.updateEntity(id, dto);
    }

    @Delete(':id')
    async delete(@Param('id') id: number): Promise<void> {
        const existing = await this.findById(id);
        if (!existing) {
            throw new NotFoundException("Entity not found");
        }
        await this.deleteEntity(id);
    }
}
