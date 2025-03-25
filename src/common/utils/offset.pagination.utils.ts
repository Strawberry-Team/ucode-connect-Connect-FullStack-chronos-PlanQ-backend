export const calculatePaginationMetadata = (total: number, limit: number, page: number) => {
    const totalPages = Math.ceil(total / limit);
    return { total, totalPages, page, limit };
};