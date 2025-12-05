import { TranslationProvider } from "@/i18n";
import { JetBrainsMono_400Regular, JetBrainsMono_500Medium, JetBrainsMono_700Bold } from "@expo-google-fonts/jetbrains-mono";
import { PlayfairDisplay_400Regular, PlayfairDisplay_500Medium, PlayfairDisplay_600SemiBold, PlayfairDisplay_700Bold } from "@expo-google-fonts/playfair-display";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useColorScheme as useTailwindColorScheme } from "nativewind";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import "../global.css";

// Empêcher le splash screen de se cacher automatiquement
if (typeof SplashScreen !== "undefined") {
    SplashScreen.preventAutoHideAsync().catch(() => {
        // Ignore l'erreur si le splash screen n'est pas disponible
    });
}

export const unstable_settings = {
    anchor: "(tabs)",
};

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const { setColorScheme } = useTailwindColorScheme();
    const [fontsLoaded, fontError] = useFonts({
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
        async function hideSplashScreen() {
            try {
                await SplashScreen.hideAsync();
            } catch (error) {
                // Ignore l'erreur si le splash screen n'est pas disponible
                console.warn("Splash screen error:", error);
            }
        }
        
        if (fontsLoaded || fontError) {
            hideSplashScreen();
        }
    }, [fontsLoaded, fontError]);

    useEffect(() => {
        setColorScheme(colorScheme || "light");
    }, [colorScheme, setColorScheme]);

    // Toujours rendre le ThemeProvider pour maintenir le contexte de navigation
    return (
        <GestureHandlerRootView>
            <TranslationProvider>
                <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
                    <Stack>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    </Stack>
                    <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
                </ThemeProvider>
            </TranslationProvider>
        </GestureHandlerRootView>
    );
}
