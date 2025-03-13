export function convertToSeconds(time: number, timeType: string){
    const timeMap: Record<string, number> = {
        s: 1,
        m: 60,
        h: 3600,
        d: 86400,
        w: 604800,
    };

    const multiplier = timeMap[timeType];

    if (!multiplier) {
        throw new Error(`Unsupported type: ${timeType}`);
    }

    return time * multiplier;
}