import { TranslationProvider } from "@/i18n";
import { JetBrainsMono_400Regular, JetBrainsMono_500Medium, JetBrainsMono_700Bold } from "@expo-google-fonts/jetbrains-mono";
import { PlayfairDisplay_400Regular, PlayfairDisplay_500Medium, PlayfairDisplay_600SemiBold, PlayfairDisplay_700Bold } from "@expo-google-fonts/playfair-display";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme as useTailwindColorScheme } from "nativewind";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import "../global.css";

export const unstable_settings = {
    anchor: "(tabs)",
};

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const { setColorScheme } = useTailwindColorScheme();
    
    const [fontsLoaded] = useFonts({
        "SFPro-Light": require("../assets/fonts/SF-Pro-Text-Light.otf"),
        "SFPro-Regular": require("../assets/fonts/SF-Pro-Text-Regular.otf"),
        "SFPro-Medium": require("../assets/fonts/SF-Pro-Text-Medium.otf"),
        "SFPro-Semibold": require("../assets/fonts/SF-Pro-Text-Semibold.otf"),
        "SFPro-Bold": require("../assets/fonts/SF-Pro-Text-Bold.otf"),
        "SFPro-Display-Bold": require("../assets/fonts/SF-Pro-Display-Bold.otf"),

        // Playfair Display (serif)
        "PlayfairDisplay-Regular": PlayfairDisplay_400Regular,
        "PlayfairDisplay-Medium": PlayfairDisplay_500Medium,
        "PlayfairDisplay-SemiBold": PlayfairDisplay_600SemiBold,
        "PlayfairDisplay-Bold": PlayfairDisplay_700Bold,
        // JetBrains Mono (monospace)
        "JetBrainsMono-Regular": JetBrainsMono_400Regular,
        "JetBrainsMono-Medium": JetBrainsMono_500Medium,
        "JetBrainsMono-Bold": JetBrainsMono_700Bold,
    });

    useEffect(() => {
        if(fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    useEffect(() => {
        setColorScheme(colorScheme || "light");
    }, [colorScheme, setColorScheme]);

    if(!fontsLoaded) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <TranslationProvider>
                <BottomSheetModalProvider>
                    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
                        <Stack screenOptions={{ headerShown: false }}>
                            <Stack.Screen name="(tabs)" />
                            <Stack.Screen name="(stacks)" />
                            <Stack.Screen 
                                name="(modals)" 
                                options={{ 
                                    presentation: "formSheet",
                                    headerShown: false,
                                    sheetAllowedDetents: "fitToContents",
                                    sheetCornerRadius: 24,
                                }} 
                            />
                        </Stack>
                        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
                    </ThemeProvider>
                </BottomSheetModalProvider>
            </TranslationProvider>
        </GestureHandlerRootView>
    );
}
