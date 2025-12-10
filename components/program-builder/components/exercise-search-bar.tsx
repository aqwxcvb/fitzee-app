import { useTranslation } from "@/i18n";
import Monicon from "@monicon/native";
import { TextInput, TouchableOpacity, useColorScheme, View } from "react-native";

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
    className = "",
}: ExerciseSearchBarProps) => {
    const { __ } = useTranslation();
    const isDark = useColorScheme() === "dark";
    const iconColor = isDark ? "#8e8e93" : "#636366";

    return (
        <View className={`w-full h-14 flex-row items-center rounded-xl bg-surface-primary-light dark:bg-surface-primary-dark ${className}`}>
            <View className="h-full items-center justify-center px-4">
                <Monicon name="solar:magnifer-linear" size={18} color={iconColor} />
            </View>

            <TextInput
                className="flex-1 h-full font-sfpro-regular text-content-primary-light dark:text-content-primary-dark"
                placeholder={__("Rechercher un exercice...")}
                autoCorrect={false}
                value={value}
                onChangeText={onChangeText}
            />

            <TouchableOpacity className="h-full items-center justify-center px-4 bg-surface-primary-muted-light dark:bg-surface-primary-muted-dark rounded-r-xl" onPress={onFilterPress}>
                <Monicon name="solar:filter-linear" size={18} color={iconColor} />
            </TouchableOpacity>
        </View>
    );
};

export default ExerciseSearchBar;