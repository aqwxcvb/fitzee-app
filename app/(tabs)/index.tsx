import { ChooseProgramModal } from "@/components/features/home/choose-program-modal";
import { MyPrograms } from "@/components/features/home/my-programs";
import { AutoScrollView } from "@/components/ui/auto-scroll-view";
import { AutoScrollProvider } from "@/contexts/auto-scroll-context";
import { useTranslation } from "@/i18n";
import { Monicon } from "@monicon/native";
import { useState } from "react";
import { Image, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TrainingScreen() {
    const { __ } = useTranslation();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const iconColor = isDark ? "white" : "black";
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [scrollEnabled, setScrollEnabled] = useState(true);

    return (
        <SafeAreaView className="flex-1 pt-4 bg-base-light dark:bg-base-dark" edges={["top"]}>
            <AutoScrollProvider>
                <AutoScrollView 
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ flexGrow: 1 }}
                    scrollEnabled={scrollEnabled}
                >                
                    <View className="px-5 pb-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-[34px] font-geist-bold leading-tight tracking-tight text-black dark:text-white">
                                {__("Entraînement")}
                            </Text>
                            <View 
                                className="w-10 h-10 rounded-full bg-light-surface dark:bg-dark-surface border border-border-light dark:border-border-dark overflow-hidden"
                                style={{
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: isDark ? 0.2 : 0.08,
                                    shadowRadius: 3,
                                    elevation: 2,
                                }}
                            >
                                <Image
                                    source={{ uri: "https://randomuser.me/api/portraits/men/32.jpg" }}
                                    className="w-full h-full"
                                />
                            </View>
                        </View>
                    </View>

                    <View className="px-5 gap-3 mb-8">
                        <Text className="text-sm tracking-wider font-geist-medium text-content uppercase">
                            {__("Démarrage rapide")}
                        </Text>
                        <TouchableOpacity 
                            className="w-full bg-surface-light dark:bg-surface-dark border border-stroke-light dark:border-stroke-dark rounded-2xl p-5 flex-row items-center gap-4"
                            activeOpacity={0.98}
                            style={{
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: isDark ? 0.2 : 0.08,
                                shadowRadius: 3,
                                elevation: 2,
                            }}
                        >
                            <View className="w-12 h-12 rounded-full bg-accent-light dark:bg-accent-dark items-center justify-center">
                                <Monicon name="solar:add-circle-linear" size={24} color={iconColor} />
                            </View>
                            <Text className="flex-1 text-[17px] font-geist-medium text-black dark:text-white">
                                {__("Démarrer une séance improvisée")}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className="px-5 gap-3 mb-8">
                        <Text className="text-sm tracking-wider font-geist-medium text-content uppercase">
                            {__("Séances")}
                        </Text>
                        <View className="gap-3">
                            <TouchableOpacity 
                                className="w-full bg-surface-light dark:bg-surface-dark border border-stroke-light dark:border-stroke-dark rounded-2xl p-5 flex-row items-center gap-4"
                                activeOpacity={0.98}
                                onPress={() => setIsModalVisible(true)}
                                style={{
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: isDark ? 0.2 : 0.08,
                                    shadowRadius: 3,
                                    elevation: 2,
                                }}
                            >
                                <View className="w-12 h-12 rounded-full bg-accent-light dark:bg-accent-dark items-center justify-center">
                                    <Monicon name="solar:clipboard-linear" size={24} color={iconColor} />
                                </View>
                                <Text className="flex-1 text-[17px] font-geist-medium text-black dark:text-white">
                                    {__("Nouvelle séance")}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                className="w-full bg-surface-light dark:bg-surface-dark border border-stroke-light dark:border-stroke-dark rounded-2xl p-5 flex-row items-center gap-4"
                                activeOpacity={0.98}
                                style={{
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: isDark ? 0.2 : 0.08,
                                    shadowRadius: 3,
                                    elevation: 2,
                                }}
                            >
                                <View className="w-12 h-12 rounded-full bg-accent-light dark:bg-accent-dark items-center justify-center">
                                    <Monicon name="solar:magnifer-linear" size={24} color={iconColor} />
                                </View>
                                <Text className="flex-1 text-[17px] font-geist-medium text-black dark:text-white">
                                    {__("Explorer les séances")}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="flex-1 px-5 gap-3">
                        <View className="flex-row justify-between items-center">
                            <Text className="text-sm tracking-wider font-geist-medium text-content uppercase">
                                {__("Mes programmes")}
                            </Text>
                        </View>

                        <MyPrograms onChangeScrollEnable={setScrollEnabled} />  
                    </View>
                </AutoScrollView>
            </AutoScrollProvider>
            
            <ChooseProgramModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onConfirm={(programId) => {
                    console.log("Program selected:", programId);
                    // TODO: Handle program selection
                }}
            />
        </SafeAreaView>
    );
}
