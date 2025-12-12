import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, PanResponder, Pressable, StyleSheet } from 'react-native';
import { useDragAnimation } from '../hooks/useDragAnimation';
import { useEditMode } from '../hooks/useEditMode';
import { useGridLayout } from '../hooks/useGridLayout';
import { useGrouping } from '../hooks/useGrouping';
import { useReorder } from '../hooks/useReorder';
import { DraggableGridItem, DraggableGridProps, DraggableGridRef } from '../types';
import { DEFAULT_LONG_PRESS_DURATION, DRAG_OUTSIDE_MARGIN } from '../utils/constants';
import { GridItem } from './GridItem';
import { GroupContainer } from './GroupContainer';

function DraggableGridComponent<T extends DraggableGridItem>(
    props: DraggableGridProps<T>,
    ref: React.Ref<DraggableGridRef>
) {
    const {
        data,
        numColumns,
        renderItem,
        style,
        itemHeight,
        getItemHeight,
        dragStartAnimation,
        delayLongPress = DEFAULT_LONG_PRESS_DURATION,
        onItemPress,
        onDragStart,
        onDragging,
        onDragRelease,
        onDragOutside,
        onEditModeChange,
        enableJiggle = true,
        onItemDelete,
        renderDeleteButton,
        enableGrouping = false,
        onGroupCreate,
        renderGroupContainer,
    } = props;

    // State
    const [containerLayout, setContainerLayout] = useState<{ width: number; height: number } | null>(null);
    const [blockWidth, setBlockWidth] = useState(0);
    const [blockHeight, setBlockHeight] = useState(0);
    const [internalData, setInternalData] = useState(data);

    // Hooks
    const { isEditMode, activeItemKey, enterEditMode, exitEditMode } = useEditMode(onEditModeChange);
    
    const layout = useGridLayout(internalData, numColumns, itemHeight, getItemHeight);
    const { itemsMap, orderMap, getItemHeightByKey, getPositionByIndex, getOrderByPosition, getTotalHeight, getKeyByOrder } = layout;

    const animation = useDragAnimation();
    const { itemAnims, getOrCreateAnim, startDrag, updateDrag, getCurrentPosition, endDrag, animateToPosition, resetPosition, cleanup } = animation;

    const { reorderItems } = useReorder(orderMap, getPositionByIndex, animateToPosition);
    const grouping = useGrouping(enableGrouping);
    const { groupedItemKey, groupedItemKeyRef, setInitialDragPosition, checkHover, shouldReorderWithGrouping, reset: resetGrouping } = grouping;

    // Refs
    const activeItemKeyRef = useRef<string | undefined>(undefined);
    const isDraggingRef = useRef(false);

    // Sync data changes
    useEffect(() => {
        setInternalData(data);
        cleanup(data.map(item => String(item.key)));
    }, [data, cleanup]);

    // Initialize/update item animations
    useEffect(() => {
        if (!containerLayout) return;

        internalData.forEach((item, index) => {
            const key = String(item.key);
            const pos = getPositionByIndex(index, blockWidth, blockHeight, containerLayout);
            const anim = getOrCreateAnim(key, pos);
            
            // Update position if not actively dragging this item
            const isActive = key === activeItemKeyRef.current;
            if (!isActive || !isDraggingRef.current) {
                resetPosition(key, pos);
            }
        });
    }, [internalData, numColumns, blockWidth, blockHeight, containerLayout, getPositionByIndex, getOrCreateAnim, resetPosition]);

    // Layout handler
    const handleLayout = useCallback((event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setContainerLayout({ width, height });
        setBlockWidth(width / numColumns);
        setBlockHeight(itemHeight || width / numColumns);
    }, [numColumns, itemHeight]);

    // Pan Responder
    const panResponder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
            const isDragging = !!activeItemKeyRef.current;
            const isMoving = Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
            return isDragging && isMoving;
        },
        onPanResponderTerminationRequest: () => !isDraggingRef.current,
        onShouldBlockNativeResponder: () => isDraggingRef.current,
        
        onPanResponderGrant: () => {
            if (!activeItemKeyRef.current || !containerLayout) return;
            
            isDraggingRef.current = true;
            const key = activeItemKeyRef.current;
            const order = orderMap.current.get(key);
            
            if (order !== undefined) {
                const pos = getPositionByIndex(order, blockWidth, blockHeight, containerLayout);
                startDrag(key, pos);
                setInitialDragPosition(pos);
                
                const item = itemsMap.current.get(key);
                if (item) {
                    onDragStart?.(item);
                }
            }
        },
        
        onPanResponderMove: (_, gestureState) => {
            if (!activeItemKeyRef.current || !containerLayout) return;
            
            const key = activeItemKeyRef.current;
            updateDrag(key, gestureState.dx, gestureState.dy);
            
            const currentPos = getCurrentPosition(key);
            const newOrder = getOrderByPosition(currentPos.x, currentPos.y, blockWidth, blockHeight);
            const clampedOrder = Math.max(0, Math.min(internalData.length - 1, newOrder));
            
            const oldOrder = orderMap.current.get(key);
            if (oldOrder === undefined) return;
            
            const targetKey = getKeyByOrder(clampedOrder);
            const targetPos = getPositionByIndex(clampedOrder, blockWidth, blockHeight, containerLayout);
            const activeHeight = getItemHeightByKey(key, blockHeight);
            const targetHeight = targetKey ? getItemHeightByKey(targetKey, blockHeight) : blockHeight;
            
            const activeItem = itemsMap.current.get(key);
            const targetItem = targetKey ? itemsMap.current.get(targetKey) : undefined;
            const activeIsGroup = activeItem?.isGroup || (activeItem?.groupedItems && activeItem.groupedItems.length > 0);
            const targetIsGroup = targetItem?.isGroup || (targetItem?.groupedItems && targetItem.groupedItems.length > 0);
            
            console.log('[DragMove]', {
                activeKey: key,
                targetKey,
                currentPos: { x: currentPos.x.toFixed(1), y: currentPos.y.toFixed(1) },
                targetPos: { x: targetPos.x.toFixed(1), y: targetPos.y.toFixed(1) },
                enableGrouping,
                activeIsGroup,
                targetIsGroup,
            });
            
            // Check grouping hover
            const isHovering = checkHover(
                key,
                currentPos,
                targetKey,
                targetPos,
                blockWidth,
                activeHeight,
                targetHeight,
                !!activeIsGroup,
                !!targetIsGroup
            );
            
            // Reorder if needed (sauf si on est en train de hover pour grouper)
            const shouldReorder = shouldReorderWithGrouping(
                key,
                currentPos,
                clampedOrder,
                oldOrder,
                targetKey,
                targetPos,
                blockWidth,
                activeHeight,
                targetHeight,
                !!targetIsGroup,
                isHovering
            );
            
            if (shouldReorder) {
                if (!targetItem?.disabledReSorted) {
                    reorderItems(key, clampedOrder, blockWidth, blockHeight, containerLayout, itemsMap.current);
                    
                    // Update initial position after reorder
                    const newPos = getPositionByIndex(clampedOrder, blockWidth, blockHeight, containerLayout);
                    setInitialDragPosition(newPos);
                }
            }
            
            onDragging?.(gestureState);
        },
        
        onPanResponderRelease: () => {
            handleDragEnd();
        },
        
        onPanResponderTerminate: () => {
            if (isDraggingRef.current) {
                handleDragEnd();
            }
        },
    }), [
        blockWidth,
        blockHeight,
        containerLayout,
        internalData,
        orderMap,
        itemsMap,
        getPositionByIndex,
        getOrderByPosition,
        getKeyByOrder,
        getItemHeightByKey,
        startDrag,
        updateDrag,
        getCurrentPosition,
        onDragStart,
        onDragging,
        checkHover,
        shouldReorderWithGrouping,
        reorderItems,
        setInitialDragPosition,
    ]);

    const handleDragEnd = useCallback(() => {
        if (!activeItemKeyRef.current || !containerLayout) return;
        
        const key = activeItemKeyRef.current;
        const currentPos = getCurrentPosition(key);
        const order = orderMap.current.get(key);
        
        if (order === undefined) return;
        
        const finalPos = getPositionByIndex(order, blockWidth, blockHeight, containerLayout);
        const itemH = getItemHeightByKey(key, blockHeight);
        
        // Check if dragged outside
        const totalHeight = getTotalHeight(blockHeight);
        const totalWidth = numColumns * blockWidth;
        const margin = itemH * DRAG_OUTSIDE_MARGIN;
        
        const isOutside = 
            currentPos.x < -margin ||
            currentPos.x > totalWidth + margin ||
            currentPos.y < -margin ||
            currentPos.y > totalHeight + margin;
        
        // Use ref to get current value (not captured in closure)
        const currentGroupedItemKey = groupedItemKeyRef.current;
        const shouldCreateGroup = enableGrouping && currentGroupedItemKey && currentGroupedItemKey !== key;
        
        console.log('[DragEnd]', {
            activeKey: key,
            groupedItemKey,
            groupedItemKeyRef: currentGroupedItemKey,
            shouldCreateGroup,
            isOutside,
            enableGrouping,
        });
        
        if (isOutside && onDragOutside) {
            // Dragged outside
            const item = itemsMap.current.get(key);
            if (item) {
                onDragOutside(item);
            }
            isDraggingRef.current = false;
            activeItemKeyRef.current = undefined;
            resetGrouping();
        } else if (shouldCreateGroup && currentGroupedItemKey) {
            // Create group
            console.log('[DragEnd] 🎉 Creating group!', key, currentGroupedItemKey);
            const targetOrder = orderMap.current.get(currentGroupedItemKey);
            const targetPos = targetOrder !== undefined 
                ? getPositionByIndex(targetOrder, blockWidth, blockHeight, containerLayout)
                : finalPos;
            
            endDrag(key, targetPos, () => {
                const draggedItem = itemsMap.current.get(key);
                const targetItem = itemsMap.current.get(currentGroupedItemKey);
                
                console.log('[DragEnd] Calling onGroupCreate with:', {
                    draggedItem: draggedItem?.key,
                    targetItem: targetItem?.key,
                });
                
                if (draggedItem && targetItem && onGroupCreate) {
                    // Ne passer que l'item dragué, pas le target (il sera géré dans le callback)
                    onGroupCreate([draggedItem], targetItem);
                }
                
                resetGrouping();
            });
        } else {
            // Normal drag end
            endDrag(key, finalPos, () => {
                const sorted = Array.from(itemsMap.current.values()).sort((a, b) => {
                    return (orderMap.current.get(String(a.key)) ?? 0) - (orderMap.current.get(String(b.key)) ?? 0);
                });
                onDragRelease?.(sorted);
                setInternalData(sorted);
                resetGrouping();
            });
        }
    }, [
        activeItemKeyRef,
        containerLayout,
        getCurrentPosition,
        orderMap,
        getPositionByIndex,
        blockWidth,
        blockHeight,
        getItemHeightByKey,
        getTotalHeight,
        numColumns,
        enableGrouping,
        groupedItemKey,
        onDragOutside,
        itemsMap,
        endDrag,
        onGroupCreate,
        onDragRelease,
        resetGrouping,
    ]);

    // Item press handlers
    const handleLongPress = useCallback((item: T) => {
        if (item.disabledDrag) return;
        
        const key = String(item.key);
        enterEditMode(key);
        activeItemKeyRef.current = key;
    }, [enterEditMode]);

    const handlePress = useCallback((item: T) => {
        if (isEditMode) {
            exitEditMode();
            activeItemKeyRef.current = undefined;
        } else {
            onItemPress?.(item);
        }
    }, [isEditMode, exitEditMode, onItemPress]);

    // Background press handler
    const handleBackgroundPress = useCallback((event: any) => {
        if (!isEditMode || !containerLayout) return;
        
        const { locationX, locationY } = event.nativeEvent;
        
        // Check if tap was inside any item
        let isTapInsideItem = false;
        for (const [key, order] of orderMap.current.entries()) {
            const pos = getPositionByIndex(order, blockWidth, blockHeight, containerLayout);
            const itemH = getItemHeightByKey(key, blockHeight);
            
            if (
                locationX >= pos.x &&
                locationX <= pos.x + blockWidth &&
                locationY >= pos.y &&
                locationY <= pos.y + itemH
            ) {
                isTapInsideItem = true;
                break;
            }
        }
        
        if (!isTapInsideItem) {
            exitEditMode();
            activeItemKeyRef.current = undefined;
        }
    }, [isEditMode, containerLayout, orderMap, getPositionByIndex, blockWidth, blockHeight, getItemHeightByKey, exitEditMode]);

    // Scroll offset for ScrollView
    const applyScrollOffset = useCallback((deltaY: number) => {
        if (!deltaY || !isDraggingRef.current || !activeItemKeyRef.current) return;
        
        const key = activeItemKeyRef.current;
        const anim = itemAnims.get(key);
        if (!anim) return;
        
        const currentXOffset = (anim.x as any)._offset;
        const currentYOffset = (anim.y as any)._offset;
        
        anim.setOffset({ x: currentXOffset, y: currentYOffset + deltaY });
        
        // Trigger reorder with new position
        const currentPos = getCurrentPosition(key);
        const newOrder = getOrderByPosition(currentPos.x, currentPos.y, blockWidth, blockHeight);
        const clampedOrder = Math.max(0, Math.min(internalData.length - 1, newOrder));
        const oldOrder = orderMap.current.get(key);
        
        if (oldOrder !== undefined && oldOrder !== clampedOrder) {
            reorderItems(clampedOrder, clampedOrder, blockWidth, blockHeight, containerLayout, itemsMap.current);
        }
    }, [
        itemAnims,
        getCurrentPosition,
        getOrderByPosition,
        blockWidth,
        blockHeight,
        internalData,
        orderMap,
        containerLayout,
        itemsMap,
        reorderItems,
    ]);

    // Imperative handle
    useImperativeHandle(ref, () => ({
        exitEditMode,
        applyScrollOffset,
    }), [exitEditMode, applyScrollOffset]);

    // Calculate total height
    const totalHeight = useMemo(() => {
        return getTotalHeight(blockHeight);
    }, [getTotalHeight, blockHeight]);

    // Render
    return (
        <Pressable
            onPress={handleBackgroundPress}
            style={[styles.container, style, { height: totalHeight }]}
        >
            <Animated.View
                style={[styles.innerContainer, { height: totalHeight }]}
                onLayout={handleLayout}
                {...panResponder.panHandlers}
            >
                {internalData
                    .slice()
                    .sort((a, b) => {
                        // Active item renders last (on top)
                        const aKey = String(a.key);
                        const bKey = String(b.key);
                        if (aKey === activeItemKey) return 1;
                        if (bKey === activeItemKey) return -1;
                        return 0;
                    })
                    .map((item) => {
                        const key = String(item.key);
                        const isActive = activeItemKey === key;
                        const anim = getOrCreateAnim(
                            key,
                            getPositionByIndex(
                                internalData.indexOf(item),
                                blockWidth,
                                blockHeight,
                                containerLayout
                            )
                        );
                        const itemH = getItemHeight ? getItemHeight(item) : blockHeight;
                        
                        const shouldEnableJiggle = enableJiggle && !item.disabledDrag;
                        const showDeleteButton = !!renderDeleteButton && !item.disabledDrag;
                        const isGrouped = enableGrouping && groupedItemKey === key;
                        const isGroup = item.isGroup || (item.groupedItems && item.groupedItems.length > 0);
                        
                        // Render content
                        let content;
                        if (isGroup && item.groupedItems) {
                            // Render as group
                            if (renderGroupContainer) {
                                const firstItem = item.groupedItems[0];
                                content = renderGroupContainer({
                                    items: item.groupedItems as T[],
                                    onUngroup: () => onItemDelete?.(item),
                                    children: firstItem ? renderItem(firstItem as T, orderMap.current.get(key) ?? 0) : null,
                                });
                            } else {
                                const firstItem = item.groupedItems[0];
                                content = (
                                    <GroupContainer
                                        items={item.groupedItems}
                                        onUngroup={() => onItemDelete?.(item)}
                                        isEditMode={isEditMode}
                                    >
                                        {firstItem ? renderItem(firstItem as T, orderMap.current.get(key) ?? 0) : null}
                                    </GroupContainer>
                                );
                            }
                        } else {
                            // Render as normal item
                            content = renderItem(item, orderMap.current.get(key) ?? 0);
                        }
                        
                        return (
                            <GridItem
                                key={key}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: blockWidth,
                                    height: itemH,
                                    zIndex: isActive ? 999 : 1,
                                    transform: [
                                        { translateX: anim.x },
                                        { translateY: anim.y },
                                    ],
                                }}
                                dragStartAnimationStyle={isActive ? dragStartAnimation : undefined}
                                isEditMode={isEditMode}
                                isActive={isActive}
                                isGrouped={isGrouped}
                                enableJiggle={shouldEnableJiggle && !isGroup}
                                showDeleteButton={showDeleteButton && !isGroup}
                                delayLongPress={delayLongPress}
                                onPress={() => handlePress(item)}
                                onLongPress={() => handleLongPress(item)}
                                renderDeleteButton={
                                    renderDeleteButton && !isGroup
                                        ? () => renderDeleteButton(item, () => onItemDelete?.(item))
                                        : undefined
                                }
                            >
                                {content}
                            </GridItem>
                        );
                    })}
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexWrap: 'wrap',
        flexDirection: 'row',
    },
    innerContainer: {
        flex: 1,
        width: '100%',
    },
});

export const DraggableGrid = forwardRef(DraggableGridComponent) as <T extends DraggableGridItem>(
    props: DraggableGridProps<T> & { ref?: React.Ref<DraggableGridRef> }
) => React.ReactElement;
