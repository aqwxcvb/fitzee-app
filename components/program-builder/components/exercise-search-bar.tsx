import { ActionSheet, ActionSheetOption } from "@/components/ui/action-sheet";
import { CrossCircleIcon, FavoriteIcon } from "@/components/ui/icons";
import { useTranslation } from "@/i18n";
import Monicon from "@monicon/native";
import { useCallback, useState } from "react";
import { Text, TextInput, TouchableOpacity, useColorScheme, View } from "react-native";

type ExerciseSearchBarProps = {
    value: string;
    onChangeText: (text: string) => void;
    onFilterPress: () => void;
    className?: string;
};

const ExerciseSearchBar = ({
    value,
    onChangeText,
    onFilterPress,
}: ExerciseSearchBarProps) => {
    const { __ } = useTranslation();
    const [selectedMuscle, setSelectedMuscle] = useState<string>("");
    const isDark = useColorScheme() === "dark";
    const iconColor = isDark ? "#8e8e93" : "#636366";

    const toggleMuscle = useCallback((muscle: string) => {
        setSelectedMuscle(prev => prev === muscle ? "" : muscle);
    }, []);

    const muscleNames = ["Pectoraux", "Triceps", "Biceps"];
    const muscleOptions: ActionSheetOption[] = muscleNames.map((name) => ({
        label: __(name),
        icon: (
            <View
                className={`w-4 h-4 rounded-full border border-content-primary-light dark:border-content-primary-dark ${
                    selectedMuscle === name ? "bg-content-primary-light dark:bg-content-primary-dark" : "bg-transparent"
                }`}
            />
        ),
        onPress: () => toggleMuscle(name),
    }));

    return (
        <View className="my-4 gap-2.5">
            <View className={`w-full h-14 flex-row items-center rounded-xl bg-surface-primary-muted-light dark:bg-surface-primary-muted-dark`}>
                <View className="h-full items-center justify-center px-4">
                    <Monicon name="solar:magnifer-linear" size={18} color={iconColor} />
                </View>

                <TextInput
                    className="flex-1 h-full font-sfpro-medium text-content-primary-light dark:text-content-primary-dark"
                    placeholder={__("Rechercher un exercice...")}
                    value={value}
                    onChangeText={onChangeText}
                />

                <TouchableOpacity className="h-full items-center justify-center px-4 bg-surface-primary-muted-light dark:bg-surface-primary-muted-dark rounded-r-xl" onPress={onFilterPress}>
                    <Monicon name="solar:filter-linear" size={18} color={iconColor} />
                </TouchableOpacity>
            </View>

            <View className="flex-row items-center gap-2">
                <TouchableOpacity className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-primary-muted-light dark:bg-surface-primary-muted-dark">
                    <FavoriteIcon size={18} strokeWidth={4} className="text-content-primary-light dark:text-content-primary-dark" />
                    <Text className="font-sfpro-medium text-content-primary-light dark:text-content-primary-dark">
                        {__("Favoris")}
                    </Text>
                </TouchableOpacity>

                {/*<TouchableOpacity className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-primary-muted-light dark:bg-surface-primary-muted-dark">
                    <Text className="font-sfpro-medium text-content-primary-light dark:text-content-primary-dark">
                        {__("Tous les muscles")}
                    </Text>

                    <CarretIcon size={18} strokeWidth={2} className="-ml-1 text-content-primary-light dark:text-content-primary-dark" />
                </TouchableOpacity>*/}

                <ActionSheet options={muscleOptions}>
                    <TouchableOpacity className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl bg-base-primary-dark dark:bg-base-primary-light">
                        <CrossCircleIcon size={18} strokeWidth={2} className="text-base-primary-light dark:text-base-primary-dark" />
                        
                        <Text className="font-sfpro-medium text-base-primary-light dark:text-base-primary-dark">
                            {__(selectedMuscle)}
                        </Text>
                    </TouchableOpacity>
                </ActionSheet>
            </View>
        </View>
    );
};

export default ExerciseSearchBar;