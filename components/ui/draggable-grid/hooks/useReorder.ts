import { useCallback } from 'react';
import { DraggableGridItem } from '../types';

export const useReorder = <T extends DraggableGridItem>(
    orderMap: React.MutableRefObject<Map<string, number>>,
    getPositionByIndex: (index: number, blockWidth: number, blockHeight: number, containerLayout: any) => { x: number; y: number },
    animateToPosition: (key: string, position: { x: number; y: number }, onComplete?: () => void) => void
) => {
    const reorderItems = useCallback((
        activeKey: string,
        newOrder: number,
        blockWidth: number,
        blockHeight: number,
        containerLayout: any,
        itemsMap: Map<string, T>
    ) => {
        const oldOrder = orderMap.current.get(activeKey);
        if (oldOrder === undefined || oldOrder === newOrder) return;

        // Update order map
        const updates: Array<[string, number]> = [];
        
        orderMap.current.forEach((order, key) => {
            if (key === activeKey) {
                updates.push([key, newOrder]);
                return;
            }

            // Skip locked items
            const item = itemsMap.get(key);
            if (item?.disabledReSorted) return;
            
            let nextOrder = order;
            if (oldOrder < newOrder) {
                if (order > oldOrder && order <= newOrder) {
                    nextOrder = order - 1;
                }
            } else {
                if (order >= newOrder && order < oldOrder) {
                    nextOrder = order + 1;
                }
            }
            
            if (nextOrder !== order) {
                updates.push([key, nextOrder]);
            }
        });

        // Apply updates
        updates.forEach(([key, order]) => {
            orderMap.current.set(key, order);
        });

        // Animate items to new positions (except active item)
        updates.forEach(([key, order]) => {
            if (key !== activeKey) {
                const newPos = getPositionByIndex(order, blockWidth, blockHeight, containerLayout);
                animateToPosition(key, newPos);
            }
        });
    }, [orderMap, getPositionByIndex, animateToPosition]);

    return {
        reorderItems,
    };
};
