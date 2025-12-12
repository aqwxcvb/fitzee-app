import { ReactElement, ReactNode } from 'react';
import { PanResponderGestureState, StyleProp, ViewStyle } from 'react-native';

export interface DraggableGridItem {
    key: string | number;
    disabledDrag?: boolean;
    disabledReSorted?: boolean;
    // Support for groups
    isGroup?: boolean;
    groupedItems?: DraggableGridItem[];
}

export interface DraggableGridRef {
    exitEditMode: () => void;
    applyScrollOffset: (deltaY: number) => void;
}

export interface DraggableGridProps<T extends DraggableGridItem> {
    // Required
    data: T[];
    numColumns: number;
    renderItem: (item: T, order: number) => ReactElement;
    
    // Layout
    style?: ViewStyle;
    itemHeight?: number;
    getItemHeight?: (item: T) => number;
    
    // Drag behavior
    dragStartAnimation?: StyleProp<ViewStyle>;
    delayLongPress?: number;
    
    // Callbacks
    onItemPress?: (item: T) => void;
    onDragStart?: (item: T) => void;
    onDragging?: (gestureState: PanResponderGestureState) => void;
    onDragRelease?: (newSortedData: T[]) => void;
    onDragOutside?: (item: T) => void;
    onEditModeChange?: (isEditMode: boolean) => void;
    
    // Edit mode features
    enableJiggle?: boolean;
    onItemDelete?: (item: T) => void;
    renderDeleteButton?: (item: T, onDelete: () => void) => ReactElement;
    
    // Grouping (optional feature)
    enableGrouping?: boolean;
    onGroupCreate?: (items: T[], targetItem: T) => void;
    
    // Group rendering
    renderGroupContainer?: (props: {
        items: T[];
        children: ReactNode;
        onUngroup?: () => void;
    }) => ReactElement;
}
