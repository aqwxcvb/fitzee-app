import { Text, View } from "react-native";
import { Muscle } from "../types/exercise";

export interface MuscleBadgeProps {
    muscle: Muscle;
}

export const MuscleBadge = ({ muscle }: MuscleBadgeProps) => {
    const isPrimary = muscle.type === "primary";
    const contentColor = isPrimary ? "text-content-primary-light dark:text-content-primary-dark" : "text-content-secondary-light dark:text-content-secondary-dark";
    const borderColor = "border-stroke-secondary-light dark:border-stroke-secondary-dark";

    return (    
        <View className={`rounded-xl self-start inline-flex px-2 py-1 bg-surface-primary-muted-light dark:bg-surface-primary-muted-dark border ${borderColor}`}>
            <Text className={`text-xs font-sfpro-regular ${contentColor}`}>
                {muscle.name}
            </Text>
        </View>
    );
};