import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    Animated,
    LayoutChangeEvent,
    Pressable,
    StyleSheet,
    UIManager,
    View,
    findNodeHandle,
} from "react-native";
import { useDragHandlers } from "../hooks/use-drag-handlers";
import { useGridState } from "../hooks/use-grid-state";
import type {
    BaseItemType,
    ContainerLayout,
    DraggableGridProps,
    DraggableGridRef,
} from "../types";
import { calculateTotalGridHeight, isPointInsideItem } from "../utils/grid-calculations";
import { Block } from "./block";

const DEFAULT_LONG_PRESS_DELAY = 200;
const DEFAULT_ITEM_HEIGHT = 100;
const ANIMATION_DURATION = 200;
const MEASUREMENT_REVEAL_DELAY = ANIMATION_DURATION + 20;

interface ItemLayout {
    width: number;
    height: number;
}

function DraggableGridInner<T extends BaseItemType>(
    props: DraggableGridProps<T>,
    ref: React.Ref<DraggableGridRef>
) {
    const {
        data,
        style,
        numColumns,
        itemHeight,
        getItemHeight,
        renderItem,
        renderDeleteButton,
        dragStartAnimation,
        enableJiggle = true,
        enableGrouping = false,
        activeNestedDragKey,
        delayLongPress = DEFAULT_LONG_PRESS_DELAY,
        onItemPress,
        onItemDelete,
        onDragStart,
        onDragging,
        onDragRelease,
        onDragOutside,
        onEditModeChange,
        onGroupCreate,
    } = props;

    const [containerLayout, setContainerLayout] = useState<ContainerLayout | null>(null);
    const [blockWidth, setBlockWidth] = useState(0);
    const [blockHeight, setBlockHeight] = useState(itemHeight ?? DEFAULT_ITEM_HEIGHT);
    const [measuredLayouts, setMeasuredLayouts] = useState<Record<string, ItemLayout>>({});
    const [itemsPendingMeasurement, setItemsPendingMeasurement] = useState<Set<string>>(new Set());

    const [activeItemKey, setActiveItemKey] = useState<string | undefined>();
    const [isEditMode, setIsEditMode] = useState(false);
    const [groupedItemKey, setGroupedItemKey] = useState<string | undefined>();

    const containerRef = useRef<View | null>(null);
    const itemViewRefs = useRef<Map<string, View | null>>(new Map());
    const groupedItemKeyRef = useRef<string | undefined>(undefined);
    const itemsPendingMeasurementRef = useRef<Set<string>>(new Set());
    const previousItemKeysRef = useRef<Set<string>>(new Set());

    groupedItemKeyRef.current = groupedItemKey;
    itemsPendingMeasurementRef.current = itemsPendingMeasurement;

    const safeBlockHeight = blockHeight > 0 ? blockHeight : DEFAULT_ITEM_HEIGHT;

    const getResolvedItemHeight = useCallback(
        (item: T): number => {
            const key = String(item.key);
            const measuredHeight = measuredLayouts[key]?.height;

            if (measuredHeight && measuredHeight > 0) {
                return measuredHeight;
            }

            if (getItemHeight) {
                const customHeight = getItemHeight(item);
                if (customHeight > 0) {
                    return customHeight;
                }
            }

            if (itemHeight && itemHeight > 0) {
                return itemHeight;
            }

            return safeBlockHeight;
        },
        [measuredLayouts, getItemHeight, itemHeight, safeBlockHeight]
    );

    const updateGroupedItemKey = useCallback((value: string | undefined) => {
        groupedItemKeyRef.current = value;
        setGroupedItemKey(value);
    }, []);

    const updateEditMode = useCallback(
        (value: boolean) => {
            setIsEditMode(value);
            onEditModeChange?.(value);
        },
        [onEditModeChange]
    );

    const {
        internalData,
        setInternalData,
        itemsMap,
        orderMap,
        itemAnims,
        getPositionByIndex,
        getKeyByOrder,
        getHeightByKey,
    } = useGridState({
        data,
        numColumns,
        blockWidth,
        blockHeight: safeBlockHeight,
        containerLayout,
        getItemHeight: getResolvedItemHeight,
    });

    const { panResponder, activeItemKeyRef, applyScrollOffset } = useDragHandlers({
        numColumns,
        blockWidth,
        blockHeight: safeBlockHeight,
        enableGrouping,
        internalData,
        itemsMap,
        orderMap,
        itemAnims,
        getPositionByIndex,
        getKeyByOrder,
        getHeightByKey,
        getItemHeight: getResolvedItemHeight,
        setInternalData,
        activeItemKey,
        setActiveItemKey,
        groupedItemKey: groupedItemKeyRef.current,
        setGroupedItemKey: updateGroupedItemKey,
        onDragStart,
        onDragging,
        onDragRelease,
        onDragOutside,
        onGroupCreate,
    });

    const exitEditMode = useCallback(() => {
        updateEditMode(false);
    }, [updateEditMode]);

    useImperativeHandle(
        ref,
        () => ({
            exitEditMode,
            applyScrollOffset,
        }),
        [exitEditMode, applyScrollOffset]
    );

    const handleItemLongPress = useCallback(
        (item: T) => {
            if (item.disabledDrag) {
                return;
            }

            updateEditMode(true);
            setActiveItemKey(String(item.key));
            activeItemKeyRef.current = String(item.key);
        },
        [updateEditMode, activeItemKeyRef]
    );

    const handleItemPress = useCallback(
        (item: T) => {
            if (isEditMode) {
                updateEditMode(false);
                return;
            }

            onItemPress?.(item);
        },
        [isEditMode, updateEditMode, onItemPress]
    );

    const handleBackgroundPress = useCallback(
        (event: any) => {
            if (!isEditMode) {
                return;
            }

            const { locationX, locationY } = event.nativeEvent;

            const isTouchInsideItem = isPointInsideItem(
                locationX,
                locationY,
                internalData,
                orderMap.current,
                numColumns,
                blockWidth,
                safeBlockHeight,
                getResolvedItemHeight
            );

            if (!isTouchInsideItem) {
                updateEditMode(false);
            }
        },
        [isEditMode, internalData, orderMap, numColumns, blockWidth, safeBlockHeight, getResolvedItemHeight, updateEditMode]
    );

    const handleContainerLayout = useCallback(
        (event: LayoutChangeEvent) => {
            const { width, height } = event.nativeEvent.layout;

            setContainerLayout({ width, height });
            setBlockWidth(width / numColumns);

            if (itemHeight && itemHeight > 0) {
                setBlockHeight(itemHeight);
            }
        },
        [numColumns, itemHeight]
    );

    const measureItem = useCallback((key: string) => {
        const container = containerRef.current;
        const itemView = itemViewRefs.current.get(key);

        const containerHandle = container ? findNodeHandle(container) : null;
        const itemHandle = itemView ? findNodeHandle(itemView) : null;

        if (!containerHandle || !itemHandle) {
            return;
        }

        UIManager.measureLayout(
            itemHandle,
            containerHandle,
            () => {},
            (_x, _y, width, height) => {
                if (width <= 0 || height <= 0) {
                    return;
                }

                setMeasuredLayouts((prev) => {
                    const existing = prev[key];
                    const isSameSize = existing?.width === width && existing?.height === height;

                    if (isSameSize) {
                        return prev;
                    }

                    return {
                        ...prev,
                        [key]: { width, height },
                    };
                });

                const wasPendingMeasurement = itemsPendingMeasurementRef.current.has(key);

                if (wasPendingMeasurement) {
                    setTimeout(() => {
                        setItemsPendingMeasurement((prev) => {
                            if (!prev.has(key)) {
                                return prev;
                            }

                            const next = new Set(prev);
                            next.delete(key);
                            return next;
                        });
                    }, MEASUREMENT_REVEAL_DELAY);
                }
            }
        );
    }, []);

    const remeasureAllItems = useCallback(() => {
        requestAnimationFrame(() => {
            setTimeout(() => {
                internalData.forEach((item) => {
                    measureItem(String(item.key));
                });
            }, 0);
        });
    }, [internalData, measureItem]);

    useEffect(() => {
        const currentKeys = new Set(data.map((item) => String(item.key)));
        const previousKeys = previousItemKeysRef.current;

        const newlyAddedKeys: string[] = [];

        currentKeys.forEach((key) => {
            if (!previousKeys.has(key)) {
                newlyAddedKeys.push(key);
            }
        });

        if (newlyAddedKeys.length > 0) {
            setItemsPendingMeasurement((prev) => {
                const next = new Set(prev);
                newlyAddedKeys.forEach((key) => next.add(key));
                return next;
            });
        }

        previousItemKeysRef.current = currentKeys;
    }, [data]);

    useEffect(() => {
        if (!containerLayout) {
            return;
        }

        remeasureAllItems();
    }, [containerLayout, internalData.length, isEditMode, remeasureAllItems]);

    const totalGridHeight = useMemo(() => {
        return calculateTotalGridHeight(
            internalData,
            numColumns,
            safeBlockHeight,
            getResolvedItemHeight
        );
    }, [internalData, numColumns, safeBlockHeight, getResolvedItemHeight]);

    const itemsSortedByZIndex = useMemo(() => {
        return [...internalData].sort((a, b) => {
            const aKey = String(a.key);
            const bKey = String(b.key);

            if (aKey === activeItemKey) return 1;
            if (bKey === activeItemKey) return -1;

            if (aKey === activeNestedDragKey) return 1;
            if (bKey === activeNestedDragKey) return -1;

            return 0;
        });
    }, [internalData, activeItemKey, activeNestedDragKey]);

    const getOrCreateAnimation = useCallback(
        (item: T): Animated.ValueXY => {
            const key = String(item.key);
            const existingAnim = itemAnims.current.get(key);

            if (existingAnim) {
                return existingAnim;
            }

            const index = internalData.indexOf(item);
            const position = getPositionByIndex(index);
            const newAnim = new Animated.ValueXY(position);

            itemAnims.current.set(key, newAnim);

            return newAnim;
        },
        [internalData, itemAnims, getPositionByIndex]
    );

    const renderGridItem = useCallback(
        (item: T) => {
            const key = String(item.key);
            const isActive = activeItemKey === key;
            const isNestedDragActive = activeNestedDragKey === key;
            const isGrouped = enableGrouping && groupedItemKeyRef.current === key;
            const isPendingMeasurement = itemsPendingMeasurement.has(key);

            const measured = measuredLayouts[key];
            const width = measured?.width ?? blockWidth;
            const height = measured?.height ?? getResolvedItemHeight(item);

            const animation = getOrCreateAnimation(item);

            const canJiggle = enableJiggle && !item.disabledDrag;
            const canDelete = !!renderDeleteButton && !item.disabledDrag;

            const blockStyle = {
                position: "absolute" as const,
                top: 0,
                left: 0,
                width,
                height,
                zIndex: isActive ? 999 : isNestedDragActive ? 998 : 1,
                opacity: isPendingMeasurement ? 0 : 1,
                transform: [
                    { translateX: animation.x },
                    { translateY: animation.y },
                ],
            };

            const dragAnimation = isActive && dragStartAnimation
                ? dragStartAnimation
                : undefined;

            const deleteButtonRenderer = renderDeleteButton
                ? () => renderDeleteButton(item, () => onItemDelete?.(item))
                : undefined;

            return (
                <Block
                    key={key}
                    style={blockStyle}
                    delayLongPress={delayLongPress}
                    dragStartAnimationStyle={dragAnimation}
                    isEditMode={isEditMode}
                    isGrouped={isGrouped}
                    enableJiggle={canJiggle}
                    showDeleteButton={canDelete}
                    renderDeleteButton={deleteButtonRenderer}
                    onPress={() => handleItemPress(item)}
                    onLongPress={() => handleItemLongPress(item)}
                >
                    <View
                        collapsable={false}
                        style={{ width: "100%" }}
                        ref={(viewRef) => { itemViewRefs.current.set(key, viewRef); }}
                        onLayout={() => measureItem(key)}
                    >
                        {renderItem(item, orderMap.current.get(key) ?? 0)}
                    </View>
                </Block>
            );
        },
        [
            activeItemKey,
            activeNestedDragKey,
            enableGrouping,
            itemsPendingMeasurement,
            measuredLayouts,
            blockWidth,
            getResolvedItemHeight,
            getOrCreateAnimation,
            enableJiggle,
            renderDeleteButton,
            dragStartAnimation,
            isEditMode,
            delayLongPress,
            handleItemPress,
            handleItemLongPress,
            measureItem,
            renderItem,
            orderMap,
            onItemDelete,
        ]
    );

    return (
        <Pressable
            style={[style, styles.container, { height: totalGridHeight }]}
            onPress={handleBackgroundPress}
        >
            <View
                ref={containerRef}
                style={[styles.innerContainer, { height: totalGridHeight }]}
                onLayout={handleContainerLayout}
                {...panResponder.panHandlers}
            >
                {itemsSortedByZIndex.map(renderGridItem)}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexWrap: "wrap",
        flexDirection: "row",
    },
    innerContainer: {
        flex: 1,
        width: "100%",
    },
});

export const DraggableGrid = forwardRef(DraggableGridInner) as <T extends BaseItemType>(
    props: DraggableGridProps<T> & { ref?: React.Ref<DraggableGridRef> }
) => React.ReactElement;