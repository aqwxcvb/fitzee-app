import { ProgramBuilder } from "@/components/features/program-builder/program-builder";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BuilderScreen() {
    return (
        <SafeAreaView className="flex-1 bg-base-light dark:bg-base-dark" edges={["top"]}>
            <ProgramBuilder />
        </SafeAreaView>
    );
}

