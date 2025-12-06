import React from "react";
import { PanResponderGestureState, StyleProp, ViewStyle } from "react-native";

export interface BaseItemType {
    key: string | number;
    disabledDrag?: boolean;
    disabledReSorted?: boolean;
}

export interface DraggableGridRef {
    exitEditMode: () => void;
    applyScrollOffset: (deltaY: number) => void;
}

export interface DraggableGridProps<T extends BaseItemType> {
    numColumns: number;
    data: T[];
    renderItem: (item: T, order: number) => React.ReactElement;
    style?: ViewStyle;
    itemHeight?: number;
    getItemHeight?: (item: T) => number;
    dragStartAnimation?: StyleProp<ViewStyle>;
    onItemPress?: (item: T) => void;
    onDragStart?: (item: T) => void;
    onDragging?: (gestureState: PanResponderGestureState) => void;
    onDragRelease?: (newSortedData: T[]) => void;
    onDragOutside?: (item: T) => void;
    delayLongPress?: number;
    onEditModeChange?: (isEditMode: boolean) => void;
    enableJiggle?: boolean;
    onItemDelete?: (item: T) => void;
    renderDeleteButton?: (item: T, onDelete: () => void) => React.ReactElement;
    enableGrouping?: boolean;
    onGroupCreate?: (items: T[], targetItem: T) => void;
}

