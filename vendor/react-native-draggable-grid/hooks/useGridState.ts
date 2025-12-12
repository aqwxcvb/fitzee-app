import { useCallback, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import type { BaseItemType, ContainerLayout, Position } from "../src/types";
import { calculatePositionByIndex } from "../utils/grid-calculations";

interface UseGridStateOptions<T extends BaseItemType> {
    data: T[];
    numColumns: number;
    blockWidth: number;
    blockHeight: number;
    containerLayout: ContainerLayout | null;
    getItemHeight?: (item: T) => number;
}

interface UseGridStateReturn<T extends BaseItemType> {
    internalData: T[];
    setInternalData: React.Dispatch<React.SetStateAction<T[]>>;
    itemsMap: React.MutableRefObject<Map<string, T>>;
    orderMap: React.MutableRefObject<Map<string, number>>;
    itemAnims: React.MutableRefObject<Map<string, Animated.ValueXY>>;
    getPositionByIndex: (index: number, orderMapOverride?: Map<string, number>) => Position;
    getKeyByOrder: (order: number) => string | undefined;
    getHeightForItem: (item: T | undefined) => number;
    getHeightByKey: (key: string) => number;
}

export function useGridState<T extends BaseItemType>({
    data,
    numColumns,
    blockWidth,
    blockHeight,
    containerLayout,
    getItemHeight,
}: UseGridStateOptions<T>): UseGridStateReturn<T> {
    const [internalData, setInternalData] = useState<T[]>(data);
    
    const itemsMap = useRef<Map<string, T>>(new Map());
    const orderMap = useRef<Map<string, number>>(new Map());
    const itemAnims = useRef<Map<string, Animated.ValueXY>>(new Map());
    const itemHeightsRef = useRef<Map<string, number>>(new Map());
    const isDraggingRef = useRef(false);
    const activeItemKeyRef = useRef<string | undefined>(undefined);

    const getHeightForItem = useCallback(
        (item: T | undefined): number => {
            if (!item) return blockHeight;
            if (getItemHeight) {
                return getItemHeight(item);
            }
            return blockHeight;
        },
        [blockHeight, getItemHeight]
    );

    const getHeightByKey = useCallback(
        (key: string): number => {
            const item = itemsMap.current.get(key);
            return getHeightForItem(item);
        },
        [getHeightForItem]
    );

    const getPositionByIndex = useCallback(
        (index: number, orderMapOverride?: Map<string, number>): Position => {
            if (!containerLayout) return { x: 0, y: 0 };

            const currentOrderMap = orderMapOverride || orderMap.current;
            const sortedItems = Array.from(itemsMap.current.values()).sort(
                (a, b) => (currentOrderMap.get(String(a.key)) ?? 0) - (currentOrderMap.get(String(b.key)) ?? 0)
            );

            return calculatePositionByIndex(
                index,
                numColumns,
                blockWidth,
                blockHeight,
                sortedItems,
                getItemHeight
            );
        },
        [containerLayout, numColumns, blockWidth, blockHeight, getItemHeight]
    );

    const getKeyByOrder = useCallback((order: number): string | undefined => {
        for (const [key, val] of orderMap.current.entries()) {
            if (val === order) return key;
        }
        return undefined;
    }, []);

    useEffect(() => {
        setInternalData(data);

        const keys = new Set(data.map((i) => String(i.key)));

        for (const key of Array.from(itemsMap.current.keys())) {
            if (!keys.has(key)) {
                itemsMap.current.delete(key);
                orderMap.current.delete(key);
                itemAnims.current.delete(key);
                itemHeightsRef.current.delete(key);
            }
        }

        let needsRecalculation = false;
        const newHeights = new Map<string, number>();

        data.forEach((item, index) => {
            const key = String(item.key);
            const currentHeight = getItemHeight ? getItemHeight(item) : blockHeight;
            const previousHeight = itemHeightsRef.current.get(key);

            newHeights.set(key, currentHeight);

            if (previousHeight !== undefined && previousHeight !== currentHeight) {
                needsRecalculation = true;
            }

            itemsMap.current.set(key, item);
            orderMap.current.set(key, index);

            if (!itemAnims.current.has(key)) {
                itemAnims.current.set(key, new Animated.ValueXY(getPositionByIndex(index)));
            }
        });

        itemHeightsRef.current = newHeights;

        if (containerLayout) {
            data.forEach((item, index) => {
                const key = String(item.key);
                const pos = getPositionByIndex(index);
                const anim = itemAnims.current.get(key);
                const isActive = key === activeItemKeyRef.current;

                if (anim && (!isActive || !isDraggingRef.current)) {
                    if (needsRecalculation) {
                        Animated.timing(anim, {
                            toValue: pos,
                            duration: 200,
                            useNativeDriver: false,
                        }).start();
                    } else {
                        anim.setValue(pos);
                    }
                }
            });
        }
    }, [data, numColumns, blockWidth, blockHeight, containerLayout, getItemHeight, getPositionByIndex]);

    return {
        internalData,
        setInternalData,
        itemsMap,
        orderMap,
        itemAnims,
        getPositionByIndex,
        getKeyByOrder,
        getHeightForItem,
        getHeightByKey,
    };
}
