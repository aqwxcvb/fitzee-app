import React, { useCallback, useState } from "react";
import { LayoutChangeEvent, View } from "react-native";
import { Popup } from "./popup";
import { PopupTriggerPosition, PopupWrapperProps } from "./types";

export function PopupWrapper({ children, isOpen, onClose, options, offset = 12, width = 240, showOverlay = true }: PopupWrapperProps) {
    const [triggerPosition, setTriggerPosition] = useState<PopupTriggerPosition | undefined>();

    const handleLayout = useCallback((event: LayoutChangeEvent) => {
        const { x, y, width, height } = event.nativeEvent.layout;
        setTriggerPosition({ x, y, width, height });
    }, []);

    const childrenWithLayout = React.cloneElement(children, {
        onLayout: (event: LayoutChangeEvent) => {
            handleLayout(event);
            const originalOnLayout = children.props.onLayout;
            
            if (originalOnLayout) {
                originalOnLayout(event);
            }
        },
        style: {
            zIndex: 10,
        }
    } as Partial<{ onLayout: (event: LayoutChangeEvent) => void }>);

    return (
        <View className="absolute inset-0">
            <Popup 
                isOpen={isOpen}
                onClose={onClose}
                options={options}
                triggerPosition={triggerPosition}
                offset={offset}
                width={width}
                showOverlay={showOverlay}
            />
            
            {childrenWithLayout}
        </View>
    );
}