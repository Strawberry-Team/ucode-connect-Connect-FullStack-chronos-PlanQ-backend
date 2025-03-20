export const BooleanTransformer = (defaultValue: boolean) => ({
    to: (entityValue: boolean): number =>
        (entityValue === undefined ? defaultValue : entityValue) ? 1 : 0,

    from: (databaseValue: any): boolean => {
        if (Buffer.isBuffer(databaseValue)) {
            return databaseValue[0] === 1;
        }
        if (typeof databaseValue === 'number') {
            return databaseValue === 1;
        }
        return Boolean(databaseValue);
    },
});

