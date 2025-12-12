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
    delayLongPress = 200,
}: DraggableGridProps<T> & { ref?: React.Ref<DraggableGridRef> }, ref: React.Ref<DraggableGridRef>) {
    // State
    const [containerLayout, setContainerLayout] = useState<{ width: number; height: number } | null>(null);
    const [activeItemKey, setActiveItemKey] = useState<string | undefined>(undefined);
    const [blockWidth, setBlockWidth] = useState(0);
    const [blockHeight, setBlockHeight] = useState(0);
    const [internalData, setInternalData] = useState<T[]>(data);
    const [isEditMode, setIsEditMode] = useState(false);
    const [groupedItemKey, setGroupedItemKeyState] = useState<string | undefined>(undefined);

    // Refs
    const itemsMap = useRef<Map<string, T>>(new Map());
    const orderMap = useRef<Map<string, number>>(new Map());
    const itemAnims = useRef<Map<string, Animated.ValueXY>>(new Map());
    const itemHeightsRef = useRef<Map<string, number>>(new Map());
    const activeItemKeyRef = useRef<string | undefined>(undefined);
    const isDraggingRef = useRef(false);
    const initialDragPositionRef = useRef<{ x: number; y: number } | null>(null);
    const hoveredItemKeyRef = useRef<string | undefined>(undefined);
    const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
    const groupedItemKeyRef = useRef<string | undefined>(undefined);
    const handleHoverRef = useRef<(activeKey: string, x: number, y: number) => void>(() => {});
    const handleReorderRef = useRef<(activeKey: string, x: number, y: number) => void>(() => {});

    // Helper pour mettre à jour groupedItemKey (state + ref)
    const setGroupedItemKey = (value: string | undefined) => {
        groupedItemKeyRef.current = value;
        setGroupedItemKeyState(value);
    };

    // Helper: Get item height (dynamic or fixed)
    const getHeightForItem = useCallback((item: T | undefined): number => {
        if (!item) return blockHeight;
        if (getItemHeight) {
            return getItemHeight(item);
        }
        return blockHeight;
    }, [blockHeight, getItemHeight]);

    // Helper: Get item height by key
    const getHeightByKey = useCallback((key: string): number => {
        const item = itemsMap.current.get(key);
        return getHeightForItem(item);
    }, [getHeightForItem]);

    // Helper: Get block position by index (supports dynamic heights for single column)
    const getPositionByIndex = useCallback((index: number, orderMapOverride?: Map<string, number>) => {
        if (!containerLayout) return { x: 0, y: 0 };
        
        const col = index % numColumns;
        
        // Si on utilise des hauteurs dynamiques (single column only)
        if (getItemHeight && numColumns === 1) {
            // Utiliser orderMapOverride si fourni, sinon orderMap.current
            const currentOrderMap = orderMapOverride || orderMap.current;
            
            // Calculer la position Y en additionnant les hauteurs des items précédents
            let yPos = 0;
            const sortedItems = Array.from(itemsMap.current.entries())
                .sort((a, b) => (currentOrderMap.get(a[0]) ?? 0) - (currentOrderMap.get(b[0]) ?? 0));
            
            for (let i = 0; i < index && i < sortedItems.length; i++) {
                const [, item] = sortedItems[i];
                yPos += getItemHeight(item);
            }
            
            return { x: col * blockWidth, y: yPos };
        }
        
        // Fallback: hauteur uniforme
        const row = Math.floor(index / numColumns);
        return {
            x: col * blockWidth,
            y: row * blockHeight,
        };
    }, [containerLayout, numColumns, blockWidth, blockHeight, getItemHeight]);

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
                itemHeightsRef.current.delete(key);
            }
        }

        // Calculate current heights and detect changes
        let needsRecalculation = false;
        const newHeights = new Map<string, number>();

        data.forEach((item, index) => {
            const key = String(item.key);
            const currentHeight = getItemHeight ? getItemHeight(item) : blockHeight;
            const previousHeight = itemHeightsRef.current.get(key);
            
            newHeights.set(key, currentHeight);
            
            // Detect height changes
            if (previousHeight !== undefined && previousHeight !== currentHeight) {
                needsRecalculation = true;
            }
            
            itemsMap.current.set(key, item);
            orderMap.current.set(key, index);
            
            if (!itemAnims.current.has(key)) {
                itemAnims.current.set(key, new Animated.ValueXY(getPositionByIndex(index)));
            }
        });

        // Update stored heights
        itemHeightsRef.current = newHeights;

        // Recalculate all positions if heights changed
        if (needsRecalculation && containerLayout) {
            data.forEach((item, index) => {
                const key = String(item.key);
                const pos = getPositionByIndex(index);
                const anim = itemAnims.current.get(key);
                
                const isActive = key === activeItemKeyRef.current;
                if (anim && (!isActive || !isDraggingRef.current)) {
                    // Use animation for smoother transition when heights change
                    Animated.timing(anim, {
                        toValue: pos,
                        duration: 200,
                        useNativeDriver: false,
                    }).start();
                }
            });
        } else if (containerLayout) {
            // Update positions without animation for initial layout or when not dragging
            data.forEach((item, index) => {
                const key = String(item.key);
                const pos = getPositionByIndex(index);
                const anim = itemAnims.current.get(key);
                
                const isActive = key === activeItemKeyRef.current;
                if (anim && (!isActive || !isDraggingRef.current)) {
                    anim.setValue(pos);
                }
            });
        }
    }, [data, numColumns, blockWidth, blockHeight, containerLayout]);

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

    // Helper: Get order by position (supports dynamic heights for single column)
    const getOrderByPosition = useCallback((x: number, y: number): number => {
        if (getItemHeight && numColumns === 1) {
            // Calculer l'ordre en tenant compte des hauteurs dynamiques
            const sortedItems = Array.from(itemsMap.current.entries())
                .sort((a, b) => (orderMap.current.get(a[0]) ?? 0) - (orderMap.current.get(b[0]) ?? 0));
            
            let cumulativeY = 0;
            for (let i = 0; i < sortedItems.length; i++) {
                const [, item] = sortedItems[i];
                const itemH = getItemHeight(item);
                
                if (y + itemH / 2 < cumulativeY + itemH) {
                    return i;
                }
                cumulativeY += itemH;
            }
            return sortedItems.length - 1;
        }
        
        // Fallback: hauteur uniforme
        const col = Math.floor((x + blockWidth / 2) / blockWidth);
        const row = Math.floor((y + blockHeight / 2) / blockHeight);
        return row * numColumns + col;
    }, [getItemHeight, numColumns, blockWidth, blockHeight]);

    // Helper: Get item height at order
    const getHeightAtOrder = useCallback((order: number): number => {
        const key = getKeyByOrder(order);
        if (key) {
            return getHeightByKey(key);
        }
        return blockHeight;
    }, [blockHeight, getHeightByKey]);

    // Fonction pour gérer le survol et l'effet de groupe
    const handleHover = (activeKey: string, x: number, y: number) => {
        if (!enableGrouping || !blockWidth || !blockHeight) {
            return;
        }

        // Calculer quelle cellule on survole (supporte les hauteurs dynamiques)
        let hoveredOrder = getOrderByPosition(x, y);
        hoveredOrder = Math.max(0, Math.min(internalData.length - 1, hoveredOrder));

        const targetKey = getKeyByOrder(hoveredOrder);
        const targetHeight = getHeightAtOrder(hoveredOrder);

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
        const activeOrder = orderMap.current.get(activeKey);
        const activeHeight = activeOrder !== undefined ? getHeightAtOrder(activeOrder) : blockHeight;

        // Vérifier si le centre de l'élément dragué survole le centre de l'élément cible
        const draggedCenterX = x + blockWidth / 2;
        const draggedCenterY = y + activeHeight / 2;
        const targetCenterX = targetPos.x + blockWidth / 2;
        const targetCenterY = targetPos.y + targetHeight / 2;
        const isHoveringCenter = 
            Math.abs(draggedCenterX - targetCenterX) < blockWidth * 0.4 && 
            Math.abs(draggedCenterY - targetCenterY) < targetHeight * 0.4;

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
        
        // Utiliser getOrderByPosition pour supporter les hauteurs dynamiques
        let newOrder = getOrderByPosition(x, y);
        newOrder = Math.max(0, Math.min(internalData.length - 1, newOrder));
        
        const oldOrder = orderMap.current.get(activeKey);
        const activeHeight = oldOrder !== undefined ? getHeightAtOrder(oldOrder) : blockHeight;

        const targetKey = getKeyByOrder(newOrder);
        if (targetKey) {
            const targetItem = itemsMap.current.get(targetKey);
            if (targetItem?.disabledReSorted) return;
        }
        
        const targetHeight = getHeightAtOrder(newOrder);
        
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
                    hasPassedBorder = (y + activeHeight) >= (targetPos.y + targetHeight);
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
            // Créer un orderMap temporaire avec le nouvel ordre pour calculer les positions correctes
            const tempOrderMap = new Map(orderMap.current);
            tempOrderMap.set(activeKey, newOrder);
            
            // Calculer les nouveaux ordres pour tous les items
            const updates: Array<{key: string, nextOrder: number, currentOrder: number}> = [];
            
            orderMap.current.forEach((order, key) => {
                if (key === activeKey) return;

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
                    tempOrderMap.set(key, nextOrder);
                    updates.push({ key, nextOrder, currentOrder: order });
                }
            });
            
            // Animer les items vers leurs nouvelles positions en utilisant le orderMap temporaire
            updates.forEach(({ key, nextOrder }) => {
                const anim = itemAnims.current.get(key);
                const newPos = getPositionByIndex(nextOrder, tempOrderMap);
                Animated.timing(anim!, {
                    toValue: newPos,
                    duration: 200,
                    useNativeDriver: false,
                }).start();
            });
            
            // Mettre à jour le vrai orderMap après avoir lancé les animations
            orderMap.current = tempOrderMap;
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
        
        // Utiliser la ref pour avoir la valeur actuelle
        const currentGroupedItemKey = groupedItemKeyRef.current;
        const shouldCreateGroup = enableGrouping && currentGroupedItemKey && currentGroupedItemKey !== key;
        
        if (key) {
            const anim = itemAnims.current.get(key);
            const order = orderMap.current.get(key);
            
            if (anim && order !== undefined) {
                // Récupérer la position actuelle de l'item
                const currentX = (anim.x as any)._value + (anim.x as any)._offset;
                const currentY = (anim.y as any)._value + (anim.y as any)._offset;
                
                // Calculer les limites du grid (supporte les hauteurs dynamiques)
                let gridHeight: number;
                if (getItemHeight && numColumns === 1) {
                    gridHeight = Array.from(itemsMap.current.values()).reduce((sum, item) => sum + getItemHeight(item), 0);
                } else {
                    gridHeight = Math.ceil(internalData.length / numColumns) * blockHeight;
                }
                const gridWidth = numColumns * blockWidth;
                const activeHeight = getHeightAtOrder(order);
                
                // Vérifier si l'item est en dehors des limites (avec une marge de tolérance)
                const margin = activeHeight * 0.3; // 30% de marge
                const isOutside = 
                    currentX < -margin || 
                    currentX > gridWidth + margin ||
                    currentY < -margin || 
                    currentY > gridHeight + margin;
                
                anim.flattenOffset();
                
                if (isOutside && onDragOutside) {
                    // L'item est en dehors du grid
                    const draggedItem = itemsMap.current.get(key);
                    if (draggedItem) {
                        onDragOutside(draggedItem);
                    }
                    
                    // Reset
                    setActiveItemKey(undefined);
                    activeItemKeyRef.current = undefined;
                } else if (shouldCreateGroup) {
                    // Animation vers l'item cible pour le groupement
                    const targetOrder = orderMap.current.get(currentGroupedItemKey);
                    const targetPos = targetOrder !== undefined ? getPositionByIndex(targetOrder) : getPositionByIndex(order);
                    
                    Animated.timing(anim, {
                        toValue: targetPos,
                        duration: 200,
                        useNativeDriver: false,
                    }).start(() => {
                        // Appeler le callback de création de groupe
                        const draggedItem = itemsMap.current.get(key);
                        const targetItem = itemsMap.current.get(currentGroupedItemKey);
                        
                        if (draggedItem && targetItem && onGroupCreate) {
                            onGroupCreate([draggedItem, targetItem], targetItem);
                        }
                        
                        // Reset
                        setActiveItemKey(undefined);
                        activeItemKeyRef.current = undefined;
                    });
                } else {
                    // Animation normale vers la position finale
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
            const itemH = getHeightByKey(key);
            if (
                x >= pos.x &&
                x <= pos.x + blockWidth &&
                y >= pos.y &&
                y <= pos.y + itemH
            ) {
                return true;
            }
        }
        return false;
    };

    // Calculer la hauteur totale du grid (supporte les hauteurs dynamiques)
    const totalGridHeight = useMemo(() => {
        if (getItemHeight && numColumns === 1) {
            return internalData.reduce((sum, item) => sum + getItemHeight(item), 0);
        }
        return Math.ceil(internalData.length / numColumns) * blockHeight;
    }, [internalData, getItemHeight, numColumns, blockHeight]);

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
            style={[style, styles.container, { height: totalGridHeight }]}
        >
            <AnimatedView 
                style={[styles.innerContainer, { height: totalGridHeight }]}
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
                    const itemH = getHeightForItem(item);
                    
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
                                height: itemH,
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
