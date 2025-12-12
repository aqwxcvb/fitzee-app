import type { BaseItemType, Position } from "react-native-draggable-grid/src/types";

export function calculatePositionByIndex<T extends BaseItemType>(
    index: number,
    numColumns: number,
    blockWidth: number,
    blockHeight: number,
    items: T[],
    getItemHeight?: (item: T) => number
): Position {
    const col = index % numColumns;

    if (getItemHeight && numColumns === 1) {
        let yPos = 0;
        for (let i = 0; i < index && i < items.length; i++) {
            yPos += getItemHeight(items[i]);
        }
        return { x: col * blockWidth, y: yPos };
    }

    const row = Math.floor(index / numColumns);
    return {
        x: col * blockWidth,
        y: row * blockHeight,
    };
}

export function calculateOrderByPosition<T extends BaseItemType>(
    x: number,
    y: number,
    numColumns: number,
    blockWidth: number,
    blockHeight: number,
    items: T[],
    getItemHeight?: (item: T) => number
): number {
    if (getItemHeight && numColumns === 1) {
        let cumulativeY = 0;
        for (let i = 0; i < items.length; i++) {
            const itemH = getItemHeight(items[i]);
            if (y + itemH / 2 < cumulativeY + itemH) {
                return i;
            }
            cumulativeY += itemH;
        }
        return Math.max(0, items.length - 1);
    }

    const col = Math.floor((x + blockWidth / 2) / blockWidth);
    const row = Math.floor((y + blockHeight / 2) / blockHeight);
    return row * numColumns + col;
}

export function calculateTotalGridHeight<T extends BaseItemType>(
    items: T[],
    numColumns: number,
    blockHeight: number,
    getItemHeight?: (item: T) => number
): number {
    if (getItemHeight && numColumns === 1) {
        return items.reduce((sum, item) => sum + getItemHeight(item), 0);
    }
    return Math.ceil(items.length / numColumns) * blockHeight;
}

export function isPointInsideItem<T extends BaseItemType>(
    x: number,
    y: number,
    items: T[],
    orderMap: Map<string, number>,
    numColumns: number,
    blockWidth: number,
    blockHeight: number,
    getItemHeight?: (item: T) => number
): boolean {
    for (const item of items) {
        const key = String(item.key);
        const order = orderMap.get(key);
        if (order === undefined) continue;

        const pos = calculatePositionByIndex(order, numColumns, blockWidth, blockHeight, items, getItemHeight);
        const itemH = getItemHeight ? getItemHeight(item) : blockHeight;

        if (x >= pos.x && x <= pos.x + blockWidth && y >= pos.y && y <= pos.y + itemH) {
            return true;
        }
    }
    return false;
}

export function isOverlappingCenter(
    draggedX: number,
    draggedY: number,
    draggedHeight: number,
    targetPos: Position,
    targetHeight: number,
    blockWidth: number,
    threshold: number = 0.4
): boolean {
    const draggedCenterX = draggedX + blockWidth / 2;
    const draggedCenterY = draggedY + draggedHeight / 2;
    const targetCenterX = targetPos.x + blockWidth / 2;
    const targetCenterY = targetPos.y + targetHeight / 2;

    return (
        Math.abs(draggedCenterX - targetCenterX) < blockWidth * threshold &&
        Math.abs(draggedCenterY - targetCenterY) < targetHeight * threshold
    );
}

export function hasPassedBorder(
    currentX: number,
    currentY: number,
    initialPos: Position,
    targetPos: Position,
    activeHeight: number,
    targetHeight: number,
    blockWidth: number,
    oldOrder: number,
    newOrder: number
): boolean {
    const deltaX = Math.abs(currentX - initialPos.x);
    const deltaY = Math.abs(currentY - initialPos.y);
    const isHorizontalMovement = deltaX > deltaY;

    if (isHorizontalMovement) {
        if (oldOrder < newOrder) {
            return currentX >= targetPos.x + blockWidth;
        }
        return currentX <= targetPos.x;
    }

    if (oldOrder < newOrder) {
        return currentY + activeHeight >= targetPos.y + targetHeight;
    }
    return currentY <= targetPos.y;
}

export function calculateNewOrders(
    orderMap: Map<string, number>,
    activeKey: string,
    oldOrder: number,
    newOrder: number,
    itemsMap: Map<string, BaseItemType>
): Map<string, number> {
    const newOrderMap = new Map(orderMap);
    newOrderMap.set(activeKey, newOrder);

    orderMap.forEach((order, key) => {
        if (key === activeKey) return;

        const item = itemsMap.get(key);
        if (item?.disabledReSorted) return;

        let nextOrder = order;
        if (oldOrder < newOrder) {
            if (order > oldOrder && order <= newOrder) {
                nextOrder -= 1;
            }
        } else {
            if (order >= newOrder && order < oldOrder) {
                nextOrder += 1;
            }
        }

        if (nextOrder !== order) {
            newOrderMap.set(key, nextOrder);
        }
    });

    return newOrderMap;
}

export function isOutsideGridBounds(
    x: number,
    y: number,
    gridWidth: number,
    gridHeight: number,
    itemHeight: number,
    marginRatio: number = 0.3
): boolean {
    const margin = itemHeight * marginRatio;
    return x < -margin || x > gridWidth + margin || y < -margin || y > gridHeight + margin;
}
