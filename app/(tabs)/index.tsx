import { MyPrograms } from "@/components/features/home/my-programs";
import { AutoScrollView } from "@/components/ui/auto-scroll-view";
import { BigTitle, Caption, Headline } from "@/components/ui/typography";
import { AutoScrollProvider } from "@/contexts/auto-scroll-context";
import { useTranslation } from "@/i18n";
import { Monicon } from "@monicon/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Image,
    TouchableOpacity,
    useColorScheme,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TrainingScreen() {
    const { __ } = useTranslation();
    const colorScheme = useColorScheme();
    const router = useRouter();
    
    const isDark = colorScheme === "dark";
    const iconColor = isDark ? "#F2F2F7" : "#2A2A2C";

    const [scrollEnabled, setScrollEnabled] = useState(true);

    return (
        <View className="flex-1 bg-base-primary-light dark:bg-base-primary-dark">
            <LinearGradient
                colors={
                    isDark ? ["#2A2A2C", "#1A1B1D", "#000000"] : ["#F7F8FA", "#F3F5FB", "#EBEDF0"]
                }
                locations={[0, 0.55, 1]}
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    height: 300
                }}
            />

            <SafeAreaView className="flex-1 pt-8" edges={["top"]}>
                <AutoScrollProvider>
                    <AutoScrollView
                        className="flex-1"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ flexGrow: 1 }}
                        scrollEnabled={scrollEnabled}
                    >
                        <View className="px-5 pb-6">
                            <View className="mb-6 flex-row items-center justify-between">
                                <BigTitle className="text-content-primary-light dark:text-content-primary-dark">
                                    {__("Entraînement")}
                                </BigTitle>
                                <View className="h-10 w-10 overflow-hidden rounded-full">
                                    <Image
                                        source={{ uri: "https://randomuser.me/api/portraits/men/32.jpg" }}
                                        className="h-full w-full"
                                    />
                                </View>
                            </View>
                        </View>

                        <View className="px-5 mb-10 flex gap-3">
                            <TouchableOpacity
                                    activeOpacity={0.98}
                                    onPress={() => router.push("/(stacks)/program-builder")}
                                    className="w-full flex-row items-center gap-4 rounded-[14px] p-4 bg-accent-primary-light dark:bg-accent-primary-dark"
                                >
                                    <View className="h-10 w-10 items-center justify-center rounded-full bg-accent-primary-muted-light dark:bg-accent-primary-muted-dark">
                                        <Monicon
                                            name="solar:add-circle-bold"
                                            size={24}
                                            color="#ffffff"
                                        />
                                    </View>
                                    <Headline className="flex-1 text-accent-primary-label-light dark:text-accent-primary-label-dark">
                                        {__("Créer une nouvelle séance")}
                                    </Headline>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    activeOpacity={0.98}
                                    className="w-full flex-row items-center gap-4 rounded-[14px] p-4 bg-surface-primary-light dark:bg-surface-primary-dark"
                                >
                                    <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-primary-muted-light dark:bg-surface-primary-muted-dark">
                                        <Monicon
                                            name="solar:bolt-outline"
                                            size={24}
                                            color={iconColor}
                                        />
                                    </View>
                                    <Headline className="flex-1 text-content-primary-light dark:text-content-primary-dark">
                                        {__("Démarrer une séance improvisée")}
                                    </Headline>
                                </TouchableOpacity>
                        </View>

                        {/* Séances */}
                        <View className="mb-10 gap-3 px-5">
                            <Caption className="text-content-secondary-light dark:text-content-secondary-dark">
                                {__("Pour bien démarrer")}
                            </Caption>

                            <View className="gap-3">
                                <TouchableOpacity
                                    activeOpacity={0.98}
                                    className="w-full flex-row items-center gap-4 rounded-[14px] p-4 bg-surface-primary-light dark:bg-surface-primary-dark"
                                >
                                    <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-primary-muted-light dark:bg-surface-primary-muted-dark">
                                        <Monicon
                                            name="ic:outline-explore"
                                            size={24}
                                            color={iconColor}
                                        />
                                    </View>
                                    <Headline className="flex-1 text-content-primary-light dark:text-content-primary-dark">
                                        {__("Explorer nos programmes")}
                                    </Headline>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Mes programmes */}
                        <View className="mb-6 flex-1 gap-3 px-5">
                            <View className="flex-row items-center justify-between">
                                <Caption className="text-content-secondary-light dark:text-content-secondary-dark">
                                    {__("Mes programmes")}
                                </Caption>
                            </View>

                            <MyPrograms onChangeScrollEnable={setScrollEnabled} />
                        </View>
                    </AutoScrollView>
                </AutoScrollProvider>

            </SafeAreaView>
        </View>
    );
}
