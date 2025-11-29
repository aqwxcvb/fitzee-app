import { useAutoScroll } from "@/contexts/auto-scroll-context";
import React, { useCallback } from "react";
import { LayoutChangeEvent, ScrollView, ScrollViewProps } from "react-native";

interface AutoScrollViewProps extends ScrollViewProps {
    children: React.ReactNode;
}

export function AutoScrollView({ children, onScroll, onLayout, onContentSizeChange, ...props }: AutoScrollViewProps) {
    const { 
        handleScroll, 
        registerScrollView, 
        setContainerHeight, 
        setContentHeight 
    } = useAutoScroll();

    const handleLayout = useCallback((event: LayoutChangeEvent) => {
        setContainerHeight(event.nativeEvent.layout.height);
        onLayout?.(event);
    }, [onLayout, setContainerHeight]);

    const handleContentSizeChange = useCallback((width: number, height: number) => {
        setContentHeight(height);
        onContentSizeChange?.(width, height);
    }, [onContentSizeChange, setContentHeight]);

    const handleScrollEvent = useCallback((event: any) => {
        handleScroll(event);
        onScroll?.(event);
    }, [handleScroll, onScroll]);

    return (
        <ScrollView
            ref={registerScrollView}
            onLayout={handleLayout}
            onScroll={handleScrollEvent}
            scrollEventThrottle={16}
            onContentSizeChange={handleContentSizeChange}
            {...props}
        >
            {children}
        </ScrollView>
    );
}

