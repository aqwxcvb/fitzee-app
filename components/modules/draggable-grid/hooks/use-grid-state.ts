import { useCallback, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import type { BaseItemType, ContainerLayout, Position } from "../types";
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
    getHeightByKey: (key: string) => number;
}

const ANIMATION_DURATION = 200;

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

    const getHeightByKey = useCallback(
        (key: string): number => {
            const item = itemsMap.current.get(key);
            if (!item) return blockHeight;
            return getItemHeight ? getItemHeight(item) : blockHeight;
        },
        [blockHeight, getItemHeight]
    );

    const getPositionByIndex = useCallback(
        (index: number, orderMapOverride?: Map<string, number>): Position => {
            if (!containerLayout) return { x: 0, y: 0 };

            const currentOrderMap = orderMapOverride || orderMap.current;
            const sortedItems = Array.from(itemsMap.current.values()).sort(
                (a, b) => (currentOrderMap.get(String(a.key)) ?? 0) - (currentOrderMap.get(String(b.key)) ?? 0)
            );

            return calculatePositionByIndex(index, numColumns, blockWidth, blockHeight, sortedItems, getItemHeight);
        },
        [containerLayout, numColumns, blockWidth, blockHeight, getItemHeight]
    );

    const getKeyByOrder = useCallback((order: number): string | undefined => {
        for (const [key, val] of orderMap.current.entries()) {
            if (val === order) return key;
        }
        return undefined;
    }, []);

    const animateToPosition = useCallback((anim: Animated.ValueXY, pos: Position) => {
        Animated.timing(anim, {
            toValue: pos,
            duration: ANIMATION_DURATION,
            useNativeDriver: false,
        }).start();
    }, []);

    useEffect(() => {
        setInternalData(data);

        const currentKeys = new Set(data.map((i) => String(i.key)));
        const previousKeys = new Set(itemsMap.current.keys());

        // Supprimer les items qui n'existent plus
        for (const key of previousKeys) {
            if (!currentKeys.has(key)) {
                itemsMap.current.delete(key);
                orderMap.current.delete(key);
                itemAnims.current.delete(key);
                itemHeightsRef.current.delete(key);
            }
        }

        // Détecter les changements de hauteur et les nouveaux items
        let heightsChanged = false;
        const newItemKeys = new Set<string>();

        data.forEach((item, index) => {
            const key = String(item.key);
            const currentHeight = getItemHeight ? getItemHeight(item) : blockHeight;
            const previousHeight = itemHeightsRef.current.get(key);
            const isNew = !previousKeys.has(key);

            if (isNew) {
                newItemKeys.add(key);
            } else if (previousHeight !== undefined && previousHeight !== currentHeight) {
                heightsChanged = true;
            }

            itemHeightsRef.current.set(key, currentHeight);
            itemsMap.current.set(key, item);
            orderMap.current.set(key, index);

            if (!itemAnims.current.has(key)) {
                itemAnims.current.set(key, new Animated.ValueXY(getPositionByIndex(index)));
            }
        });

        // Mettre à jour les positions si nécessaire
        if (!containerLayout) return;

        data.forEach((item, index) => {
            const key = String(item.key);
            const anim = itemAnims.current.get(key);
            if (!anim) return;

            const isActive = key === activeItemKeyRef.current && isDraggingRef.current;
            if (isActive) return;

            const pos = getPositionByIndex(index);

            if (newItemKeys.has(key)) {
                // Nouveaux items : position immédiate (cachés par opacité)
                anim.setValue(pos);
                return;
            }

            if (heightsChanged) {
                animateToPosition(anim, pos);
                return;
            }

            // Animer seulement si la position a changé
            const currentX = (anim.x as any)._value;
            const currentY = (anim.y as any)._value;
            if (Math.abs(currentX - pos.x) > 0.5 || Math.abs(currentY - pos.y) > 0.5) {
                animateToPosition(anim, pos);
            }
        });
    }, [data, numColumns, blockWidth, blockHeight, containerLayout, getItemHeight, getPositionByIndex, animateToPosition]);

    return {
        internalData,
        setInternalData,
        itemsMap,
        orderMap,
        itemAnims,
        getPositionByIndex,
        getKeyByOrder,
        getHeightByKey,
    };
}