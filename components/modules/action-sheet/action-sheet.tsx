import React, { useContext, useRef } from "react";
import { View } from "react-native";
import { ActionSheetContext } from "./action-sheet-context";
import { ActionSheetProps } from "./types";

export function ActionSheet({ children, options, offset = 8, placement = "auto" }: ActionSheetProps) {
    const viewRef = useRef<View>(null);
    const context = useContext(ActionSheetContext);

    const handlePress = () => {
        if(!viewRef.current || !context) {
            return;
        }

        viewRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
            context.setAnchor({ x, y, width, height });
        });

        context.setOptions(options || []);
        context.setOffset(offset);
        context.setPlacement(placement);
    }

    const childrenWithOnPress = React.cloneElement(children, {
        ...children.props as any,
        onPress: handlePress,
    });

    return (
       <View ref={viewRef} collapsable={false}>
            {childrenWithOnPress}
        </View>
    );
}