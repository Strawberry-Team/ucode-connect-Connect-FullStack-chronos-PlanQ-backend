// src/common/base-repository.ts
import {ObjectLiteral, Repository, SelectQueryBuilder} from 'typeorm';
import {BaseCursor, EventCursor} from "../types/cursor.pagination.types";
import {EventParticipation} from "../../event-participation/entity/event-participation.entity";

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

    async paginateCursor<C extends BaseCursor>(
        queryBuilder: SelectQueryBuilder<T>,
        after: C | null,
        limit: number,
        cursorConfig: {
            cursorFields: (keyof C)[];
            entityAliases: Record<keyof C, string>;
            sortDirections?: Record<keyof C, 'ASC' | 'DESC'>;
            getFieldValue?: (item: any, field: keyof C) => any;
        }
    ): Promise<{
        items: T[];
        nextCursor: C | null;
        hasMore: boolean;
        total: number;
        remaining: number;
    }> {
        // Вывод исходного запроса
        console.log("BEFORE CURSOR - Raw SQL:", queryBuilder.getSql());
        console.log("BEFORE CURSOR - All parameters:", queryBuilder.getParameters());

        // Получаем общее количество записей без учета курсора
        const countQuery = queryBuilder.clone();
        const totalCount = await countQuery.getCount();
        console.log("Total count without cursor:", totalCount);

        // Выполняем запрос без курсора, чтобы увидеть все записи
        if (after instanceof EventCursor) {
            const allItemsQuery = queryBuilder.clone();
            const allItems = await allItemsQuery.limit(20).getMany();
            console.log("First 20 items without cursor condition:",
                allItems.map(item => {
                    if ('event' in (item as any)) {
                        const ep = item as unknown as EventParticipation;
                        return {
                            ep_id: ep.id,
                            event_id: ep.event.id,
                            event_createdAt: ep.event.createdAt,
                            cursor_id: after.id,
                            cursor_createdAt: after.createdAt,
                            would_match: (
                                (ep.event.createdAt < new Date(after.createdAt)) ||
                                (ep.event.createdAt.getTime() === new Date(after.createdAt).getTime() && ep.id > after.id)
                            )
                        };
                    }
                    return item;
                })
            );

            // Теперь добавляем условия курсора
            const conditions: string[] = [];
            const params: Record<string, any> = {};

            // Получаем поля и направления сортировки
            const fields = cursorConfig.cursorFields;
            const directions = fields.map((field) =>
                cursorConfig.sortDirections?.[field] || 'ASC'
            );

            // Создаем условия для курсор-пагинации
            const firstField = fields[0];
            const firstAlias = cursorConfig.entityAliases[firstField];
            const firstDir = directions[0];
            const firstParam = `${String(firstField)}Main`;

            // Важно: оператор сравнения зависит от направления сортировки
            const firstOp = firstDir === 'DESC' ? '<' : '>';

            // Явно конвертируем значение даты в ISO строку для консистентности
            const firstValue = typeof after[firstField] === 'string'
                ? after[firstField]
                : (after[firstField] instanceof Date
                    ? after[firstField].toISOString()
                    : String(after[firstField]));

            conditions.push(`${firstAlias}.${String(firstField)} ${firstOp} :${firstParam}`);
            params[firstParam] = firstValue;

            console.log(`First field condition: ${firstAlias}.${String(firstField)} ${firstOp} ${firstValue}`);

            if (fields.length > 1) {
                const equalConditions: string[] = [];

                equalConditions.push(`${firstAlias}.${String(firstField)} = :${firstParam}Equal`);
                params[`${firstParam}Equal`] = firstValue;

                const secondField = fields[1];
                const secondAlias = cursorConfig.entityAliases[secondField];
                const secondDir = directions[1];
                const secondParam = `${String(secondField)}Next`;
                const secondOp = secondDir === 'DESC' ? '<' : '>';

                // Для ID используем числовое значение
                const secondValue = typeof after[secondField] === 'number'
                    ? after[secondField]
                    : Number(after[secondField]);

                equalConditions.push(`${secondAlias}.${String(secondField)} ${secondOp} :${secondParam}`);
                params[secondParam] = secondValue;

                console.log(`Second field condition (when first fields equal): ${secondAlias}.${String(secondField)} ${secondOp} ${secondValue}`);

                conditions.push(`(${equalConditions.join(' AND ')})`);
            }

            const whereClause = `(${conditions.join(' OR ')})`;
            console.log("Final cursor WHERE clause:", whereClause);

            queryBuilder.andWhere(whereClause, params);

            // Логируем финальный SQL запрос
            console.log("AFTER CURSOR - Raw SQL:", queryBuilder.getSql());
            console.log("AFTER CURSOR - All parameters:", queryBuilder.getParameters());

            // Проверяем, будут ли найдены записи с этим курсором
            const checkQuery = queryBuilder.clone();
            const checkCount = await checkQuery.getCount();
            console.log(`Records that match cursor conditions: ${checkCount}`);
        }

        // Применяем лимит
        queryBuilder.take(limit + 1);

        // Выполняем запрос
        const items = await queryBuilder.getMany();
        console.log(`Actually found ${items.length} items`);

        if (items.length > 0) {
            console.log("First item:", items[0]);
            console.log("Last item:", items[items.length - 1]);
        }

        const hasMore = items.length > limit;
        if (hasMore) {
            items.pop();
        }

        // Формируем курсор для следующей страницы
        let nextCursor: C | null = null;
        if (items.length > 0) {
            const lastItem = items[items.length - 1];
            nextCursor = {} as C;

            for (const field of cursorConfig.cursorFields) {
                if (cursorConfig.getFieldValue) {
                    nextCursor[field] = cursorConfig.getFieldValue(lastItem, field);
                } else {
                    const fieldPath = String(field).split('.');
                    let value: any = lastItem;

                    for (const segment of fieldPath) {
                        if (value && value[segment] !== undefined) {
                            value = value[segment];
                        } else {
                            value = null;
                            break;
                        }
                    }

                    nextCursor[field] = value;
                }
            }

            console.log("Generated nextCursor:", nextCursor);
        }

        const remaining = totalCount - (after ? 0 : items.length);
        console.log(`Calculated remaining: ${remaining} (total: ${totalCount}, items.length: ${items.length})`);

        return {
            items,
            nextCursor,
            hasMore,
            total: totalCount,
            remaining
        };
    }









}