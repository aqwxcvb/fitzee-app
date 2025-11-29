import * as React from "react";
import {
    Animated,
    LayoutChangeEvent,
    PanResponder,
    Pressable,
    StyleSheet,
    View,
} from "react-native";
import { Block } from "./block";
import { BaseItemType, DraggableGridProps, DraggableGridRef } from "./types";

const { useState, useEffect, useRef, useCallback, useImperativeHandle, useMemo } = React;

const DraggableGridComponent = function<T extends BaseItemType>({
    data,
    style,
    renderItem,
    renderDeleteButton,
    onItemPress,
    onDragStart,
    onDragging,
    onDragRelease,
    onResetSort,
    onItemDelete,
    onEditModeChange,
    numColumns,
    itemHeight,
    dragStartAnimation,
    enableJiggle = true,
    delayLongPress = 200,
}: DraggableGridProps<T> & { ref?: React.Ref<DraggableGridRef> }, ref: React.Ref<DraggableGridRef>) {
    // State
    const [containerLayout, setContainerLayout] = useState<{ width: number; height: number } | null>(null);
    const [activeItemKey, setActiveItemKey] = useState<string | undefined>(undefined);
    const [blockWidth, setBlockWidth] = useState(0);
    const [blockHeight, setBlockHeight] = useState(0);
    const [internalData, setInternalData] = useState<T[]>(data);
    const [isEditMode, setIsEditMode] = useState(false);

    // Refs
    const itemsMap = useRef<Map<string, T>>(new Map());
    const orderMap = useRef<Map<string, number>>(new Map());
    const itemAnims = useRef<Map<string, Animated.ValueXY>>(new Map());
    const activeItemKeyRef = useRef<string | undefined>(undefined);
    const isDraggingRef = useRef(false);

    // Helper: Get block position by index
    const getPositionByIndex = (index: number) => {
        if (!containerLayout) return { x: 0, y: 0 };
        const row = Math.floor(index / numColumns);
        const col = index % numColumns;
        return {
            x: col * blockWidth,
            y: row * blockHeight,
        };
    };

    // Init Data
    useEffect(() => {
        setInternalData(data);
        
        const keys = new Set(data.map(i => String(i.key)));
        
        // Cleanup items that are no longer in data
        for (const key of Array.from(itemsMap.current.keys())) {
            if (!keys.has(key)) {
                itemsMap.current.delete(key);
                orderMap.current.delete(key);
                itemAnims.current.delete(key);
            }
        }

        data.forEach((item, index) => {
            itemsMap.current.set(String(item.key), item);
            orderMap.current.set(String(item.key), index);
            if (!itemAnims.current.has(String(item.key))) {
                itemAnims.current.set(String(item.key), new Animated.ValueXY(getPositionByIndex(index)));
            } else {
                // Update position if layout changed or reordered externally?
                 const pos = getPositionByIndex(index);
                 const anim = itemAnims.current.get(String(item.key));
                 
                 const isActive = String(item.key) === activeItemKeyRef.current;
                 if (anim && (!isActive || !isDraggingRef.current)) {
                     anim.setValue(pos);
                 }
            }
        });
    }, [data, numColumns, blockWidth, blockHeight]);

    // External Control
    const exitEditMode = useCallback(() => {
        setIsEditMode(false);
        onEditModeChange?.(false);
    }, [onEditModeChange]);

    useImperativeHandle(ref, () => ({
        exitEditMode,
    }), [exitEditMode]);

    // PanResponder
    const panResponder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
            // Capture if we have an active item and actually moving
            const isDragging = !!activeItemKeyRef.current;
            const isMoving = Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
            return isDragging && isMoving;
        },
        onPanResponderGrant: (_, gestureState) => {
             if (!activeItemKeyRef.current) return;
             
             isDraggingRef.current = true;
             const key = activeItemKeyRef.current;
             const anim = itemAnims.current.get(key);
             const currentOrder = orderMap.current.get(key);
             
             if (anim && currentOrder !== undefined) {
                 const slotPos = getPositionByIndex(currentOrder);
                 anim.setOffset({ x: slotPos.x, y: slotPos.y });
                 anim.setValue({ x: 0, y: 0 });
                 
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
                
                handleReorder(key, currentX, currentY);
            }
            onDragging?.(gestureState);
        },
        onPanResponderRelease: () => {
            finishDrag();
        },
        onPanResponderTerminate: () => {
            finishDrag();
        },
    }), [blockWidth, blockHeight, numColumns]); 

    const handleReorder = (activeKey: string, x: number, y: number) => {
        if (!blockWidth || !blockHeight) return;
        
        const col = Math.floor((x + blockWidth / 2) / blockWidth);
        const row = Math.floor((y + blockHeight / 2) / blockHeight);
        
        let newOrder = row * numColumns + col;
        newOrder = Math.max(0, Math.min(internalData.length - 1, newOrder));
        
        const oldOrder = orderMap.current.get(activeKey);

        // Check if target position is occupied by a fixed item
        const getKeyByOrder = (order: number) => {
            let foundKey: string | undefined;
            orderMap.current.forEach((val, key) => {
                if (val === order) foundKey = key;
            });
            return foundKey;
        };

        const targetKey = getKeyByOrder(newOrder);
        if (targetKey) {
            const targetItem = itemsMap.current.get(targetKey);
            if (targetItem?.disabledReSorted) return;
        }
        
        if (newOrder !== oldOrder && oldOrder !== undefined) {
            orderMap.current.forEach((order, key) => {
                if (key === activeKey) {
                    orderMap.current.set(key, newOrder);
                    return;
                }

                // Skip disabledReSorted items update (should not move)
                const item = itemsMap.current.get(key);
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
                    orderMap.current.set(key, nextOrder);
                    const anim = itemAnims.current.get(key);
                    const newPos = getPositionByIndex(nextOrder);
                    Animated.timing(anim!, {
                        toValue: newPos,
                        duration: 200,
                        useNativeDriver: false,
                    }).start();
                }
            });
        }
    };

    const finishDrag = () => {
        const key = activeItemKeyRef.current;
        if (key) {
            const anim = itemAnims.current.get(key);
            const order = orderMap.current.get(key);
            if (anim && order !== undefined) {
                anim.flattenOffset();
                const finalPos = getPositionByIndex(order);
                Animated.timing(anim, {
                    toValue: finalPos,
                    duration: 200,
                    useNativeDriver: false,
                }).start(() => {
                     const sorted = Array.from(itemsMap.current.values()).sort((a, b) => {
                         return orderMap.current.get(String(a.key))! - orderMap.current.get(String(b.key))!;
                     });
                     onDragRelease?.(sorted);
                     setInternalData(sorted);
                     
                     // Reset active item AFTER animation completes
                     setActiveItemKey(undefined);
                     activeItemKeyRef.current = undefined;
                });
            }
        } else {
            setActiveItemKey(undefined);
            activeItemKeyRef.current = undefined;
        }
        isDraggingRef.current = false;
    };

    const handleLongPress = (item: T) => {
        if (item.disabledDrag) return;
        
        setIsEditMode(true);
        onEditModeChange?.(true);
        
        setActiveItemKey(String(item.key));
        activeItemKeyRef.current = String(item.key);
    };

    const handlePress = (item: T) => {
        if (isEditMode) {
             setIsEditMode(false);
             onEditModeChange?.(false);
        } else {
            onItemPress?.(item);
        }
    };

    // Edit Mode Outside Tap Handler
    const handleContainerPress = () => {
        if (isEditMode) {
             setIsEditMode(false);
             onEditModeChange?.(false);
        }
    };

    const onLayout = (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setContainerLayout({ width, height });
        const bWidth = width / numColumns;
        const bHeight = itemHeight || bWidth;
        setBlockWidth(bWidth);
        setBlockHeight(bHeight);
    };

    const AnimatedView = Animated.View as any;
    const PressableComponent = Pressable as any;
    const ViewComponent = View as any;

    // Check if a touch point is inside any item
    const isTouchInsideItem = (x: number, y: number): boolean => {
        const keys = Array.from(orderMap.current.keys());
        for (const key of keys) {
            const order = orderMap.current.get(key);
            if (order === undefined) continue;
            const pos = getPositionByIndex(order);
            if (
                x >= pos.x &&
                x <= pos.x + blockWidth &&
                y >= pos.y &&
                y <= pos.y + blockHeight
            ) {
                return true;
            }
        }
        return false;
    };

    const handleBackgroundPress = (event: any) => {
        if (!isEditMode) return;
        
        const { locationX, locationY } = event.nativeEvent;
        
        // Check if the tap was outside all items
        if (!isTouchInsideItem(locationX, locationY)) {
            setIsEditMode(false);
            onEditModeChange?.(false);
        }
    };

    return (
        <PressableComponent
            onPress={handleBackgroundPress}
            style={[style, styles.container, { height: Math.ceil(internalData.length / numColumns) * blockHeight }]}
        >
            <AnimatedView 
                style={[styles.innerContainer, { height: Math.ceil(internalData.length / numColumns) * blockHeight }]}
                onLayout={onLayout}
                {...panResponder.panHandlers}
            >
                {internalData
                    .slice()
                    .sort((a, b) => {
                        if (String(a.key) === activeItemKey) return 1;
                        if (String(b.key) === activeItemKey) return -1;
                        return 0;
                    })
                    .map((item) => {
                    const key = String(item.key);
                    const isActive = activeItemKey === key;
                    const anim = itemAnims.current.get(key) || new Animated.ValueXY({x:0, y:0});
                    
                    if (!itemAnims.current.has(key)) {
                        const index = internalData.indexOf(item);
                        const pos = getPositionByIndex(index);
                        anim.setValue(pos);
                        itemAnims.current.set(key, anim);
                    }

                    const shouldEnableJiggle = enableJiggle && !item.disabledDrag;
                    const showDeleteButton = !!renderDeleteButton && !item.disabledDrag;
                    return (
                        <Block
                            key={key}
                            onPress={() => handlePress(item)}
                            onLongPress={() => handleLongPress(item)}
                            delayLongPress={delayLongPress}
                            
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: blockWidth,
                                height: blockHeight,
                                zIndex: isActive ? 999 : 1,
                                transform: [
                                    { translateX: anim.x },
                                    { translateY: anim.y }
                                ],
                            }}
                            dragStartAnimationStyle={isActive && dragStartAnimation ? dragStartAnimation : undefined}
                            isEditMode={isEditMode}
                            enableJiggle={shouldEnableJiggle}
                            showDeleteButton={showDeleteButton}
                            renderDeleteButton={renderDeleteButton ? () => renderDeleteButton(item, () => onItemDelete?.(item)) : undefined}
                            onDelete={() => onItemDelete?.(item)}
                        >
                            {renderItem(item, orderMap.current.get(key) || 0)}
                        </Block>
                    );
                })}
            </AnimatedView>
        </PressableComponent>
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

// Export with forwardRef - cast to any to avoid React 19 JSX type issues
export const DraggableGrid = React.forwardRef(DraggableGridComponent) as any;
