import { useCallback, useMemo, useRef } from 'react';
import { DraggableGridItem } from '../types';

interface LayoutDimensions {
    width: number;
    height: number;
}

export const useGridLayout = <T extends DraggableGridItem>(
    data: T[],
    numColumns: number,
    itemHeight?: number,
    getItemHeight?: (item: T) => number
) => {
    const itemsMap = useRef(new Map<string, T>());
    const orderMap = useRef(new Map<string, number>());

    // Update maps when data changes
    useMemo(() => {
        const newItemsMap = new Map<string, T>();
        const newOrderMap = new Map<string, number>();
        
        data.forEach((item, index) => {
            const key = String(item.key);
            newItemsMap.set(key, item);
            newOrderMap.set(key, index);
        });
        
        itemsMap.current = newItemsMap;
        orderMap.current = newOrderMap;
    }, [data]);

    const getItemHeightByKey = useCallback((key: string, blockHeight: number): number => {
        const item = itemsMap.current.get(key);
        if (!item) return blockHeight;
        return getItemHeight ? getItemHeight(item) : blockHeight;
    }, [getItemHeight]);

    const getPositionByIndex = useCallback((
        index: number,
        blockWidth: number,
        blockHeight: number,
        containerLayout: LayoutDimensions | null
    ) => {
        if (!containerLayout) return { x: 0, y: 0 };
        
        const col = index % numColumns;
        
        // Support dynamic heights for single column
        if (getItemHeight && numColumns === 1) {
            let yPos = 0;
            const sortedItems = Array.from(itemsMap.current.entries())
                .sort((a, b) => (orderMap.current.get(a[0]) ?? 0) - (orderMap.current.get(b[0]) ?? 0));
            
            for (let i = 0; i < index && i < sortedItems.length; i++) {
                const [, item] = sortedItems[i];
                yPos += getItemHeight(item);
            }
            
            return { x: col * blockWidth, y: yPos };
        }
        
        // Fixed height grid
        const row = Math.floor(index / numColumns);
        return {
            x: col * blockWidth,
            y: row * blockHeight,
        };
    }, [numColumns, getItemHeight]);

    const getOrderByPosition = useCallback((
        x: number,
        y: number,
        blockWidth: number,
        blockHeight: number
    ): number => {
        if (getItemHeight && numColumns === 1) {
            const sortedItems = Array.from(itemsMap.current.entries())
                .sort((a, b) => (orderMap.current.get(a[0]) ?? 0) - (orderMap.current.get(b[0]) ?? 0));
            
            let cumulativeY = 0;
            for (let i = 0; i < sortedItems.length; i++) {
                const [, item] = sortedItems[i];
                const itemH = getItemHeight(item);
                
                if (y + itemH / 2 < cumulativeY + itemH) {
                    return i;
                }
                cumulativeY += itemH;
            }
            return sortedItems.length - 1;
        }
        
        const col = Math.floor((x + blockWidth / 2) / blockWidth);
        const row = Math.floor((y + blockHeight / 2) / blockHeight);
        return row * numColumns + col;
    }, [getItemHeight, numColumns]);

    const getTotalHeight = useCallback((
        blockHeight: number
    ): number => {
        if (getItemHeight && numColumns === 1) {
            return data.reduce((sum, item) => sum + getItemHeight(item), 0);
        }
        return Math.ceil(data.length / numColumns) * blockHeight;
    }, [data, getItemHeight, numColumns]);

    const getKeyByOrder = useCallback((order: number): string | undefined => {
        for (const [key, value] of orderMap.current.entries()) {
            if (value === order) return key;
        }
        return undefined;
    }, []);

    return {
        itemsMap,
        orderMap,
        getItemHeightByKey,
        getPositionByIndex,
        getOrderByPosition,
        getTotalHeight,
        getKeyByOrder,
    };
};
