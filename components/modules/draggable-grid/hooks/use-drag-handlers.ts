import type { BaseItemType, Position } from "@/components/modules/draggable-grid/types";
import { useCallback, useMemo, useRef } from "react";
import { Animated, PanResponder, PanResponderGestureState } from "react-native";
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

    const getSortedItems = useCallback(
        (): T[] => Array.from(itemsMap.current.values()).sort(
            (a, b) => (orderMap.current.get(String(a.key)) ?? 0) - (orderMap.current.get(String(b.key)) ?? 0)
        ),
        [itemsMap, orderMap]
    );

    const isGroup = (item: T | undefined): boolean => 
        !!item && 'isGroup' in item && item.isGroup === true;

    const clearHoverState = useCallback(() => {
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }
        hoveredItemKeyRef.current = undefined;
        setGroupedItemKey(undefined);
    }, [setGroupedItemKey]);

    const startHoverTimer = useCallback((targetKey: string) => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        hoveredItemKeyRef.current = targetKey;
        setGroupedItemKey(undefined);
        hoverTimerRef.current = setTimeout(() => setGroupedItemKey(targetKey), HOVER_DELAY);
    }, [setGroupedItemKey]);

    const animateToPosition = useCallback(
        (anim: Animated.ValueXY, pos: Position, onComplete?: () => void) => {
            Animated.timing(anim, {
                toValue: pos,
                duration: ANIMATION_DURATION,
                useNativeDriver: false,
            }).start(onComplete);
        },
        []
    );

    const finishWithRelease = useCallback(
        (anim: Animated.ValueXY, order: number) => {
            animateToPosition(anim, getPositionByIndex(order), () => {
                onDragRelease?.(getSortedItems());
                setInternalData(getSortedItems());
                setActiveItemKey(undefined);
                activeItemKeyRef.current = undefined;
            });
        },
        [animateToPosition, getPositionByIndex, getSortedItems, onDragRelease, setInternalData, setActiveItemKey]
    );

    const handleHover = useCallback(
        (activeKey: string, x: number, y: number) => {
            if (!enableGrouping || !blockWidth || !blockHeight) {
                return;
            }

            const sortedItems = getSortedItems();
            const hoveredOrder = Math.max(0, Math.min(
                internalData.length - 1,
                calculateOrderByPosition(x, y, numColumns, blockWidth, blockHeight, sortedItems, getItemHeight)
            ));

            let targetKey = getKeyByOrder(hoveredOrder);
            let targetOrder = hoveredOrder;

            // Si on survole notre propre position, vérifier si on est sur un groupe voisin
            if (targetKey === activeKey) {
                const activeOrder = orderMap.current.get(activeKey);
                if (activeOrder !== undefined) {
                    // Vérifier le groupe au-dessus
                    if (activeOrder > 0) {
                        const prevKey = getKeyByOrder(activeOrder - 1);
                        const prevItem = prevKey ? itemsMap.current.get(prevKey) : undefined;
                        if (prevKey && isGroup(prevItem)) {
                            const prevHeight = getHeightByKey(prevKey);
                            const prevPos = getPositionByIndex(activeOrder - 1);
                            if (y >= prevPos.y && y <= prevPos.y + prevHeight) {
                                targetKey = prevKey;
                                targetOrder = activeOrder - 1;
                            }
                        }
                    }
                    // Vérifier le groupe en-dessous
                    if (targetKey === activeKey && activeOrder < internalData.length - 1) {
                        const nextKey = getKeyByOrder(activeOrder + 1);
                        const nextItem = nextKey ? itemsMap.current.get(nextKey) : undefined;
                        if (nextKey && isGroup(nextItem)) {
                            const nextPos = getPositionByIndex(activeOrder + 1);
                            const nextHeight = getHeightByKey(nextKey);
                            if (y >= nextPos.y && y <= nextPos.y + nextHeight) {
                                targetKey = nextKey;
                                targetOrder = activeOrder + 1;
                            }
                        }
                    }
                }
            }
            
            if (!targetKey || targetKey === activeKey) {
                clearHoverState();
                return;
            }

            const activeItem = itemsMap.current.get(activeKey);
            const targetItem = itemsMap.current.get(targetKey);

            if (isGroup(activeItem)) {
                clearHoverState();
                return;
            }

            const targetHeight = getHeightAtOrder(targetOrder);
            const targetPos = getPositionByIndex(targetOrder);
            const targetIsGroup = isGroup(targetItem);

            let isHovering = false;

            if (targetIsGroup) {
                const isInsideX = x >= targetPos.x && x <= targetPos.x + blockWidth;
                const isInsideY = y >= targetPos.y && y <= targetPos.y + targetHeight;
                isHovering = isInsideX && isInsideY;
            } else {
                const activeOrder = orderMap.current.get(activeKey);
                const activeHeight = activeOrder !== undefined ? getHeightAtOrder(activeOrder) : blockHeight;
                isHovering = isOverlappingCenter(x, y, activeHeight, targetPos, targetHeight, blockWidth);
            }

            if (isHovering && hoveredItemKeyRef.current !== targetKey) {
                startHoverTimer(targetKey);
            } else if (!isHovering) {
                clearHoverState();
            }
        },
        [
            enableGrouping, blockWidth, blockHeight, numColumns, internalData.length,
            getItemHeight, getKeyByOrder, getHeightByKey, getHeightAtOrder, getPositionByIndex,
            orderMap, itemsMap, getSortedItems, clearHoverState, startHoverTimer,
        ]
    );

    const handleReorder = useCallback(
        (activeKey: string, x: number, y: number) => {
            if (!blockWidth || !blockHeight) return;

            const sortedItems = getSortedItems();
            const newOrder = Math.max(0, Math.min(
                internalData.length - 1,
                calculateOrderByPosition(x, y, numColumns, blockWidth, blockHeight, sortedItems, getItemHeight)
            ));

            const oldOrder = orderMap.current.get(activeKey);
            if (oldOrder === undefined || newOrder === oldOrder) return;

            const targetKey = getKeyByOrder(newOrder);
            if (targetKey) {
                const targetItem = itemsMap.current.get(targetKey);
                if (targetItem?.disabledReSorted) return;
            }

            const targetItem = targetKey ? itemsMap.current.get(targetKey) : undefined;
            const targetIsGroup = isGroup(targetItem);

            if (enableGrouping && targetKey && targetKey !== activeKey) {
                const initialPos = initialDragPositionRef.current;
                if (!initialPos) return;

                const activeHeight = getHeightAtOrder(oldOrder);
                const targetHeight = getHeightAtOrder(newOrder);
                const targetPos = getPositionByIndex(newOrder);

                if (targetIsGroup) {
                    const groupCenter = targetPos.y + targetHeight / 2;
                    const movingDown = newOrder > oldOrder;
                    const movingUp = newOrder < oldOrder;

                    const itemCenter = y + activeHeight / 2;
                    const hasPassedCenter = (movingUp && itemCenter < groupCenter) || 
                                            (movingDown && itemCenter > groupCenter);

                    if (hasPassedCenter) {
                        initialDragPositionRef.current = getPositionByIndex(newOrder);
                    } else {
                        return;
                    }
                } else {
                    const passedBorder = hasPassedBorder(
                        x, y, initialPos, targetPos,
                        activeHeight, targetHeight, blockWidth,
                        oldOrder, newOrder
                    );

                    if (!passedBorder) return;

                    clearHoverState();
                    initialDragPositionRef.current = getPositionByIndex(newOrder);
                }
            }

            const newOrderMap = calculateNewOrders(orderMap.current, activeKey, oldOrder, newOrder, itemsMap.current);

            newOrderMap.forEach((nextOrder, key) => {
                if (key === activeKey) return;
                if (orderMap.current.get(key) === nextOrder) return;

                const anim = itemAnims.current.get(key);
                if (anim) {
                    animateToPosition(anim, getPositionByIndex(nextOrder, newOrderMap));
                }
            });

            orderMap.current = newOrderMap;
        },
        [
            blockWidth, blockHeight, numColumns, internalData.length, enableGrouping,
            getItemHeight, itemsMap, orderMap, itemAnims, getKeyByOrder,
            getHeightAtOrder, getPositionByIndex, getSortedItems, clearHoverState, animateToPosition,
        ]
    );

    handleHoverRef.current = handleHover;
    handleReorderRef.current = handleReorder;

    const finishDrag = useCallback(() => {
        const key = activeItemKeyRef.current;
        const targetGroupKey = groupedItemKeyRef.current;
        const shouldGroup = enableGrouping && targetGroupKey && targetGroupKey !== key;

        if (key) {
            const anim = itemAnims.current.get(key);
            const order = orderMap.current.get(key);

            if (anim && order !== undefined) {
                anim.flattenOffset();

                const sortedItems = getSortedItems();
                const gridHeight = calculateTotalGridHeight(sortedItems, numColumns, blockHeight, getItemHeight);
                const gridWidth = numColumns * blockWidth;
                const currentX = (anim.x as any)._value;
                const currentY = (anim.y as any)._value;
                const activeHeight = getHeightAtOrder(order);

                if (isOutsideGridBounds(currentX, currentY, gridWidth, gridHeight, activeHeight) && onDragOutside) {
                    const draggedItem = itemsMap.current.get(key);
                    if (draggedItem) onDragOutside(draggedItem);
                    setActiveItemKey(undefined);
                    activeItemKeyRef.current = undefined;
                } else if (shouldGroup) {
                    const draggedItem = itemsMap.current.get(key);
                    const targetItem = itemsMap.current.get(targetGroupKey);

                    if (draggedItem && targetItem && onGroupCreate) {
                        onGroupCreate([draggedItem, targetItem], targetItem);
                    } else {
                        finishWithRelease(anim, order);
                        return;
                    }

                    setActiveItemKey(undefined);
                    activeItemKeyRef.current = undefined;
                } else {
                    finishWithRelease(anim, order);
                    return;
                }
            }
        }

        setActiveItemKey(undefined);
        activeItemKeyRef.current = undefined;
        isDraggingRef.current = false;
        initialDragPositionRef.current = null;
        clearHoverState();
    }, [
        enableGrouping, numColumns, blockWidth, blockHeight, getItemHeight,
        itemsMap, orderMap, itemAnims, getHeightAtOrder, getSortedItems,
        setActiveItemKey, onDragOutside, onGroupCreate, finishWithRelease, clearHoverState,
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
        () => PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_, gs) => {
                return !!activeItemKeyRef.current && (Math.abs(gs.dx) > 2 || Math.abs(gs.dy) > 2);
            },
            onPanResponderTerminationRequest: () => !isDraggingRef.current,
            onShouldBlockNativeResponder: () => isDraggingRef.current,

            onPanResponderGrant: () => {
                const key = activeItemKeyRef.current;
                if (!key) return;

                const anim = itemAnims.current.get(key);
                const currentOrder = orderMap.current.get(key);
                if (!anim || currentOrder === undefined) return;

                isDraggingRef.current = true;
                const slotPos = getPositionByIndex(currentOrder);
                anim.setOffset(slotPos);
                anim.setValue({ x: 0, y: 0 });
                initialDragPositionRef.current = slotPos;
                clearHoverState();
                onDragStart?.(itemsMap.current.get(key)!);
            },

            onPanResponderMove: (_, gs) => {
                const key = activeItemKeyRef.current;
                if (!key) return;

                const anim = itemAnims.current.get(key);
                if (!anim) return;

                anim.setValue({ x: gs.dx, y: gs.dy });

                const currentX = (anim.x as any)._value + (anim.x as any)._offset;
                const currentY = (anim.y as any)._value + (anim.y as any)._offset;
                handleHoverRef.current(key, currentX, currentY);
                handleReorderRef.current(key, currentX, currentY);

                onDragging?.(gs);
            },

            onPanResponderRelease: finishDrag,
            onPanResponderTerminate: () => {
                if (isDraggingRef.current) finishDrag();
            },
        }),
        [getPositionByIndex, itemsMap, orderMap, itemAnims, clearHoverState, onDragStart, onDragging, finishDrag]
    );

    return { panResponder, isDraggingRef, activeItemKeyRef, applyScrollOffset };
}