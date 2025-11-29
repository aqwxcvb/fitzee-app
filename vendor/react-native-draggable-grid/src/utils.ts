/**
 * Find a key in an object that matches the predicate
 */
export function findKey<T>(
    map: Record<string, T>,
    predicate: (item: T) => boolean
): string | undefined {
    const keys = Object.keys(map);
    for (const key of keys) {
        if (predicate(map[key])) {
            return key;
        }
    }
    return undefined;
}

/**
 * Find the index of an item in an array that matches the predicate
 */
export function findIndex<T>(
    array: T[],
    predicate: (item: T) => boolean
): number {
    for (let i = 0; i < array.length; i++) {
        if (predicate(array[i])) {
            return i;
        }
    }
    return -1;
}

/**
 * Get items from arr1 that don't exist in arr2 based on a key
 */
export function differenceBy<T extends Record<string, unknown>>(
    arr1: T[],
    arr2: T[],
    key: string
): T[] {
    return arr1.filter((item1) => {
        const keyValue = item1[key];
        return !arr2.some((item2) => item2[key] === keyValue);
    });
}

/**
 * Calculate distance between two positions
 */
export function getDistance(
    start: { x: number; y: number },
    end: { x: number; y: number },
    offset: { x: number; y: number } = { x: 0, y: 0 }
): number {
    const xDistance = start.x + offset.x - end.x;
    const yDistance = start.y + offset.y - end.y;
    return Math.sqrt(xDistance ** 2 + yDistance ** 2);
}
