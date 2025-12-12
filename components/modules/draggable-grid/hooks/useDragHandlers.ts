import { useCallback, useMemo, useRef } from "react";
import { Animated, PanResponder, PanResponderGestureState } from "react-native";
import type { BaseItemType, Position } from "react-native-draggable-grid/src/types";
import {
    calculateNewOrders,
    calculateOrderByPosition,
    calculateTotalGridHeight,
    hasPassedBorder,
    isOutsideGridBounds,
    isOverlappingCenter,
} from "../utils/grid-calculations";

interface UseDragHandlersOptions<T extends BaseItemType> {
    numColumns: number;
    blockWidth: number;
    blockHeight: number;
    enableGrouping: boolean;
    internalData: T[];
    itemsMap: React.MutableRefObject<Map<string, T>>;
    orderMap: React.MutableRefObject<Map<string, number>>;
    itemAnims: React.MutableRefObject<Map<string, Animated.ValueXY>>;
    getPositionByIndex: (index: number, orderMapOverride?: Map<string, number>) => Position;
    getKeyByOrder: (order: number) => string | undefined;
    getHeightForItem: (item: T | undefined) => number;
    getHeightByKey: (key: string) => number;
    getItemHeight?: (item: T) => number;
    setInternalData: React.Dispatch<React.SetStateAction<T[]>>;
    activeItemKey: string | undefined;
    setActiveItemKey: React.Dispatch<React.SetStateAction<string | undefined>>;
    groupedItemKey: string | undefined;
    setGroupedItemKey: (key: string | undefined) => void;
    onDragStart?: (item: T) => void;
    onDragging?: (gestureState: PanResponderGestureState) => void;
    onDragRelease?: (newSortedData: T[]) => void;
    onDragOutside?: (item: T) => void;
    onGroupCreate?: (items: T[], targetItem: T) => void;
}

interface UseDragHandlersReturn {
    panResponder: ReturnType<typeof PanResponder.create>;
    isDraggingRef: React.MutableRefObject<boolean>;
    activeItemKeyRef: React.MutableRefObject<string | undefined>;
    applyScrollOffset: (deltaY: number) => void;
}

const HOVER_DELAY = 300;
const ANIMATION_DURATION = 200;

export function useDragHandlers<T extends BaseItemType>({
    numColumns,
    blockWidth,
    blockHeight,
    enableGrouping,
    internalData,
    itemsMap,
    orderMap,
    itemAnims,
    getPositionByIndex,
    getKeyByOrder,
    getHeightForItem,
    getHeightByKey,
    getItemHeight,
    setInternalData,
    activeItemKey,
    setActiveItemKey,
    groupedItemKey,
    setGroupedItemKey,
    onDragStart,
    onDragging,
    onDragRelease,
    onDragOutside,
    onGroupCreate,
}: UseDragHandlersOptions<T>): UseDragHandlersReturn {
    const isDraggingRef = useRef(false);
    const activeItemKeyRef = useRef<string | undefined>(undefined);
    const initialDragPositionRef = useRef<Position | null>(null);
    const hoveredItemKeyRef = useRef<string | undefined>(undefined);
    const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const groupedItemKeyRef = useRef<string | undefined>(undefined);

    const handleHoverRef = useRef<(key: string, x: number, y: number) => void>(() => {});
    const handleReorderRef = useRef<(key: string, x: number, y: number) => void>(() => {});

    activeItemKeyRef.current = activeItemKey;
    groupedItemKeyRef.current = groupedItemKey;

    const getHeightAtOrder = useCallback(
        (order: number): number => {
            const key = getKeyByOrder(order);
            return key ? getHeightByKey(key) : blockHeight;
        },
        [blockHeight, getHeightByKey, getKeyByOrder]
    );

    const getSortedItems = useCallback((): T[] => {
        return Array.from(itemsMap.current.values()).sort(
            (a, b) => (orderMap.current.get(String(a.key)) ?? 0) - (orderMap.current.get(String(b.key)) ?? 0)
        );
    }, [itemsMap, orderMap]);

    const handleHover = useCallback(
        (activeKey: string, x: number, y: number) => {
            if (!enableGrouping || !blockWidth || !blockHeight) return;

            const sortedItems = getSortedItems();
            let hoveredOrder = calculateOrderByPosition(
                x,
                y,
                numColumns,
                blockWidth,
                blockHeight,
                sortedItems,
                getItemHeight
            );
            hoveredOrder = Math.max(0, Math.min(internalData.length - 1, hoveredOrder));

            const targetKey = getKeyByOrder(hoveredOrder);
            const targetHeight = getHeightAtOrder(hoveredOrder);

            if (!targetKey || targetKey === activeKey) {
                if (hoverTimerRef.current) {
                    clearTimeout(hoverTimerRef.current);
                    hoverTimerRef.current = null;
                }
                if (hoveredItemKeyRef.current) {
                    hoveredItemKeyRef.current = undefined;
                    setGroupedItemKey(undefined);
                }
                return;
            }

            const targetPos = getPositionByIndex(hoveredOrder);
            const activeOrder = orderMap.current.get(activeKey);
            const activeHeight = activeOrder !== undefined ? getHeightAtOrder(activeOrder) : blockHeight;

            const isHoveringCenter = isOverlappingCenter(
                x,
                y,
                activeHeight,
                targetPos,
                targetHeight,
                blockWidth
            );

            if (isHoveringCenter) {
                if (hoveredItemKeyRef.current !== targetKey) {
                    if (hoverTimerRef.current) {
                        clearTimeout(hoverTimerRef.current);
                    }
                    hoveredItemKeyRef.current = targetKey;
                    setGroupedItemKey(undefined);

                    hoverTimerRef.current = setTimeout(() => {
                        setGroupedItemKey(targetKey);
                    }, HOVER_DELAY);
                }
            } else {
                if (hoverTimerRef.current) {
                    clearTimeout(hoverTimerRef.current);
                    hoverTimerRef.current = null;
                }
                hoveredItemKeyRef.current = undefined;
                setGroupedItemKey(undefined);
            }
        },
        [
            enableGrouping,
            blockWidth,
            blockHeight,
            numColumns,
            internalData.length,
            getItemHeight,
            getKeyByOrder,
            getHeightAtOrder,
            getPositionByIndex,
            orderMap,
            setGroupedItemKey,
            getSortedItems,
        ]
    );

    const handleReorder = useCallback(
        (activeKey: string, x: number, y: number) => {
            if (!blockWidth || !blockHeight) return;

            const sortedItems = getSortedItems();
            let newOrder = calculateOrderByPosition(
                x,
                y,
                numColumns,
                blockWidth,
                blockHeight,
                sortedItems,
                getItemHeight
            );
            newOrder = Math.max(0, Math.min(internalData.length - 1, newOrder));

            const oldOrder = orderMap.current.get(activeKey);
            if (oldOrder === undefined) return;

            const activeHeight = getHeightAtOrder(oldOrder);
            const targetKey = getKeyByOrder(newOrder);

            if (targetKey) {
                const targetItem = itemsMap.current.get(targetKey);
                if (targetItem?.disabledReSorted) return;
            }

            const targetHeight = getHeightAtOrder(newOrder);

            if (enableGrouping && targetKey && targetKey !== activeKey) {
                const targetPos = getPositionByIndex(newOrder);
                const initialPos = initialDragPositionRef.current;
                if (!initialPos) return;

                const passedBorder = hasPassedBorder(
                    x,
                    y,
                    initialPos,
                    targetPos,
                    activeHeight,
                    targetHeight,
                    blockWidth,
                    oldOrder,
                    newOrder
                );

                if (!passedBorder) return;

                if (hoverTimerRef.current) {
                    clearTimeout(hoverTimerRef.current);
                    hoverTimerRef.current = null;
                }
                hoveredItemKeyRef.current = undefined;
                setGroupedItemKey(undefined);

                const newActivePos = getPositionByIndex(newOrder);
                initialDragPositionRef.current = { x: newActivePos.x, y: newActivePos.y };
            }

            if (newOrder !== oldOrder) {
                const newOrderMap = calculateNewOrders(orderMap.current, activeKey, oldOrder, newOrder, itemsMap.current);

                newOrderMap.forEach((nextOrder, key) => {
                    if (key === activeKey) return;
                    const currentOrder = orderMap.current.get(key);
                    if (currentOrder === nextOrder) return;

                    const anim = itemAnims.current.get(key);
                    if (anim) {
                        const newPos = getPositionByIndex(nextOrder, newOrderMap);
                        Animated.timing(anim, {
                            toValue: newPos,
                            duration: ANIMATION_DURATION,
                            useNativeDriver: false,
                        }).start();
                    }
                });

                orderMap.current = newOrderMap;
            }
        },
        [
            blockWidth,
            blockHeight,
            numColumns,
            internalData.length,
            enableGrouping,
            getItemHeight,
            itemsMap,
            orderMap,
            itemAnims,
            getKeyByOrder,
            getHeightAtOrder,
            getPositionByIndex,
            setGroupedItemKey,
            getSortedItems,
        ]
    );

    handleHoverRef.current = handleHover;
    handleReorderRef.current = handleReorder;

    const finishDrag = useCallback(() => {
        const key = activeItemKeyRef.current;
        const currentGroupedItemKey = groupedItemKeyRef.current;
        const shouldCreateGroup = enableGrouping && currentGroupedItemKey && currentGroupedItemKey !== key;

        if (key) {
            const anim = itemAnims.current.get(key);
            const order = orderMap.current.get(key);

            if (anim && order !== undefined) {
                const currentX = (anim.x as any)._value + (anim.x as any)._offset;
                const currentY = (anim.y as any)._value + (anim.y as any)._offset;

                const sortedItems = getSortedItems();
                const gridHeight = calculateTotalGridHeight(sortedItems, numColumns, blockHeight, getItemHeight);
                const gridWidth = numColumns * blockWidth;
                const activeHeight = getHeightAtOrder(order);

                const isOutside = isOutsideGridBounds(currentX, currentY, gridWidth, gridHeight, activeHeight);

                anim.flattenOffset();

                if (isOutside && onDragOutside) {
                    const draggedItem = itemsMap.current.get(key);
                    if (draggedItem) {
                        onDragOutside(draggedItem);
                    }
                    setActiveItemKey(undefined);
                    activeItemKeyRef.current = undefined;
                } else if (shouldCreateGroup) {
                    const targetOrder = orderMap.current.get(currentGroupedItemKey);
                    const targetPos = targetOrder !== undefined ? getPositionByIndex(targetOrder) : getPositionByIndex(order);

                    Animated.timing(anim, {
                        toValue: targetPos,
                        duration: ANIMATION_DURATION,
                        useNativeDriver: false,
                    }).start(() => {
                        const draggedItem = itemsMap.current.get(key);
                        const targetItem = itemsMap.current.get(currentGroupedItemKey);

                        if (draggedItem && targetItem && onGroupCreate) {
                            onGroupCreate([draggedItem, targetItem], targetItem);
                        }

                        setActiveItemKey(undefined);
                        activeItemKeyRef.current = undefined;
                    });
                } else {
                    const finalPos = getPositionByIndex(order);
                    Animated.timing(anim, {
                        toValue: finalPos,
                        duration: ANIMATION_DURATION,
                        useNativeDriver: false,
                    }).start(() => {
                        const sorted = Array.from(itemsMap.current.values()).sort(
                            (a, b) => orderMap.current.get(String(a.key))! - orderMap.current.get(String(b.key))!
                        );
                        onDragRelease?.(sorted);
                        setInternalData(sorted);

                        setActiveItemKey(undefined);
                        activeItemKeyRef.current = undefined;
                    });
                }
            }
        } else {
            setActiveItemKey(undefined);
            activeItemKeyRef.current = undefined;
        }

        isDraggingRef.current = false;
        initialDragPositionRef.current = null;
        hoveredItemKeyRef.current = undefined;
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }
        setGroupedItemKey(undefined);
    }, [
        enableGrouping,
        numColumns,
        blockWidth,
        blockHeight,
        getItemHeight,
        itemsMap,
        orderMap,
        itemAnims,
        getPositionByIndex,
        getHeightAtOrder,
        setInternalData,
        setActiveItemKey,
        setGroupedItemKey,
        onDragOutside,
        onGroupCreate,
        onDragRelease,
        getSortedItems,
    ]);

    const applyScrollOffset = useCallback(
        (deltaY: number) => {
            if (!deltaY || !isDraggingRef.current) return;
            const key = activeItemKeyRef.current;
            if (!key) return;
            const anim = itemAnims.current.get(key);
            if (!anim) return;

            const currentXOffset = (anim.x as any)._offset;
            const currentYOffset = (anim.y as any)._offset;
            const currentXValue = (anim.x as any)._value;
            const currentYValue = (anim.y as any)._value;

            anim.setOffset({ x: currentXOffset, y: currentYOffset + deltaY });

            const currentX = currentXValue + currentXOffset;
            const currentY = currentYValue + currentYOffset + deltaY;
            handleHoverRef.current(key, currentX, currentY);
            handleReorderRef.current(key, currentX, currentY);
        },
        [itemAnims]
    );

    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: () => false,
                onMoveShouldSetPanResponder: (_, gestureState) => {
                    const isDragging = !!activeItemKeyRef.current;
                    const isMoving = Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
                    return isDragging && isMoving;
                },
                onPanResponderTerminationRequest: () => !isDraggingRef.current,
                onShouldBlockNativeResponder: () => isDraggingRef.current,
                onPanResponderGrant: () => {
                    if (!activeItemKeyRef.current) return;

                    isDraggingRef.current = true;
                    const key = activeItemKeyRef.current;
                    const anim = itemAnims.current.get(key);
                    const currentOrder = orderMap.current.get(key);

                    if (anim && currentOrder !== undefined) {
                        const slotPos = getPositionByIndex(currentOrder);
                        anim.setOffset({ x: slotPos.x, y: slotPos.y });
                        anim.setValue({ x: 0, y: 0 });

                        initialDragPositionRef.current = { x: slotPos.x, y: slotPos.y };
                        hoveredItemKeyRef.current = undefined;

                        if (hoverTimerRef.current) {
                            clearTimeout(hoverTimerRef.current);
                            hoverTimerRef.current = null;
                        }
                        setGroupedItemKey(undefined);

                        onDragStart?.(itemsMap.current.get(key)!);
                    }
                },
                onPanResponderMove: (_, gestureState) => {
                    if (!activeItemKeyRef.current) return;

                    const key = activeItemKeyRef.current;
                    const anim = itemAnims.current.get(key);

                    if (anim) {
                        anim.setValue({ x: gestureState.dx, y: gestureState.dy });

                        const currentX = (anim.x as any)._value + (anim.x as any)._offset;
                        const currentY = (anim.y as any)._value + (anim.y as any)._offset;

                        handleHoverRef.current(key, currentX, currentY);
                        handleReorderRef.current(key, currentX, currentY);
                    }

                    onDragging?.(gestureState);
                },
                onPanResponderRelease: () => {
                    finishDrag();
                },
                onPanResponderTerminate: () => {
                    if (isDraggingRef.current) {
                        finishDrag();
                    }
                },
            }),
        [blockWidth, blockHeight, numColumns, getPositionByIndex, itemsMap, orderMap, itemAnims, setGroupedItemKey, onDragStart, onDragging, finishDrag]
    );

    return {
        panResponder,
        isDraggingRef,
        activeItemKeyRef,
        applyScrollOffset,
    };
}
