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
        <View className={`flex-row items-center bg-surface-light dark:bg-surface-dark rounded-lg overflow-hidden ${className}`}>
            <View className="pl-4">
                <Monicon name="solar:magnifer-linear" size={18} color={iconColor} />
            </View>
            
            <TextInput
                className="flex-1 p-4 font-sfpro-regular text-content-strong dark:text-content-inverse"
                placeholder={__("Rechercher un exercice...")}
                autoCorrect={false}
                value={value}
                onChangeText={onChangeText}
            />

            <TouchableOpacity className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg" onPress={onFilterPress}>
                <Monicon name="solar:filter-linear" size={18} color={iconColor} />
            </TouchableOpacity>
        </View>
    );
};

export default ExerciseSearchBar;