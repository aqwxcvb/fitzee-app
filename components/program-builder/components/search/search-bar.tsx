import { FavoriteIcon } from "@/components/ui/icons";
import { useTranslation } from "@/i18n";
import Monicon from "@monicon/native";
import { Text, TextInput, TouchableOpacity, useColorScheme, View } from "react-native";
import { MuscleFilter } from "./muscle-filter";

type SearchBarProps = {
    value: string;
    onChangeText: (text: string) => void;
};

export function SearchBar({
    value,
    onChangeText,
}: SearchBarProps) {
    const { __ } = useTranslation();
    const isDark = useColorScheme() === "dark";
    const iconColor = isDark ? "#8e8e93" : "#636366";

    return (
        <View className="my-4 gap-3">
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
            </View>

            <View className="flex-row items-center gap-2">
                <TouchableOpacity className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-primary-muted-light dark:bg-surface-primary-muted-dark">
                    <FavoriteIcon size={18} strokeWidth={4} className="text-content-primary-light dark:text-content-primary-dark" />
                    <Text className="font-sfpro-medium text-content-primary-light dark:text-content-primary-dark">
                        {__("Favoris")}
                    </Text>
                </TouchableOpacity>

                <MuscleFilter />
            </View>
        </View>
    );
}