import { Stack } from "expo-router";

export default function StacksLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen 
                name="program-builder" 
                options={{ gestureEnabled: false }} 
            />
        </Stack>
    );
}
