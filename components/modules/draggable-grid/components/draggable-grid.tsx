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

const DEFAULT_DELAY_LONG_PRESS = 200;
const DEFAULT_FALLBACK_HEIGHT = 100;

type ItemMeasuredLayout = {
    width: number;
    height: number;
};

function DraggableGridInner<T extends BaseItemType>(
    {
        data,
        style,
        renderItem,
        renderDeleteButton,
        onItemPress,
        onDragStart,
        onDragging,
        onDragRelease,
        onDragOutside,
        onItemDelete,
        onEditModeChange,
        onGroupCreate,
        numColumns,
        itemHeight,
        getItemHeight,
        dragStartAnimation,
        enableJiggle = true,
        enableGrouping = false,
        delayLongPress = DEFAULT_DELAY_LONG_PRESS,
    }: DraggableGridProps<T>,
    ref: React.Ref<DraggableGridRef>
) {
    const [containerLayout, setContainerLayout] = useState<ContainerLayout | null>(null);
    const [blockWidth, setBlockWidth] = useState(0);
    const [blockHeight, setBlockHeight] = useState(
        typeof itemHeight === "number" && itemHeight > 0 ? itemHeight : DEFAULT_FALLBACK_HEIGHT
    );

    const [itemLayouts, setItemLayouts] = useState<Record<string, ItemMeasuredLayout>>({});

    const containerRef = useRef<View | null>(null);
    const itemNativeRefs = useRef<Map<string, View | null>>(new Map());

    const [activeItemKey, setActiveItemKey] = useState<string | undefined>(undefined);
    const [isEditMode, setIsEditMode] = useState(false);
    const [groupedItemKey, setGroupedItemKeyState] = useState<string | undefined>(undefined);

    const groupedItemKeyRef = useRef<string | undefined>(undefined);

    const setGroupedItemKey = useCallback((value: string | undefined) => {
        groupedItemKeyRef.current = value;
        setGroupedItemKeyState(value);
    }, []);

    const getResolvedItemHeight = useCallback(
        (item: T) => {
            const key = String(item.key);
            const measured = itemLayouts[key]?.height;
            if (typeof measured === "number" && measured > 0) return measured;

            const estimated = getItemHeight?.(item);
            if (typeof estimated === "number" && estimated > 0) return estimated;

            if (typeof itemHeight === "number" && itemHeight > 0) return itemHeight;

            return blockHeight > 0 ? blockHeight : DEFAULT_FALLBACK_HEIGHT;
        },
        [itemLayouts, getItemHeight, itemHeight, blockHeight]
    );

    const {
        internalData,
        setInternalData,
        itemsMap,
        orderMap,
        itemAnims,
        getPositionByIndex,
        getKeyByOrder,
        getHeightForItem,
        getHeightByKey,
    } = useGridState({
        data,
        numColumns,
        blockWidth,
        blockHeight: blockHeight > 0 ? blockHeight : DEFAULT_FALLBACK_HEIGHT,
        containerLayout,
        getItemHeight: getResolvedItemHeight,
    });

    const { panResponder, activeItemKeyRef, applyScrollOffset } = useDragHandlers({
        numColumns,
        blockWidth,
        blockHeight: blockHeight > 0 ? blockHeight : DEFAULT_FALLBACK_HEIGHT,
        enableGrouping,
        internalData,
        itemsMap,
        orderMap,
        itemAnims,
        getPositionByIndex,
        getKeyByOrder,
        getHeightForItem,
        getHeightByKey,
        getItemHeight: getResolvedItemHeight,
        setInternalData,
        activeItemKey,
        setActiveItemKey,
        groupedItemKey: groupedItemKeyRef.current,
        setGroupedItemKey,
        onDragStart,
        onDragging,
        onDragRelease,
        onDragOutside,
        onGroupCreate,
    });

    const exitEditMode = useCallback(() => {
        setIsEditMode(false);
        onEditModeChange?.(false);
    }, [onEditModeChange]);

    useImperativeHandle(
        ref,
        () => ({
            exitEditMode,
            applyScrollOffset,
        }),
        [exitEditMode, applyScrollOffset]
    );

    const handleLongPress = useCallback(
        (item: T) => {
            if (item.disabledDrag) return;

            setIsEditMode(true);
            onEditModeChange?.(true);

            setActiveItemKey(String(item.key));
            activeItemKeyRef.current = String(item.key);
        },
        [onEditModeChange, activeItemKeyRef]
    );

    const handlePress = useCallback(
        (item: T) => {
            if (isEditMode) {
                setIsEditMode(false);
                onEditModeChange?.(false);
            } else {
                onItemPress?.(item);
            }
        },
        [isEditMode, onEditModeChange, onItemPress]
    );

    const onLayout = useCallback(
        (event: LayoutChangeEvent) => {
            const { width, height } = event.nativeEvent.layout;

            setContainerLayout({ width, height });

            const bWidth = width / numColumns;
            setBlockWidth(bWidth);

            const nextHeight =
                typeof itemHeight === "number" && itemHeight > 0
                    ? itemHeight
                    : blockHeight > 0
                      ? blockHeight
                      : DEFAULT_FALLBACK_HEIGHT;

            setBlockHeight(nextHeight);
        },
        [numColumns, itemHeight, blockHeight]
    );

    const measureItem = useCallback((key: string) => {
        const containerNode = containerRef.current;
        const itemNode = itemNativeRefs.current.get(key) || null;

        const containerHandle = containerNode ? findNodeHandle(containerNode) : null;
        const itemHandle = itemNode ? findNodeHandle(itemNode) : null;

        if (!containerHandle || !itemHandle) return;

        UIManager.measureLayout(
            itemHandle,
            containerHandle,
            () => {},
            (_x: number, _y: number, width: number, height: number) => {
                if (width <= 0 || height <= 0) return;
                setItemLayouts((prev) => {
                    const current = prev[key];
                    if (current && current.width === width && current.height === height) return prev;
                    return { ...prev, [key]: { width, height } };
                });
            }
        );
    }, []);

    const remeasureAll = useCallback(() => {
        requestAnimationFrame(() => {
            setTimeout(() => {
                internalData.forEach((item) => measureItem(String(item.key)));
            }, 0);
        });
    }, [internalData, measureItem]);

    useEffect(() => {
        if (!containerLayout) return;
        remeasureAll();
    }, [containerLayout, internalData.length, isEditMode, remeasureAll]);

    const totalGridHeight = useMemo(() => {
        const baseHeight = blockHeight > 0 ? blockHeight : DEFAULT_FALLBACK_HEIGHT;
        return calculateTotalGridHeight(internalData, numColumns, baseHeight, getResolvedItemHeight);
    }, [internalData, numColumns, blockHeight, getResolvedItemHeight]);

    const handleBackgroundPress = useCallback(
        (event: any) => {
            if (!isEditMode) return;

            const { locationX, locationY } = event.nativeEvent;

            const baseHeight = blockHeight > 0 ? blockHeight : DEFAULT_FALLBACK_HEIGHT;

            const isInside = isPointInsideItem(
                locationX,
                locationY,
                internalData,
                orderMap.current,
                numColumns,
                blockWidth,
                baseHeight,
                getResolvedItemHeight
            );

            if (!isInside) {
                setIsEditMode(false);
                onEditModeChange?.(false);
            }
        },
        [
            isEditMode,
            internalData,
            orderMap,
            numColumns,
            blockWidth,
            blockHeight,
            getResolvedItemHeight,
            onEditModeChange,
        ]
    );

    const sortedItems = useMemo(() => {
        return [...internalData].sort((a, b) => {
            if (String(a.key) === activeItemKey) return 1;
            if (String(b.key) === activeItemKey) return -1;
            return 0;
        });
    }, [internalData, activeItemKey]);

    const baseHeight = blockHeight > 0 ? blockHeight : DEFAULT_FALLBACK_HEIGHT;

    return (
        <Pressable
            onPress={handleBackgroundPress}
            style={[style, styles.container, { height: totalGridHeight }]}
        >
            <View
                ref={containerRef}
                style={[styles.innerContainer, { height: totalGridHeight }]}
                onLayout={onLayout}
                {...panResponder.panHandlers}
            >
                {sortedItems.map((item) => {
                    const key = String(item.key);
                    const isActive = activeItemKey === key;

                    const measured = itemLayouts[key];
                    const currentWidth = measured?.width ?? blockWidth;
                    const currentHeight = measured?.height ?? getResolvedItemHeight(item) ?? baseHeight;

                    let anim = itemAnims.current.get(key);
                    if (!anim) {
                        const index = internalData.indexOf(item);
                        const pos = getPositionByIndex(index);
                        anim = new Animated.ValueXY(pos);
                        itemAnims.current.set(key, anim);
                    }

                    const shouldEnableJiggle = enableJiggle && !item.disabledDrag;
                    const showDeleteButton = !!renderDeleteButton && !item.disabledDrag;
                    const isGrouped = enableGrouping && groupedItemKeyRef.current === key;

                    return (
                        <Block
                            key={key}
                            onPress={() => handlePress(item)}
                            onLongPress={() => handleLongPress(item)}
                            delayLongPress={delayLongPress}
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: currentWidth,
                                height: currentHeight,
                                zIndex: isActive ? 999 : 1,
                                transform: [{ translateX: anim.x }, { translateY: anim.y }],
                            }}
                            dragStartAnimationStyle={isActive && dragStartAnimation ? dragStartAnimation : undefined}
                            isEditMode={isEditMode}
                            enableJiggle={shouldEnableJiggle}
                            showDeleteButton={showDeleteButton}
                            renderDeleteButton={
                                renderDeleteButton
                                    ? () => renderDeleteButton(item, () => onItemDelete?.(item))
                                    : undefined
                            }
                            isGrouped={isGrouped}
                        >
                            <View
                                collapsable={false}
                                ref={(r) => {
                                    itemNativeRefs.current.set(key, r);
                                }}
                                onLayout={() => measureItem(key)}
                                style={{ width: "100%" }}
                            >
                                {renderItem(item, orderMap.current.get(key) || 0)}
                            </View>
                        </Block>
                    );
                })}
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
