import { Caption } from "@/components/ui/typography";
import { useTranslation } from "@/i18n";
import { Animated } from "react-native";

const WorkoutBuilderPanel: React.FC<{ headerScrollDistance: number }> = ({ headerScrollDistance }) => {
    const { __ } = useTranslation();

    return (
        <Animated.ScrollView
            className="flex-1 bg-base-light dark:bg-base-dark border-r border-neutral-200 dark:border-neutral-800 p-4"
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            bounces={false}
            overScrollMode="never"
            contentContainerStyle={{
                flexGrow: 1,
                paddingBottom: headerScrollDistance,
            }}
        >
            <Caption>
                {__("Récapitulatif de votre séance")}
            </Caption>
        </Animated.ScrollView>
    );
};

export default WorkoutBuilderPanel;