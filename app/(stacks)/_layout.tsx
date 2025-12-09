import { Stack } from "expo-router";

export default function ProgramBuilderLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="program-builder" />
        </Stack>
    );
}
