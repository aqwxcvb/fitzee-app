import { Caption } from "@/components/ui/typography";
import { useTranslation } from "@/i18n";
import { Animated } from "react-native";

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
            
            <Caption className="text-content-secondary-light dark:text-content-secondary-dark">
                {__("Récapitulatif de votre séance")}
            </Caption>
        </Animated.ScrollView>
    );
};

export default WorkoutBuilderPanel;