import { createContext, Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    LayoutChangeEvent,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    useColorScheme,
    View
} from "react-native";
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
    const [maxScrollHeight, setMaxScrollHeight] = useState(240);

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

    const calculateMaxScrollHeight = () => {
        if (!anchor) {
            return 240;
        }

        const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Platform.OS === "android" 
            ? Dimensions.get("screen") 
            : Dimensions.get("window");

        const anchorY = anchor.y;
        const anchorHeight = anchor.height;

        const spaceBelow = SCREEN_HEIGHT - (anchorY + anchorHeight) - offset * 2;
        const spaceAbove = anchorY - offset * 2;

        const maxAvailableHeight = Math.max(spaceBelow, spaceAbove);
        
        // Limiter à un minimum de 100px et maximum de 400px
        return Math.min(Math.max(maxAvailableHeight, 100), 400);
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
            anchorX + actionSheet.width <= SCREEN_WIDTH - offset;

        const hasSpaceLeft =
            anchorX + anchorWidth - actionSheet.width >= offset;

        const placeBelow = () => {
            // Vérifier si on peut s'aligner à gauche (s'ouvrir vers la droite)
            const canAlignLeft = anchorX + actionSheet.width <= SCREEN_WIDTH - offset;
            
            return {
                top: clamp(anchorY + anchorHeight + offset, MIN_TOP, MAX_TOP),
                left: canAlignLeft 
                    ? clamp(anchorX, MIN_LEFT, MAX_LEFT)
                    : clamp(anchorX + anchorWidth - actionSheet.width, MIN_LEFT, MAX_LEFT),
            };
        };

        const placeAbove = () => {
            // Vérifier si on peut s'aligner à gauche (s'ouvrir vers la droite)
            const canAlignLeft = anchorX + actionSheet.width <= SCREEN_WIDTH - offset;
            
            return {
                top: clamp(anchorY - actionSheet.height - offset, MIN_TOP, MAX_TOP),
                left: canAlignLeft 
                    ? clamp(anchorX, MIN_LEFT, MAX_LEFT)
                    : clamp(anchorX + anchorWidth - actionSheet.width, MIN_LEFT, MAX_LEFT),
            };
        };

        const placeRight = () => ({
            top: clamp(anchorY, MIN_TOP, MAX_TOP),
            left: clamp(anchorX, MIN_LEFT, MAX_LEFT),
        });

        const placeLeft = () => ({
            top: clamp(anchorY, MIN_TOP, MAX_TOP),
            left: clamp(anchorX + anchorWidth - actionSheet.width, MIN_LEFT, MAX_LEFT),
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
        setMaxScrollHeight(calculateMaxScrollHeight());
        setVisible(true);
    }, [anchor]);

    useEffect(() => {   
        Animated.parallel([
            Animated.spring(scale, {
                toValue: visible ? 1 : 0,
                useNativeDriver: true,
                tension: 120,
                friction: 12,
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

    const renderOptions = useMemo(() => {        
        const categorizedOptions: ActionSheetOption[] = [];
        const uncategorizedOptions: ActionSheetOption[] = [];
    
        options.forEach(option => {
            if (option.category) {
                categorizedOptions.push(option);
            } else {
                uncategorizedOptions.push(option);
            }
        });
    
        categorizedOptions.sort((a, b) => {
            if (a.category! < b.category!) return -1;
            if (a.category! > b.category!) return 1;
            
            if (a.label < b.label) return -1;
            if (a.label > b.label) return 1;
            return 0;
        });
    
        uncategorizedOptions.sort((a, b) => {
            if (a.label < b.label) return -1;
            if (a.label > b.label) return 1;
            return 0;
        });
        
        const sortedOptions = [...categorizedOptions, ...uncategorizedOptions];
                
        let lastCategory: string | undefined = undefined;
        return sortedOptions.map((option, index) => {
            const isNewCategory = option.category && option.category !== lastCategory;
            const nextOption = sortedOptions[index + 1];
            
            const isNotLastItemGlobal = index < sortedOptions.length - 1;
            const isEndOfCategoryGroup = nextOption && nextOption.category !== option.category;
            const shouldRenderSeparator = isNotLastItemGlobal && !isEndOfCategoryGroup;
            
            lastCategory = option.category;
    
            return (
                <Fragment key={option.label}> 
                    {isNewCategory && (
                        <View className="py-4 px-6">
                            <Text className="font-sfpro-semibold text-[13px] uppercase text-content-secondary-light dark:text-content-secondary-dark">
                                {option.category}
                            </Text>
                        </View>
                    )}
    
                    <TouchableOpacity 
                        onPress={() => handleOptionPress(option)} 
                        className="px-6 py-3.5 flex-row items-center gap-4"
                    >
                        {option.icon && option.icon}
                        <Text className="shrink font-sfpro-regular text-[15px] text-content-primary-light dark:text-content-primary-dark">
                            {option.label}
                        </Text>
                    </TouchableOpacity>
    
                    {shouldRenderSeparator && (
                        <View className="h-px bg-stroke-primary-light dark:bg-stroke-primary-dark" />
                    )}
                </Fragment>
            );
        });
    }, [options, handleOptionPress]);

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
                    <ScrollView 
                        showsVerticalScrollIndicator={false}
                        style={{ maxHeight: maxScrollHeight, flexGrow: 0 }}
                    >
                        {renderOptions}
                    </ScrollView>
                </Animated.View>
            </Modal>
        </ActionSheetContext.Provider>
    );
}