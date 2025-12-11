import { createContext, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, LayoutChangeEvent, Modal, Platform, Pressable, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { ActionSheet, ActionSheetOption, ActionSheetPlacement, Anchor } from "./types";

type ActionSheetContextValue = {
    visible: boolean;
    setVisible: (visible: boolean) => void;

    anchor: Anchor | null;
    setAnchor: (anchor: Anchor | null) => void;

    options: ActionSheetOption[];
    setOptions: (options: ActionSheetOption[]) => void;

    actionSheet: ActionSheet;
    setActionSheet: (actionSheet: ActionSheet) => void;

    offset: number;
    setOffset: (offset: number) => void;

    placement: ActionSheetPlacement;
    setPlacement: (placement: ActionSheetPlacement) => void;
};

export const ActionSheetContext = createContext<ActionSheetContextValue | null>(null);

export function ActionSheetProvider({ children }: { children: React.ReactNode }) {
    const [visible, setVisible] = useState(false);

    const [anchor, setAnchor] = useState<Anchor | null>(null);
    const [options, setOptions] = useState<ActionSheetOption[]>([]);
    const [actionSheet, setActionSheet] = useState<ActionSheet>({ height: 0, width: 0 });
    const [isLayoutReady, setIsLayoutReady] = useState(false);
    const [offset, setOffset] = useState(8);
    const [placement, setPlacement] = useState<ActionSheetPlacement>("auto");

    const scale = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    const handleClose = () => {
        scale.setValue(0);
        opacity.setValue(0);
 
        setVisible(false);
    };

    const handleModalLayout = (event: LayoutChangeEvent) => {
        const { height, width } = event.nativeEvent.layout;
        setActionSheet({ height, width });
        setIsLayoutReady(true);
    };

    const handleOptionPress = (option: ActionSheetOption) => {
        option.onPress?.();
        handleClose();
    };

    const getPopupPositionStyle = () => {
        if (!anchor || !actionSheet) {
            return { top: -9999, left: -9999 };
        }

        const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Platform.OS === "android" ? Dimensions.get("screen") : Dimensions.get("window");

        const anchorX = anchor.x;
        const anchorY = anchor.y;
        const anchorWidth = anchor.width;
        const anchorHeight = anchor.height;

        const MIN_LEFT = offset;
        const MAX_LEFT = SCREEN_WIDTH - actionSheet.width - offset;
        const MIN_TOP = offset;
        const MAX_TOP = SCREEN_HEIGHT - actionSheet.height - offset;

        const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

        const hasSpaceBelow =
            anchorY + anchorHeight + offset + actionSheet.height <= SCREEN_HEIGHT - offset;

        const hasSpaceAbove =
            anchorY - offset - actionSheet.height >= offset;

        const hasSpaceRight =
            anchorX + anchorWidth + offset + actionSheet.width <= SCREEN_WIDTH - offset;

        const hasSpaceLeft =
            anchorX - offset - actionSheet.width >= offset;

        const placeBelow = () => ({
            top: clamp(anchorY + anchorHeight + offset, MIN_TOP, MAX_TOP),
            left: clamp(anchorX + anchorWidth - actionSheet.width, MIN_LEFT, MAX_LEFT),
        });

        const placeAbove = () => ({
            top: clamp(anchorY - actionSheet.height - offset, MIN_TOP, MAX_TOP),
            left: clamp(anchorX + anchorWidth - actionSheet.width, MIN_LEFT, MAX_LEFT),
        });

        const placeRight = () => ({
            top: clamp(anchorY, MIN_TOP, MAX_TOP),
            left: clamp(anchorX + anchorWidth + offset, MIN_LEFT, MAX_LEFT),
        });

        const placeLeft = () => ({
            top: clamp(anchorY, MIN_TOP, MAX_TOP),
            left: clamp(anchorX - actionSheet.width - offset, MIN_LEFT, MAX_LEFT),
        });

        const resolveExplicitPlacement = (placement: ActionSheetPlacement) => {
            switch (placement) {
                case "bottom":
                    return hasSpaceBelow ? placeBelow() :
                           hasSpaceAbove ? placeAbove() :
                           placeBelow();

                case "top":
                    return hasSpaceAbove ? placeAbove() :
                           hasSpaceBelow ? placeBelow() :
                           placeAbove();

                case "right":
                    return hasSpaceRight ? placeRight() :
                           hasSpaceLeft  ? placeLeft()  :
                           placeRight();

                case "left":
                    return hasSpaceLeft ? placeLeft() :
                           hasSpaceRight ? placeRight() :
                           placeLeft();

                default:
                    return null;
            }
        };

        if (placement !== "auto") {
            return resolveExplicitPlacement(placement)!;
        }

        const autoPlacement = [
            { condition: hasSpaceBelow, action: placeBelow },
            { condition: hasSpaceAbove, action: placeAbove },
            { condition: hasSpaceRight, action: placeRight },
            { condition: hasSpaceLeft,  action: placeLeft },
        ];

        const match = autoPlacement.find(rule => rule.condition);
        if (match) {
            return match.action();
        }

        return placeBelow();
    };

    useEffect(() => {
        if(!anchor) {
            return;
        }

        setIsLayoutReady(false);
        setVisible(true);
    }, [anchor]);

    useEffect(() => {   
        Animated.parallel([
            Animated.spring(scale, {
                toValue: visible ? 1 : 0,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
            }),
            Animated.timing(opacity, {
                toValue: visible ? 1 : 0,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();
    }, [visible]);

    const actionSheetShadow = Platform.select({
        ios: useColorScheme() === "dark"
            ? {
                shadowColor: "#000",
                shadowOpacity: 0.8,
                shadowRadius: 24,
                shadowOffset: { width: 0, height: 0 },
            }
            : {
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 0 },
            },
        android: {
            elevation: 3,
            shadowColor: "#000",
        },
    });

    return (
        <ActionSheetContext.Provider
            value={{
                visible,
                setVisible,
                anchor,
                setAnchor,
                options,
                setOptions,
                actionSheet,
                setActionSheet,
                offset,
                setOffset,
                placement,
                setPlacement,
            }}
        >
            {children}

            <Modal
                visible={visible}
                onRequestClose={handleClose}
                transparent
            >
                <Pressable
                    onPress={handleClose}
                    className="absolute inset-0 bg-transparent"
                />

                <Animated.View
                    onLayout={handleModalLayout}
                    className="self-start max-w-[240px] bg-surface-primary-light dark:bg-surface-primary-dark rounded-xl"
                    style={[
                        getPopupPositionStyle(),
                        actionSheetShadow,
                        { transform: [{ scale: scale }], opacity: isLayoutReady ? opacity : 0 },
                    ]}
                >
                    <View>
                        {options.map((option, index) => (
                            <TouchableOpacity 
                                key={index} 
                                onPress={() => handleOptionPress(option)} 
                                className="px-6 py-3.5 flex-row items-center gap-4"
                            >
                                {option.icon && option.icon}

                                <Text className="shrink font-sfpro-regular text-[16px] text-content-primary-light dark:text-content-primary-dark">
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>
            </Modal>
        </ActionSheetContext.Provider>
    );
}