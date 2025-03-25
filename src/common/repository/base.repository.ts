// src/common/base-repository.ts
import {ObjectLiteral, Repository, SelectQueryBuilder} from 'typeorm';
import {BaseCursor} from "../types/cursor.pagination.types";

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
        return {items, total};
    }

    // Cursor-based pagination
    // async paginateCursor(
    //     queryBuilder: SelectQueryBuilder<T>,
    //     after: number | null,
    //     limit: number
    // ): Promise<{ items: T[], nextCursor: number | null, hasMore: boolean, total: number, remaining: number }> {
    //     const total = await queryBuilder.getCount();
    //     if (after) {
    //         queryBuilder.where('ep.id > :after', {after});
    //     }
    //     const items = await queryBuilder.take(limit).getMany();
    //     const nextCursor = items.length > 0 ? items[items.length - 1].id : null;
    //     const hasMore = items.length === limit;
    //     const fetchedCount = after
    //         ? await this.repo.createQueryBuilder('ep')
    //         .where('ep.id <= :after', {after})
    //         .andWhere(queryBuilder.getQuery(), queryBuilder.getParameters())
    //         .getCount() + items.length // Сколько уже загружено + текущая порция
    //         : items.length;
    //     const remaining = Math.max(total - fetchedCount, 0);
    //
    //     return {items, nextCursor, hasMore, total, remaining};
    // }

    // src/common/repository/base.repository.ts

// Добавляем generic параметр для типа курсора
    async paginateCursor<C extends BaseCursor>(
        queryBuilder: SelectQueryBuilder<T>,
        after: C | null,
        limit: number,
        cursorConfig: {
            cursorFields: (keyof C)[],
            entityAliases: Record<keyof C, string>
        } = {cursorFields: ['id' as keyof C], entityAliases: {'id': 'entity'} as any}
    ): Promise<{
        items: T[];
        nextCursor: C | null;
        hasMore: boolean;
        total: number;
        remaining: number;
    }> {
        // Клонируем запрос для подсчета общего количества
        const countQuery = queryBuilder.clone();

        // Если есть курсор, применяем фильтрацию по составному ключу
        if (after) {
            // Логика составного курсора с учетом нескольких полей
            const conditions: string[] = [];
            const params: Record<string, any> = {};

            // Получаем список полей для курсора
            const fields = cursorConfig.cursorFields;

            if (fields.length === 1) {
                // Простой случай - один field (обычно id)
                const field = fields[0];
                const alias = cursorConfig.entityAliases[field] || 'entity';
                queryBuilder.andWhere(`${alias}.${String(field)} > :${String(field)}Value`,
                    {[`${String(field)}Value`]: after[field]});
            } else {
                // Сложный случай - составной курсор (например, id + created_at)

                // Создаем условие вида:
                // (field1 > value1) OR (field1 = value1 AND field2 > value2) OR...

                let condition = '';
                for (let i = 0; i < fields.length; i++) {
                    const subConditions: string[] = [];

                    // Добавляем условия равенства для предыдущих полей
                    for (let j = 0; j < i; j++) {
                        const field = fields[j];
                        const alias = cursorConfig.entityAliases[field] || 'entity';
                        subConditions.push(`${alias}.${String(field)} = :${String(field)}Value`);
                        params[`${String(field)}Value`] = after[field];
                    }

                    // Добавляем условие "больше" для текущего поля
                    const field = fields[i];
                    const alias = cursorConfig.entityAliases[field] || 'entity';
                    subConditions.push(`${alias}.${String(field)} > :${String(field)}Value`);
                    params[`${String(field)}Value`] = after[field];

                    // Объединяем подусловия
                    if (subConditions.length > 0) {
                        conditions.push(`(${subConditions.join(' AND ')})`);
                    }
                }

                // Применяем все условия
                if (conditions.length > 0) {
                    queryBuilder.andWhere(`(${conditions.join(' OR ')})`, params);
                }
            }
        }

        // Получаем общее количество элементов без учета пагинации
        const totalCount = await countQuery.getCount();

        // Применяем лимит к запросу
        queryBuilder.take(limit + 1); // +1 для проверки наличия следующей страницы

        const items = await queryBuilder.getMany();

        const hasMore = items.length > limit;
        if (hasMore) {
            items.pop(); // Удаляем лишний элемент
        }

        // Формируем курсор на основе последнего элемента
        let nextCursor: C | null = null;
        if (hasMore && items.length > 0) {
            const lastItem = items[items.length - 1] as any;

            // Создаем новый курсор с нужными полями
            nextCursor = {} as C;
            for (const field of cursorConfig.cursorFields) {
                const alias = cursorConfig.entityAliases[field] || 'entity';
                const path = String(field).split('.');

                // Получаем значение поля из последнего элемента (с учетом вложенности)
                let value = lastItem;
                for (const segment of path) {
                    if (value[segment] !== undefined) {
                        value = value[segment];
                    } else {
                        value = null;
                        break;
                    }
                }

                nextCursor[field] = value;
            }
        }

        // Вычисляем оставшиеся элементы
        const loadedCount = items.length + (after ? 1 : 0); // +1 если есть курсор
        const remaining = Math.max(0, totalCount - loadedCount);

        return {
            items,
            nextCursor,
            hasMore,
            total: totalCount,
            remaining
        };
    }

}