import { EyeOpenIcon } from "@/components/ui/icons";
import { Headline } from "@/components/ui/typography";
import { Pressable, TouchableOpacity, View } from "react-native";
import { Muscle } from "../types";
import BodyHeatmap from "./body-heatmap";
import { MuscleBadge } from "./muscle-badge";

type ExerciseCardProps = {
    displayMode?: "grid" | "list";
    exercise: any;
}

export function ExerciseCard ({ displayMode = "grid", exercise }: ExerciseCardProps) {
    return displayMode === "grid" 
        ? <ExerciseCardGrid exercise={exercise} />
        : <ExerciseCardList exercise={exercise} />;
};

const ExerciseCardGrid = ({ exercise }: ExerciseCardProps) => {
    const marginHorizontal = exercise.id % 2 > 0 ? "mr-2" : "ml-2";
    
    return (
        <Pressable className={`flex-1 flex-col items-center bg-surface-primary-light dark:bg-surface-primary-dark rounded-xl overflow-hidden ${marginHorizontal} mb-4`}>
            <View className="w-full h-28 bg-surface-secondary-light dark:bg-surface-secondary-dark items-center justify-center overflow-hidden">                
                <TouchableOpacity
                    onPress={() => {
                        console.log("eye open");
                    }}
                    className="absolute top-0 left-0 w-10 h-10 rounded-full z-10 flex items-center justify-center"
                >
                    <EyeOpenIcon 
                        size={18} 
                        className="text-content-secondary-light dark:text-content-secondary-dark" 
                    />
                </TouchableOpacity>
                
                <View className="h-full aspect-square p-2">
                    <View className="w-full h-full items-center overflow-hidden">
                        <BodyHeatmap muscles={exercise.muscles} />
                    </View>
                </View>
            </View>
            <View className="flex-1 justify-start gap-3 p-4">
                <Headline numberOfLines={2} className="!text-[15px] text-content-primary-light dark:text-content-primary-dark">
                    {exercise.name}
                </Headline>
                <View className="flex flex-row flex-wrap gap-x-1 gap-y-2">
                    {exercise.muscles.map((muscle: Muscle) => (
                        <MuscleBadge key={muscle.id} muscle={muscle} />
                    ))}
                </View>
            </View>
        </Pressable>
    );
};

const ExerciseCardList = ({ exercise }: ExerciseCardProps) => {
    return (
        <Pressable className="flex-1 flex-row items-center bg-surface-primary-light dark:bg-surface-primary-dark rounded-xl overflow-hidden mb-2">
            <View className="w-28 h-full items-center justify-center bg-surface-secondary-light dark:bg-surface-secondary-dark">
                <View className="w-full items-center p-2 aspect-square">
                    <View className="w-full h-full overflow-hidden">
                        <BodyHeatmap muscles={exercise.muscles} />
                    </View>
                </View>
            </View>
            <View className="flex-1 p-4 flex gap-4">
                <Headline numberOfLines={2} className="!text-[15px] text-content-primary-light dark:text-content-primary-dark">
                    {exercise.name}
                </Headline>
                <View className="flex flex-row flex-wrap gap-x-1 gap-y-2">
                    {exercise.muscles.map((muscle: Muscle) => (
                        <MuscleBadge key={muscle.id} muscle={muscle} />
                    ))}
                </View>
            </View>
        </Pressable>
    );
};