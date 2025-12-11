import { EyeOpenIcon } from "@/components/ui/icons";
import { Headline } from "@/components/ui/typography";
import { Pressable, TouchableOpacity, View } from "react-native";
import { Exercise } from "../types/exercise";
import BodyHeatmap from "./body-heatmap";
import { MuscleBadge } from "./muscle-badge";

type ExerciseCardProps = {
    displayMode?: "grid" | "list";
    exercise: Exercise;
}

const ExerciseCard = ({ displayMode = "grid", exercise }: ExerciseCardProps) => {
    return displayMode === "grid" 
        ? <ExerciseCardGrid exercise={exercise} />
        : <ExerciseCardList exercise={exercise} />;
};

const ExerciseCardGrid = ({ exercise }: ExerciseCardProps) => {
    return (
        <Pressable className="w-[49%] flex-col items-center bg-surface-primary-light dark:bg-surface-primary-dark rounded-xl overflow-hidden">
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
                <Headline numberOfLines={2} className="text-content-primary-light dark:text-content-primary-dark">
                    {exercise.name}
                </Headline>
                <View className="flex flex-row flex-wrap gap-2">
                    {exercise.muscles.map(muscle => (
                        <MuscleBadge key={muscle.id} muscle={muscle} />
                    ))}
                </View>
            </View>
        </Pressable>
    );
};

const ExerciseCardList = ({ exercise }: ExerciseCardProps) => {
    return (
        <Pressable className="flex-1 flex-row items-center gap-4 bg-surface-primary-light dark:bg-surface-primary-dark rounded-xl overflow-hidden">
            <View className="w-28 h-full items-center justify-center bg-surface-secondary-light dark:bg-surface-secondary-dark">
                <View className="w-full items-center p-2 aspect-square">
                    <View className="w-full h-full overflow-hidden">
                        <BodyHeatmap muscles={exercise.muscles} />
                    </View>
                </View>
            </View>
            <View className="flex-1 py-4 flex gap-4">
                <Headline numberOfLines={2} className="text-content-primary-light dark:text-content-primary-dark">
                    {exercise.name}
                </Headline>
                <View className="flex flex-row flex-wrap gap-x-1 gap-y-2">
                    {exercise.muscles.map(muscle => (
                        <MuscleBadge key={muscle.id} muscle={muscle} />
                    ))}
                </View>
            </View>
        </Pressable>
    );
};

export default ExerciseCard;