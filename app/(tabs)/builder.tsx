import ProgramBuilder from "@/components/features/program-builder";
import { View } from "react-native";

export default function BuilderScreen() {
    return (
        <View className="flex-1 bg-base-light dark:bg-base-dark">
            <ProgramBuilder />
        </View>
    );
}

