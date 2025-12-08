import { Text, View } from "react-native";
import { Muscle } from "../types/exercise";

export interface MuscleBadgeProps {
    muscle: Muscle;
}

export const MuscleBadge = ({ muscle }: MuscleBadgeProps) => {
    const isPrimary = muscle.type === "primary";
    const contentColor = isPrimary ? "text-neutral-700 dark:text-neutral-400" : "text-neutral-600 dark:text-neutral-400";
    const borderColor = isPrimary ? "border-neutral-700 dark:border-neutral-400" : "border-neutral-600 dark:border-neutral-500";
    const name = muscle.name.length > 7 ? muscle.name.slice(0, 7) + "." : muscle.name;

    return (    
        <View className={`self-start inline-flex px-2 py-1 border ${borderColor}`}>
            <Text className={`text-xs font-sfpro-medium ${contentColor}`}>
                {name}
            </Text>
        </View>
    );
};