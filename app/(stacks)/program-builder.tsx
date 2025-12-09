import { ProgramBuilder } from "@/components/program-builder";
import { View } from "react-native";

const ProgramBuilderScreen = () => {
    return (
        <View className="flex-1 bg-base-primary-light dark:bg-base-primary-dark">
            <ProgramBuilder />
        </View>
    );
};

export default ProgramBuilderScreen;
