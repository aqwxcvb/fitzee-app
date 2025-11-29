import { Monicon } from "@monicon/native";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, useColorScheme } from "react-native";

import { HapticTab } from "@/components/features/tabs/haptic-tab";
import { useTranslation } from "@/i18n";

export default function TabLayout() {
    const { __ } = useTranslation();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#ff3b30",
                tabBarInactiveTintColor: isDark ? "#a3a3a3" : "#737373",
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarStyle: {
                    backgroundColor: isDark ? "rgba(23, 23, 23, 0.95)" : "rgba(255, 255, 255, 0.95)",
                    borderTopWidth: 1,
                    borderTopColor: isDark ? "#262626" : "#e5e5e5",
                    paddingTop: 8,
                    paddingBottom: Platform.OS === "ios" ? 32 : 12,
                    height: Platform.OS === "ios" ? 88 : 64,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: "500",
                },
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: __("Accueil"),
                    tabBarIcon: ({ color, focused }) => (
                        <Monicon 
                            name={focused ? "solar:home-2-bold" : "solar:home-angle-2-linear"} 
                            size={24} 
                            color={color} 
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="training"
                options={{
                    title: __("Entraînement"),
                    tabBarIcon: ({ color, focused }) => (
                        <Monicon 
                            name={focused ? "solar:dumbbell-large-minimalistic-bold" : "solar:dumbbell-large-minimalistic-linear"} 
                            size={24} 
                            color={color} 
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="stats"
                options={{
                    title: __("Statistiques"),
                    tabBarIcon: ({ color, focused }) => (
                        <Monicon 
                            name={focused ? "solar:chart-square-bold" : "solar:chart-square-linear"} 
                            size={24} 
                            color={color} 
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: __("Profil"),
                    tabBarIcon: ({ color, focused }) => (
                        <Monicon 
                            name={focused ? "solar:user-bold" : "solar:user-linear"} 
                            size={24} 
                            color={color} 
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
