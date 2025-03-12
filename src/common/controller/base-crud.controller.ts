import {
    Body,
    Delete,
    Get,
    NotFoundException,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import {Request} from 'express';
import {JwtAuthGuard} from "../../auth/guards/auth.jwt-guards";

@UseGuards(JwtAuthGuard)
export abstract class BaseCrudController<
    T,
    CreateDto,
    UpdateDto
> {
    protected abstract findById(id: number): Promise<T>;

    protected abstract createEntity(dto: CreateDto): Promise<T>;

    protected abstract updateEntity(
        id: number,
        dto: UpdateDto,
    ): Promise<T>;

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
