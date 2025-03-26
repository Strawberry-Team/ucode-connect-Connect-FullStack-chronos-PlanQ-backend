// src/common/base-repository.ts
import { ObjectLiteral, Repository, SelectQueryBuilder } from "typeorm";
import { BaseCursor, EventCursor } from "../types/cursor.pagination.types";

export interface PaginationResult<T, C> {
    items: T[];
    nextCursor: C | null;
    hasMore: boolean;
    total: number;
    remaining: number;
}

export interface CursorConfig<T, C extends BaseCursor> {
    // Основные настройки курсора
    cursorFields: (keyof C)[];
    entityAliases: Record<keyof C, string>;
    sortDirections?: Record<keyof C, "ASC" | "DESC">;

    // Обработка значений
    getFieldValue?: (item: T, field: keyof C) => any;
    fieldTypes?: Partial<Record<keyof C, "date" | "number" | "string">>;

    // Дополнительные настройки
    debug?: boolean; // Включение/выключение отладочных сообщений
    customConditionBuilder?: (
        after: C,
        config: CursorConfig<T, C>
    ) => { conditions: string; parameters: Record<string, any> };
}

export class BaseRepository<T extends ObjectLiteral> {
    protected readonly repo: Repository<T>;

    constructor(repo: Repository<T>) {
        this.repo = repo;
    }

    // Offset-based pagination
    async paginateOffset(
        queryBuilder: SelectQueryBuilder<T>,
        page: number,
        limit: number
    ): Promise<{ items: T[]; total: number }> {
        const offset = (page - 1) * limit;
        const total = await queryBuilder.getCount();
        const items = await queryBuilder.skip(offset).take(limit).getMany();
        return { items, total };
    }

    async paginateCursor<C extends BaseCursor>(
        queryBuilder: SelectQueryBuilder<T>,
        after: C | null,
        limit: number,
        cursorConfig: CursorConfig<T, C>
    ): Promise<PaginationResult<T, C>> {
        const { debug = false } = cursorConfig;

        // Отладочные логи оригинального запроса
        if (debug) {
            console.log("BEFORE CURSOR - Raw SQL:", queryBuilder.getSql());
            console.log("BEFORE CURSOR - Parameters:", queryBuilder.getParameters());
        }

        // Получаем общее количество записей без учета курсора
        const countQuery = queryBuilder.clone();
        const totalCount = await countQuery.getCount();

        if (debug) {
            console.log("Total count without cursor:", totalCount);
        }

        let remainingCount = totalCount;

        // Применяем курсорное условие, если есть курсор
        if (after) {
            this.applyCursorCondition(queryBuilder, after, cursorConfig);

            if (debug) {
                console.log("AFTER CURSOR - Raw SQL:", queryBuilder.getSql());
                console.log("AFTER CURSOR - Parameters:", queryBuilder.getParameters());

                // Проверяем, будут ли найдены записи с этим курсором
                const checkQuery = queryBuilder.clone();
                const checkCount = await checkQuery.getCount();
                console.log(`Records that match cursor conditions: ${checkCount}`);
            }

            // Получаем количество оставшихся записей после применения курсора
            const remainingQuery = queryBuilder.clone();
            remainingCount = await remainingQuery.getCount();
        }

        // Применяем лимит + 1 для определения hasMore
        queryBuilder.take(limit + 1);

        // Выполняем запрос
        const items = await queryBuilder.getMany();

        if (debug) {
            console.log(`Actually found ${items.length} items`);
            if (items.length > 0) {
                console.log("First item:", items[0]);
                console.log("Last item:", items[items.length - 1]);
            }
        }

        // Определяем, есть ли еще элементы
        const hasMore = items.length > limit;

        // Удаляем лишний элемент, который нужен был только для определения hasMore
        if (hasMore) {
            items.pop();
        }

        // Формируем следующий курсор
        const nextCursor = this.buildNextCursor<C>(items, cursorConfig);

        if (debug && nextCursor) {
            console.log("Generated nextCursor:", nextCursor);
        }

        // Вычисляем оставшиеся элементы
        const remaining = Math.max(0, remainingCount - limit);

        return {
            items,
            nextCursor,
            hasMore,
            total: totalCount,
            remaining,
        };
    }

    // Вспомогательные методы для работы с курсором

    private applyCursorCondition<C extends BaseCursor>(
        queryBuilder: SelectQueryBuilder<T>,
        after: C,
        config: CursorConfig<T, C>
    ): void {
        // Используем пользовательский построитель условий, если он предоставлен
        if (config.customConditionBuilder) {
            const { conditions, parameters } = config.customConditionBuilder(
                after,
                config
            );
            queryBuilder.andWhere(conditions, parameters);
            return;
        }

        const fields = config.cursorFields;
        if (fields.length === 0) return;

        // Собираем все возможные комбинации условий для курсорной пагинации
        const { whereClause, parameters } = this.buildCursorWhereClause(after, config);

        queryBuilder.andWhere(whereClause, parameters);
    }

    /**
     * Строит условие WHERE для курсорной пагинации с произвольным количеством полей
     *
     * Например, для полей [createdAt, id, priority] создаст:
     * (event.createdAt < :createdAt_0) OR
     * (event.createdAt = :createdAt_eq_1 AND ep.id > :id_1) OR
     * (event.createdAt = :createdAt_eq_2 AND ep.id = :id_eq_2 AND priority.priority > :priority_2)
     */
    private buildCursorWhereClause<C extends BaseCursor>(
        after: C,
        config: CursorConfig<T, C>
    ): { whereClause: string; parameters: Record<string, any> } {
        const fields = config.cursorFields;
        const parameters: Record<string, any> = {};
        const conditions: string[] = [];

        // Обрабатываем каждую позицию как отдельный "уровень" условий
        for (let i = 0; i < fields.length; i++) {
            const currentField = fields[i];
            const currentAlias = config.entityAliases[currentField];
            const currentDirection = config.sortDirections?.[currentField] || "ASC";
            const currentOperator = currentDirection === "DESC" ? "<" : ">";

            const levelConditions: string[] = [];

            // Для всех предыдущих полей добавляем условие равенства
            for (let j = 0; j < i; j++) {
                const prevField = fields[j];
                const prevAlias = config.entityAliases[prevField];
                const equalParam = `${String(prevField)}_eq_${i}`;

                levelConditions.push(`${prevAlias}.${String(prevField)} = :${equalParam}`);
                parameters[equalParam] = this.getTypedValue(after[prevField], config.fieldTypes?.[prevField]);
            }

            // Для текущего поля добавляем условие сравнения
            const compareParam = `${String(currentField)}_${i}`;
            levelConditions.push(`${currentAlias}.${String(currentField)} ${currentOperator} :${compareParam}`);
            parameters[compareParam] = this.getTypedValue(after[currentField], config.fieldTypes?.[currentField]);

            // Добавляем уровень условий в общий список
            conditions.push(`(${levelConditions.join(" AND ")})`);
        }

        return {
            whereClause: `(${conditions.join(" OR ")})`,
            parameters
        };
    }

    private getTypedValue(value: any, type?: "date" | "number" | "string"): any {
        if (value === null || value === undefined) {
            return value;
        }

        switch (type) {
            case "date":
                return typeof value === "string" ? new Date(value) : value;
            case "number":
                return typeof value === "string" ? Number(value) : value;
            case "string":
                return String(value);
            default:
                return value;
        }
    }

    private buildNextCursor<C extends BaseCursor>(
        items: T[],
        config: CursorConfig<T, C>
    ): C | null {
        if (items.length === 0) {
            return null;
        }

        const lastItem = items[items.length - 1];
        const nextCursor = {} as C;

        for (const field of config.cursorFields) {
            if (config.getFieldValue) {
                nextCursor[field] = config.getFieldValue(lastItem, field);
            } else {
                const fieldPath = String(field).split(".");
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

        return nextCursor;
    }
}
