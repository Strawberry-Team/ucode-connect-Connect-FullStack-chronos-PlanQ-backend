// src/common/base-repository.ts
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';

export class BaseRepository<T extends ObjectLiteral> { //TODO: подумать о базовом репозитории везде для crud
    protected readonly repo: Repository<T>;

    constructor(repo: Repository<T>) {
        this.repo = repo;
    }

    // Offset-based pagination
    async paginateOffset(
        queryBuilder: SelectQueryBuilder<T>,
        page: number,
        limit: number
    ): Promise<{ items: T[], total: number }> {
        const offset = (page - 1) * limit;
        const total = await queryBuilder.getCount();
        const items = await queryBuilder.skip(offset).take(limit).getMany();
        return { items, total };
    }

    // Cursor-based pagination
    async paginateCursor(
        queryBuilder: SelectQueryBuilder<T>,
        after: number | null,
        limit: number
    ): Promise<{ items: T[], nextCursor: number | null, hasMore: boolean }> {
        if (after) {
            queryBuilder.where('ep.id > :after', { after });
        }
        const items = await queryBuilder.take(limit).getMany();
        const nextCursor = items.length > 0 ? items[items.length - 1].id : null;
        const hasMore = items.length === limit;
        return { items, nextCursor, hasMore };
    }
}