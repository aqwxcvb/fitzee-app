import { Body, Caption } from "@/components/ui/typography";
import { useTranslation } from "@/i18n";
import { Animated, View } from "react-native";
import { SwipeIndicator } from "./components/swipe-indicator";

type AnimatedValue = number | Animated.AnimatedAddition<number> | Animated.AnimatedInterpolation<number>;

const WorkoutBuilderPanel: React.FC<{ currentHeaderHeight: AnimatedValue, headerScrollDistance: number }> = ({ currentHeaderHeight, headerScrollDistance }) => {
    const { __ } = useTranslation();

    return (
        <Animated.ScrollView
            className="flex-1 p-4"
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            bounces={false}
            overScrollMode="never"
            contentContainerStyle={{
                flexGrow: 1,
                paddingBottom: headerScrollDistance,
            }}
        >
            <Animated.View style={{ height: currentHeaderHeight }} />
            
            <Caption className="my-4 text-content-secondary-light dark:text-content-secondary-dark">
                {__("Récapitulatif de votre séance")}
            </Caption>

            <View className="flex-1 items-center justify-center gap-6">
                <SwipeIndicator />

                <Body className="text-center text-content-tertiary-light dark:text-content-tertiary-dark px-8">
                    {__("Swipe vers la droite pour parcourir tous les exercices.")}
                </Body>
            </View>
        </Animated.ScrollView>
    );
};

export default WorkoutBuilderPanel;