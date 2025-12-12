import { useCallback, useRef, useState } from 'react';
import { GROUPING_CENTER_THRESHOLD, GROUPING_HOVER_DURATION, REORDER_CENTER_OFFSET } from '../utils/constants';

export const useGrouping = (enabled: boolean) => {
    const [groupedItemKey, setGroupedItemKeyState] = useState<string | undefined>();
    const groupedItemKeyRef = useRef<string | undefined>();
    const hoveredItemKeyRef = useRef<string | undefined>();
    const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
    const initialDragPositionRef = useRef<{ x: number; y: number } | null>(null);

    // Helper pour sync state + ref
    const setGroupedItemKey = useCallback((value: string | undefined) => {
        console.log('[useGrouping] Setting groupedItemKey:', value);
        groupedItemKeyRef.current = value;
        setGroupedItemKeyState(value);
    }, []);

    console.log('[useGrouping] State:', { enabled, groupedItemKey, groupedItemKeyRef: groupedItemKeyRef.current });

    const clearHover = useCallback(() => {
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }
        hoveredItemKeyRef.current = undefined;
        setGroupedItemKey(undefined);
    }, []);

    const setInitialDragPosition = useCallback((position: { x: number; y: number }) => {
        initialDragPositionRef.current = position;
    }, []);

    const checkHover = useCallback((
        activeKey: string,
        activePos: { x: number; y: number },
        targetKey: string | undefined,
        targetPos: { x: number; y: number },
        blockWidth: number,
        activeHeight: number,
        targetHeight: number,
        activeIsGroup?: boolean,
        targetIsGroup?: boolean
    ) => {
        if (!enabled) {
            console.log('[Grouping] Grouping not enabled');
            return false;
        }
        
        if (!targetKey || targetKey === activeKey) {
            clearHover();
            return false;
        }
        
        // Ne pas permettre qu'un groupe soit drag sur un autre groupe
        // (on veut seulement ajouter des items individuels aux groupes)
        if (activeIsGroup && targetIsGroup) {
            console.log('[Grouping] Cannot merge two groups directly');
            clearHover();
            return false;
        }

        // Check if dragged item center hovers over target item center
        const draggedCenterX = activePos.x + blockWidth / 2;
        const draggedCenterY = activePos.y + activeHeight / 2;
        const targetCenterX = targetPos.x + blockWidth / 2;
        const targetCenterY = targetPos.y + targetHeight / 2;
        
        const distanceX = Math.abs(draggedCenterX - targetCenterX);
        const distanceY = Math.abs(draggedCenterY - targetCenterY);
        const thresholdX = blockWidth * GROUPING_CENTER_THRESHOLD;
        const thresholdY = targetHeight * GROUPING_CENTER_THRESHOLD;
        
        const isHoveringCenter = distanceX < thresholdX && distanceY < thresholdY;

        console.log('[Grouping] Check hover:', {
            activeKey,
            targetKey,
            distanceX: distanceX.toFixed(1),
            distanceY: distanceY.toFixed(1),
            thresholdX: thresholdX.toFixed(1),
            thresholdY: thresholdY.toFixed(1),
            isHoveringCenter,
        });

        if (isHoveringCenter) {
            if (hoveredItemKeyRef.current !== targetKey) {
                console.log('[Grouping] Starting hover timer for', targetKey);
                if (hoverTimerRef.current) {
                    clearTimeout(hoverTimerRef.current);
                }
                hoveredItemKeyRef.current = targetKey;
                setGroupedItemKey(undefined);
                
                hoverTimerRef.current = setTimeout(() => {
                    console.log('[Grouping] ✅ Group triggered!', targetKey);
                    setGroupedItemKey(targetKey);
                }, GROUPING_HOVER_DURATION);
            }
            return true;
        } else {
            clearHover();
            return false;
        }
    }, [enabled, clearHover]);

    const shouldReorderWithGrouping = useCallback((
        activeKey: string,
        activePos: { x: number; y: number },
        newOrder: number,
        oldOrder: number,
        targetKey: string | undefined,
        targetPos: { x: number; y: number },
        blockWidth: number,
        activeHeight: number,
        targetHeight: number,
        targetIsGroup: boolean,
        isCurrentlyHovering: boolean
    ): boolean => {
        if (!enabled || !targetKey || targetKey === activeKey) return true;
        
        // Si on est en train de hover au centre (pour grouper), ne pas réorganiser
        if (isCurrentlyHovering) {
            console.log('[Grouping] Currently hovering center, preventing reorder');
            return false;
        }
        
        if (newOrder === oldOrder) return false;
        
        // Calculer le centre de l'item actif
        const activeCenterX = activePos.x + blockWidth / 2;
        const activeCenterY = activePos.y + activeHeight / 2;
        
        // Calculer le point de déclenchement (avant le centre, selon REORDER_CENTER_OFFSET)
        const reorderThresholdX = targetPos.x + blockWidth * REORDER_CENTER_OFFSET;
        const reorderThresholdY = targetPos.y + targetHeight * REORDER_CENTER_OFFSET;
        
        // Déterminer si on a dépassé le seuil de réorganisation
        let hasPassedThreshold = false;
        
        if (oldOrder < newOrder) {
            // Mouvement vers l'avant (droite ou bas)
            const deltaX = Math.abs(targetPos.x - activePos.x);
            const deltaY = Math.abs(targetPos.y - activePos.y);
            
            if (deltaX > deltaY) {
                // Mouvement horizontal vers la droite
                hasPassedThreshold = activeCenterX >= reorderThresholdX;
                console.log('[Grouping] Moving RIGHT:', {
                    activeCenter: activeCenterX.toFixed(1),
                    threshold: reorderThresholdX.toFixed(1),
                    percent: `${(REORDER_CENTER_OFFSET * 100).toFixed(0)}%`,
                    hasPassedThreshold,
                });
            } else {
                // Mouvement vertical vers le bas
                hasPassedThreshold = activeCenterY >= reorderThresholdY;
                console.log('[Grouping] Moving DOWN:', {
                    activeCenter: activeCenterY.toFixed(1),
                    threshold: reorderThresholdY.toFixed(1),
                    percent: `${(REORDER_CENTER_OFFSET * 100).toFixed(0)}%`,
                    hasPassedThreshold,
                });
            }
        } else {
            // Mouvement vers l'arrière (gauche ou haut)
            // Pour le mouvement inverse, utiliser (1 - REORDER_CENTER_OFFSET)
            const reverseThresholdX = targetPos.x + blockWidth * (1 - REORDER_CENTER_OFFSET);
            const reverseThresholdY = targetPos.y + targetHeight * (1 - REORDER_CENTER_OFFSET);
            
            const deltaX = Math.abs(targetPos.x - activePos.x);
            const deltaY = Math.abs(targetPos.y - activePos.y);
            
            if (deltaX > deltaY) {
                // Mouvement horizontal vers la gauche
                hasPassedThreshold = activeCenterX <= reverseThresholdX;
                console.log('[Grouping] Moving LEFT:', {
                    activeCenter: activeCenterX.toFixed(1),
                    threshold: reverseThresholdX.toFixed(1),
                    percent: `${((1 - REORDER_CENTER_OFFSET) * 100).toFixed(0)}%`,
                    hasPassedThreshold,
                });
            } else {
                // Mouvement vertical vers le haut
                hasPassedThreshold = activeCenterY <= reverseThresholdY;
                console.log('[Grouping] Moving UP:', {
                    activeCenter: activeCenterY.toFixed(1),
                    threshold: reverseThresholdY.toFixed(1),
                    percent: `${((1 - REORDER_CENTER_OFFSET) * 100).toFixed(0)}%`,
                    hasPassedThreshold,
                });
            }
        }
        
        if (hasPassedThreshold) {
            console.log('[Grouping] ✅ Reordering (threshold passed)');
            clearHover();
            return true;
        }
        
        // Le seuil n'est pas encore dépassé → attendre (permet de grouper)
        return false;
    }, [enabled, clearHover]);

    const reset = useCallback(() => {
        clearHover();
        initialDragPositionRef.current = null;
    }, [clearHover]);

    return {
        groupedItemKey,
        groupedItemKeyRef,
        setInitialDragPosition,
        checkHover,
        shouldReorderWithGrouping,
        reset,
    };
};
