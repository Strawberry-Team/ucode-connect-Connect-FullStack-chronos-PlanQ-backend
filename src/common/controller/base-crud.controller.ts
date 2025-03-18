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
import {JwtAuthGuard} from "../../auth/guards/auth.jwt-guards";
import {RequestWithUser} from "../types/request.types";

@UseGuards(JwtAuthGuard)
export abstract class BaseCrudController<
    T,
    CreateDto,
    UpdateDto
> {
    protected abstract findById(id: number, req: RequestWithUser): Promise<T>;

    protected abstract createEntity(dto: CreateDto, req: RequestWithUser): Promise<T>;

    protected abstract updateEntity(
        id: number,
        dto: UpdateDto,
        req: RequestWithUser
    ): Promise<T>;

    protected abstract deleteEntity(id: number, req: RequestWithUser): Promise<void>;

    @Get(':id')
    async getById(@Param('id') id: number, @Req() req: RequestWithUser): Promise<T> {
        const existing = await this.findById(id, req);
        if (!existing) {
            throw new NotFoundException("Entity not found");
        }
        return existing;
    }

    @Post()
    async create(@Body() dto: CreateDto, @Req() req: RequestWithUser): Promise<T> {
        return await this.createEntity(dto, req);
    }

    @Patch(':id')
    async update(
        @Param('id') id: number,
        @Body() dto: UpdateDto,
        @Req() req: RequestWithUser
    ): Promise<T> {
        const existing = await this.findById(id, req);
        if (!existing) {
            throw new NotFoundException("Entity not found");
        }
        return await this.updateEntity(id, dto, req);
    }

    @Delete(':id')
    async delete(@Param('id') id: number, @Req() req: RequestWithUser): Promise<void> {
        const existing = await this.findById(id, req);
        if (!existing) {
            throw new NotFoundException("Entity not found");
        }
        await this.deleteEntity(id, req);
    }
}
