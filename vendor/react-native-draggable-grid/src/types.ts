import React from "react";
import { Animated, PanResponderGestureState, StyleProp, ViewStyle } from "react-native";

export interface BaseItemType {
    key: string | number;
    disabledDrag?: boolean;
    disabledReSorted?: boolean;
}

export interface DraggableGridRef {
    exitEditMode: () => void;
}

export interface DraggableGridProps<T extends BaseItemType> {
    numColumns: number;
    data: T[];
    renderItem: (item: T, order: number) => React.ReactElement;
    style?: ViewStyle;
    itemHeight?: number;
    dragStartAnimation?: StyleProp<ViewStyle>;
    onItemPress?: (item: T) => void;
    onDragItemActive?: (item: T) => void;
    onDragStart?: (item: T) => void;
    onDragging?: (gestureState: PanResponderGestureState) => void;
    onDragRelease?: (newSortedData: T[]) => void;
    onResetSort?: (newSortedData: T[]) => void;
    delayLongPress?: number;
    onEditModeChange?: (isEditMode: boolean) => void;
    enableJiggle?: boolean;
    onItemDelete?: (item: T) => void;
    renderDeleteButton?: (item: T, onDelete: () => void) => React.ReactElement;
}

export interface LayoutEvent {
    nativeEvent: {
        layout: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    };
}

export interface Position {
    x: number;
    y: number;
}

export interface OrderMapItem {
    order: number;
}

export interface GridItem<T> {
    key: string | number;
    itemData: T;
    currentPosition: Animated.AnimatedValueXY;
}

export interface GridLayout {
    x: number;
    y: number;
    width: number;
    height: number;
}

