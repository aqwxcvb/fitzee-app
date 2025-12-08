import { Headline } from "@/components/ui/typography";
import Monicon from "@monicon/native";
import { Pressable, TouchableOpacity, useColorScheme, View } from "react-native";
import { Exercise } from "../types/exercise";
import BodyHeatmap from "./body-heatmap";
import { MuscleBadge } from "./muscle-badge";

const ExerciseCard = ({ exercise }: { exercise: Exercise }) => {
    const iconColor = useColorScheme() === "dark" ? "#d1d5db" : "#4b5563";
    return (
        <Pressable className="flex flex-row items-center border-b border-neutral-200 dark:border-neutral-800" style={{
            height: 145,
        }}>
            <View className="w-24 h-24 items-center overflow-hidden mr-4">
                <BodyHeatmap muscles={exercise.muscles} />
            </View>
            <View className="flex-1 h-full flex justify-center gap-3">
                <Headline numberOfLines={2}>
                    {exercise.name}
                </Headline>
                <View className="flex flex-row flex-wrap gap-2">
                    {exercise.muscles.map(muscle => (
                        <MuscleBadge key={muscle.id} muscle={muscle} />
                    ))}
                </View>
            </View>
            <TouchableOpacity className="w-14 h-full flex items-center justify-center">
                <Monicon name="solar:add-circle-bold" size={24} color={iconColor} />
            </TouchableOpacity>
        </Pressable>
    );
};

export default ExerciseCard;