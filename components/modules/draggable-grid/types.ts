import type { ReactElement } from "react";
import type { PanResponderGestureState, StyleProp, ViewStyle } from "react-native";

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
    renderItem: (item: T, order: number) => ReactElement;
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
    renderDeleteButton?: (item: T, onDelete: () => void) => ReactElement;
    enableGrouping?: boolean;
    onGroupCreate?: (items: T[], targetItem: T) => void;
    activeNestedDragKey?: string;
}

export interface Position {
    x: number;
    y: number;
}

export interface ContainerLayout {
    width: number;
    height: number;
}

export interface BlockProps {
    style?: StyleProp<ViewStyle>;
    dragStartAnimationStyle?: StyleProp<ViewStyle>;
    onPress?: () => void;
    onLongPress?: () => void;
    delayLongPress?: number;
    children?: React.ReactNode;
    isEditMode?: boolean;
    enableJiggle?: boolean;
    showDeleteButton?: boolean;
    renderDeleteButton?: () => ReactElement;
    isGrouped?: boolean;
}
