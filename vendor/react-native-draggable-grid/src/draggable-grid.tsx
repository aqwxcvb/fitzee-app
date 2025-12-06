import * as React from "react";
import {
    Animated,
    LayoutChangeEvent,
    PanResponder,
    Pressable,
    StyleSheet,
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
    onItemDelete,
    onEditModeChange,
    numColumns,
    itemHeight,
    dragStartAnimation,
    enableJiggle = true,
    enableGrouping = false,
    delayLongPress = 200,
}: DraggableGridProps<T> & { ref?: React.Ref<DraggableGridRef> }, ref: React.Ref<DraggableGridRef>) {
    // State
    const [containerLayout, setContainerLayout] = useState<{ width: number; height: number } | null>(null);
    const [activeItemKey, setActiveItemKey] = useState<string | undefined>(undefined);
    const [blockWidth, setBlockWidth] = useState(0);
    const [blockHeight, setBlockHeight] = useState(0);
    const [internalData, setInternalData] = useState<T[]>(data);
    const [isEditMode, setIsEditMode] = useState(false);
    const [groupedItemKey, setGroupedItemKey] = useState<string | undefined>(undefined);

    // Refs
    const itemsMap = useRef<Map<string, T>>(new Map());
    const orderMap = useRef<Map<string, number>>(new Map());
    const itemAnims = useRef<Map<string, Animated.ValueXY>>(new Map());
    const activeItemKeyRef = useRef<string | undefined>(undefined);
    const isDraggingRef = useRef(false);
    const initialDragPositionRef = useRef<{ x: number; y: number } | null>(null);
    const hoveredItemKeyRef = useRef<string | undefined>(undefined);
    const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
    const handleHoverRef = useRef<(activeKey: string, x: number, y: number) => void>(() => {});
    const handleReorderRef = useRef<(activeKey: string, x: number, y: number) => void>(() => {});

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

    // Helper pour trouver la clé par ordre
    const getKeyByOrder = (order: number) => {
        let foundKey: string | undefined;
        orderMap.current.forEach((val, key) => {
            if (val === order) foundKey = key;
        });
        return foundKey;
    };

    // Fonction pour gérer le survol et l'effet de groupe
    const handleHover = (activeKey: string, x: number, y: number) => {
        if (!enableGrouping || !blockWidth || !blockHeight) {
            return;
        }

        // Calculer quelle cellule on survole
        const col = Math.floor((x + blockWidth / 2) / blockWidth);
        const row = Math.floor((y + blockHeight / 2) / blockHeight);
        let hoveredOrder = row * numColumns + col;
        hoveredOrder = Math.max(0, Math.min(internalData.length - 1, hoveredOrder));

        const targetKey = getKeyByOrder(hoveredOrder);

        // Ne pas traiter si on survole l'élément actif lui-même ou s'il n'y a pas de cible
        if (!targetKey || targetKey === activeKey) {
            // Réinitialiser le survol
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

        // Vérifier si le centre de l'élément dragué survole le centre de l'élément cible
        const draggedCenterX = x + blockWidth / 2;
        const draggedCenterY = y + blockHeight / 2;
        const targetCenterX = targetPos.x + blockWidth / 2;
        const targetCenterY = targetPos.y + blockHeight / 2;
        const isHoveringCenter = 
            Math.abs(draggedCenterX - targetCenterX) < blockWidth * 0.4 && 
            Math.abs(draggedCenterY - targetCenterY) < blockHeight * 0.4;

        if (isHoveringCenter) {
            // On survole le centre
            if (hoveredItemKeyRef.current !== targetKey) {
                // Nouvel élément survolé
                if (hoverTimerRef.current) {
                    clearTimeout(hoverTimerRef.current);
                }
                hoveredItemKeyRef.current = targetKey;
                setGroupedItemKey(undefined);
                
                hoverTimerRef.current = setTimeout(() => {
                    setGroupedItemKey(targetKey);
                }, 300);
            }
        } else {
            // On n'est pas au centre
            if (hoverTimerRef.current) {
                clearTimeout(hoverTimerRef.current);
                hoverTimerRef.current = null;
            }
            hoveredItemKeyRef.current = undefined;
            setGroupedItemKey(undefined);
        }
    };

    // Fonction pour gérer la réorganisation
    const handleReorder = (activeKey: string, x: number, y: number) => {
        if (!blockWidth || !blockHeight) {
            return;
        }
        
        const col = Math.floor((x + blockWidth / 2) / blockWidth);
        const row = Math.floor((y + blockHeight / 2) / blockHeight);
        
        let newOrder = row * numColumns + col;
        newOrder = Math.max(0, Math.min(internalData.length - 1, newOrder));
        
        const oldOrder = orderMap.current.get(activeKey);

        const targetKey = getKeyByOrder(newOrder);
        if (targetKey) {
            const targetItem = itemsMap.current.get(targetKey);
            if (targetItem?.disabledReSorted) return;
        }
        
        // Mode grouping : ne réorganiser que si on dépasse les bordures
        if (enableGrouping && targetKey && targetKey !== activeKey && oldOrder !== undefined) {
            const targetPos = getPositionByIndex(newOrder);
            const initialPos = initialDragPositionRef.current;
            
            if (!initialPos) {
                return;
            }
            
            const deltaX = Math.abs(x - initialPos.x);
            const deltaY = Math.abs(y - initialPos.y);
            const isHorizontalMovement = deltaX > deltaY;
            
            let hasPassedBorder = false;
            
            if (isHorizontalMovement) {
                if (oldOrder < newOrder) {
                    hasPassedBorder = x >= targetPos.x + blockWidth;
                } else {
                    hasPassedBorder = x <= targetPos.x;
                }
            } else {
                if (oldOrder < newOrder) {
                    hasPassedBorder = (y + blockHeight) >= (targetPos.y + blockHeight);
                } else {
                    hasPassedBorder = y <= targetPos.y;
                }
            }
            
            if (!hasPassedBorder) {
                return; // Ne pas réorganiser tant qu'on n'a pas dépassé la bordure
            }
            
            // On a dépassé la bordure, réinitialiser le survol
            if (hoverTimerRef.current) {
                clearTimeout(hoverTimerRef.current);
                hoverTimerRef.current = null;
            }
            hoveredItemKeyRef.current = undefined;
            setGroupedItemKey(undefined);
            
            // Mettre à jour la position initiale après réorganisation
            const newActivePos = getPositionByIndex(newOrder);
            initialDragPositionRef.current = { x: newActivePos.x, y: newActivePos.y };
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

    // Mettre à jour les refs pour éviter la recréation du panResponder
    handleHoverRef.current = handleHover;
    handleReorderRef.current = handleReorder;

    const applyScrollOffset = useCallback((deltaY: number) => {
        if (!deltaY) return;
        if (!isDraggingRef.current) return;
        const key = activeItemKeyRef.current;
        if (!key) return;
        const anim = itemAnims.current.get(key);
        if (!anim) return;

        // When the ScrollView scrolls, the grid moves relative to the screen.
        // To keep the dragged item visually at the same screen position,
        // we need to adjust the offset (the reference point in grid coordinates).
        const currentXOffset = (anim.x as any)._offset;
        const currentYOffset = (anim.y as any)._offset;
        const currentXValue = (anim.x as any)._value;
        const currentYValue = (anim.y as any)._value;

        // Update the offset to compensate for the scroll
        anim.setOffset({ x: currentXOffset, y: currentYOffset + deltaY });

        // Recalculate position for reordering
        const currentX = currentXValue + currentXOffset;
        const currentY = currentYValue + currentYOffset + deltaY;
        handleHoverRef.current(key, currentX, currentY);
        handleReorderRef.current(key, currentX, currentY);
    }, []);

    useImperativeHandle(ref, () => ({
        exitEditMode,
        applyScrollOffset,
    }), [exitEditMode, applyScrollOffset]);

    // PanResponder
    const panResponder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
            // Capture if we have an active item and actually moving
            const isDragging = !!activeItemKeyRef.current;
            const isMoving = Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
            return isDragging && isMoving;
        },
        // Prevent other responders from stealing the gesture while dragging
        onPanResponderTerminationRequest: () => !isDraggingRef.current,
        onShouldBlockNativeResponder: () => isDraggingRef.current,
        onPanResponderGrant: (_, gestureState) => {
             if(!activeItemKeyRef.current) {
                return;
             }
             
             isDraggingRef.current = true;
             const key = activeItemKeyRef.current;
             const anim = itemAnims.current.get(key);
             const currentOrder = orderMap.current.get(key);
             
             if (anim && currentOrder !== undefined) {
                 const slotPos = getPositionByIndex(currentOrder);
                 anim.setOffset({ x: slotPos.x, y: slotPos.y });
                 anim.setValue({ x: 0, y: 0 });
                 
                 // Stocker la position initiale pour détecter la direction
                 initialDragPositionRef.current = { x: slotPos.x, y: slotPos.y };
                 hoveredItemKeyRef.current = undefined;
                 
                 // Réinitialiser l'effet de groupe
                 if (hoverTimerRef.current) {
                     clearTimeout(hoverTimerRef.current);
                     hoverTimerRef.current = null;
                 }
                 setGroupedItemKey(undefined);
                 
                 onDragStart?.(itemsMap.current.get(key)!);
             }
        },
        onPanResponderMove: (_, gestureState) => {
            if(!activeItemKeyRef.current) {
                return;
            }

            const key = activeItemKeyRef.current;
            const anim = itemAnims.current.get(key);
            
            if(anim) {
                anim.setValue({ x: gestureState.dx, y: gestureState.dy });
                
                const currentX = (anim.x as any)._value + (anim.x as any)._offset;
                const currentY = (anim.y as any)._value + (anim.y as any)._offset;
                
                // Appeler les deux logiques via refs pour éviter la recréation du panResponder
                handleHoverRef.current(key, currentX, currentY);
                handleReorderRef.current(key, currentX, currentY);
            }

            onDragging?.(gestureState);
        },
        onPanResponderRelease: () => {
            finishDrag();
        },
        onPanResponderTerminate: () => {
            // Only finish if we're actually dragging - prevents accidental releases
            if (isDraggingRef.current) {
                finishDrag();
            }
        },
    }), [blockWidth, blockHeight, numColumns]); 

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
        initialDragPositionRef.current = null;
        hoveredItemKeyRef.current = undefined;
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }
        setGroupedItemKey(undefined);
    };

    const handleLongPress = (item: T) => {
        if(item.disabledDrag) {
            return;
        }

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
                    const isGrouped = enableGrouping && groupedItemKey === key;
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
                            isGrouped={isGrouped}
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
