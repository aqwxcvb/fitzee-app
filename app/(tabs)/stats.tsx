import { Text, View } from "react-native";

export default function StatsScreen() {
    return (
        <View className="flex-1 justify-center items-center bg-background dark:bg-[#000000]">
            <Text className="text-3xl font-bold leading-8 text-foreground dark:text-white">Stats</Text>
        </View>
    );
}
