import { Text, View } from "react-native";
import { Muscle } from "../types/exercise";

export interface MuscleBadgeProps {
    muscle: Muscle;
}

export const MuscleBadge = ({ muscle }: MuscleBadgeProps) => {
    const isPrimary = muscle.type === "primary";
    const contentColor = isPrimary ? "text-content-primary-light dark:text-content-primary-dark" : "text-content-secondary-light dark:text-content-secondary-dark";
    const borderColor = isPrimary ? "border-stroke-primary-light dark:border-stroke-primary-dark" : "border-stroke-secondary-light dark:border-stroke-secondary-dark";
    const name = muscle.name.length > 7 ? muscle.name.slice(0, 7) + "." : muscle.name;

    return (    
        <View className={`rounded-xl self-start inline-flex px-2 py-1 bg-surface-primary-light dark:bg-surface-primary-dark border ${borderColor}`}>
            <Text className={`text-xs font-sfpro-medium ${contentColor}`}>
                {name}
            </Text>
        </View>
    );
};