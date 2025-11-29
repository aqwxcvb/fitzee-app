import * as React from "react";
import {
    Animated,
    Easing,
    GestureResponderHandlers,
    Pressable,
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from "react-native";

const { useEffect, useRef } = React;

interface BlockProps {
    style?: StyleProp<ViewStyle>;
    dragStartAnimationStyle?: StyleProp<ViewStyle>;
    onPress?: () => void;
    onLongPress?: () => void;
    delayLongPress?: number;
    children?: React.ReactNode;
    panHandlers?: GestureResponderHandlers;
    isEditMode?: boolean;
    enableJiggle?: boolean;
    showDeleteButton?: boolean;
    renderDeleteButton?: () => React.ReactElement;
    onDelete?: () => void;
}

const JIGGLE_DURATION = 100;
const JIGGLE_ANGLE = 1.5;

export const Block: React.FC<BlockProps> = ({
    style,
    dragStartAnimationStyle,
    onPress,
    onLongPress,
    delayLongPress = 200,
    children,
    panHandlers,
    isEditMode,
    enableJiggle,
    showDeleteButton,
    renderDeleteButton,
}) => {
    const jiggleAnim = useRef(new Animated.Value(0)).current;
    const animationRef = useRef<Animated.CompositeAnimation | null>(null);

    useEffect(() => {
        if (isEditMode && enableJiggle) {
             animationRef.current = Animated.loop(
                Animated.sequence([
                    Animated.timing(jiggleAnim, {
                        toValue: 1,
                        duration: JIGGLE_DURATION,
                        easing: Easing.linear,
                        useNativeDriver: false, 
                    }),
                    Animated.timing(jiggleAnim, {
                        toValue: -1,
                        duration: JIGGLE_DURATION * 2,
                        easing: Easing.linear,
                        useNativeDriver: false,
                    }),
                    Animated.timing(jiggleAnim, {
                        toValue: 0,
                        duration: JIGGLE_DURATION,
                        easing: Easing.linear,
                        useNativeDriver: false,
                    }),
                ])
            );
            animationRef.current.start();
        } else {
             if (animationRef.current) {
                animationRef.current.stop();
                animationRef.current = null;
            }
            jiggleAnim.setValue(0);
        }
        return () => {
             if (animationRef.current) {
                animationRef.current.stop();
            }
        };
    }, [isEditMode, enableJiggle]);

    const jiggleStyle = {
        transform: [
            {
                rotate: jiggleAnim.interpolate({
                    inputRange: [-1, 1],
                    outputRange: [`-${JIGGLE_ANGLE}deg`, `${JIGGLE_ANGLE}deg`],
                }),
            },
        ],
    };

    const AnimatedView = Animated.View as any;
    const PressableComponent = Pressable as any;
    const ViewComponent = View as any;

    return (
        <AnimatedView 
            style={[
                styles.blockContainer, 
                style
            ]} 
        >
            <AnimatedView 
                style={[
                    styles.touchableWrapper,
                    dragStartAnimationStyle
                ]}
            >
                <AnimatedView
                    style={[
                        styles.innerContainer,
                        isEditMode && enableJiggle ? jiggleStyle : undefined
                    ]}
                >
                    <PressableComponent
                        onPress={onPress}
                        onLongPress={onLongPress}
                        delayLongPress={delayLongPress}
                        style={styles.contentContainer}
                    >
                        {children}
                    </PressableComponent>
                    {isEditMode && showDeleteButton && (
                        <ViewComponent style={styles.deleteButtonContainer} pointerEvents="box-none">
                            {renderDeleteButton ? renderDeleteButton() : null}
                        </ViewComponent>
                    )}
                </AnimatedView>
            </AnimatedView>
        </AnimatedView>
    );
};

const styles = StyleSheet.create({
    blockContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    touchableWrapper: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    innerContainer: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    contentContainer: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    deleteButtonContainer: {
        position: "absolute",
        top: 5,
        right: 5,
        zIndex: 10,
    }
});
