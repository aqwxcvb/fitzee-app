import React, {
    forwardRef,
    useCallback,
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
} from "react-native";
import { useDragHandlers } from "../hooks/useDragHandlers";
import { useGridState } from "../hooks/useGridState";
import type {
    BaseItemType,
    ContainerLayout,
    DraggableGridProps,
    DraggableGridRef,
} from "../types";
import { calculateTotalGridHeight, isPointInsideItem } from "../utils/grid-calculations";
import { Block } from "./Block";

const DEFAULT_DELAY_LONG_PRESS = 200;

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
    const [blockHeight, setBlockHeight] = useState(0);

    const [activeItemKey, setActiveItemKey] = useState<string | undefined>(undefined);
    const [isEditMode, setIsEditMode] = useState(false);
    const [groupedItemKey, setGroupedItemKeyState] = useState<string | undefined>(undefined);

    const groupedItemKeyRef = useRef<string | undefined>(undefined);

    const setGroupedItemKey = useCallback((value: string | undefined) => {
        groupedItemKeyRef.current = value;
        setGroupedItemKeyState(value);
    }, []);

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
        blockHeight,
        containerLayout,
        getItemHeight,
    });

    const { panResponder, isDraggingRef, activeItemKeyRef, applyScrollOffset } = useDragHandlers({
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
            const bHeight = itemHeight || bWidth;
            setBlockWidth(bWidth);
            setBlockHeight(bHeight);
        },
        [numColumns, itemHeight]
    );

    const totalGridHeight = useMemo(() => {
        return calculateTotalGridHeight(internalData, numColumns, blockHeight, getItemHeight);
    }, [internalData, numColumns, blockHeight, getItemHeight]);

    const handleBackgroundPress = useCallback(
        (event: any) => {
            if (!isEditMode) return;

            const { locationX, locationY } = event.nativeEvent;

            const isInside = isPointInsideItem(
                locationX,
                locationY,
                internalData,
                orderMap.current,
                numColumns,
                blockWidth,
                blockHeight,
                getItemHeight
            );

            if (!isInside) {
                setIsEditMode(false);
                onEditModeChange?.(false);
            }
        },
        [isEditMode, internalData, orderMap, numColumns, blockWidth, blockHeight, getItemHeight, onEditModeChange]
    );

    const sortedItems = useMemo(() => {
        return [...internalData].sort((a, b) => {
            if (String(a.key) === activeItemKey) return 1;
            if (String(b.key) === activeItemKey) return -1;
            return 0;
        });
    }, [internalData, activeItemKey]);

    return (
        <Pressable
            onPress={handleBackgroundPress}
            style={[style, styles.container, { height: totalGridHeight }]}
        >
            <Animated.View
                style={[styles.innerContainer, { height: totalGridHeight }]}
                onLayout={onLayout}
                {...panResponder.panHandlers}
            >
                {sortedItems.map((item) => {
                    const key = String(item.key);
                    const isActive = activeItemKey === key;
                    const itemH = getHeightForItem(item);

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
                                width: blockWidth,
                                height: itemH,
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
                            {renderItem(item, orderMap.current.get(key) || 0)}
                        </Block>
                    );
                })}
            </Animated.View>
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
