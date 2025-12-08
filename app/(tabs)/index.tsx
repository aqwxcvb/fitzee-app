import { ChooseProgramModal } from "@/components/features/home/choose-program-modal";
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
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const iconColor = isDark ? "#ffffff" : "#1c1c1e";
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [scrollEnabled, setScrollEnabled] = useState(true);

    const lightCardShadow = {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 1,
    };

    const darkCardShadow = {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 16,
        elevation: 4,
    };

    const cardShadowStyle = isDark ? darkCardShadow : lightCardShadow;
    return (
        <View className="flex-1 bg-base-light dark:bg-base-dark">
            <LinearGradient
                colors={
                    isDark
                        ? ["#2B2B2D", "#1A1A1C", "#111113"]
                        : ["#ffffff", "#f9f9fb", "#f2f2f6"]
                }
                locations={[0, 0.6, 1]}
                style={{ position: "absolute", left: 0, right: 0, top: 0, height: 300 }}
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
                            <View className="flex-row justify-between items-center mb-6">
                                <BigTitle>
                                    {__("Entraînement")}
                                </BigTitle>
                                <View className="w-10 h-10 rounded-full overflow-hidden">
                                    <Image
                                        source={{ uri: "https://randomuser.me/api/portraits/men/32.jpg" }}
                                        className="w-full h-full"
                                    />
                                </View>
                            </View>
                        </View>

                        <View className="px-5 gap-3 mb-9">
                            <Caption>
                                {__("Démarrage rapide")}
                            </Caption>

                            <TouchableOpacity
                                activeOpacity={0.98}
                                className="w-full bg-surface-light dark:bg-surface-dark rounded-[14px] flex-row items-center p-4 gap-4"
                                style={cardShadowStyle}
                            >
                                <View className="w-10 h-10 rounded-full bg-accent-light dark:bg-accent-dark items-center justify-center">
                                    <Monicon
                                        name="solar:add-circle-linear"
                                        size={24}
                                        color={iconColor}
                                    />
                                </View>
                                <Headline className="flex-1">
                                    {__("Démarrer une séance improvisée")}
                                </Headline>
                            </TouchableOpacity>
                        </View>

                        <View className="px-5 gap-3 mb-10">
                            <Caption>
                                {__("Séances")}
                            </Caption>

                            <View className="gap-3">
                                <TouchableOpacity
                                    activeOpacity={0.98}
                                    onPress={() => setIsModalVisible(true)}
                                    className="w-full bg-surface-light dark:bg-surface-dark rounded-[14px] flex-row items-center p-4 gap-4"
                                    style={cardShadowStyle}
                                >
                                    <View className="w-10 h-10 rounded-full bg-accent-light dark:bg-accent-dark items-center justify-center">
                                        <Monicon
                                            name="solar:clipboard-linear"
                                            size={24}
                                            color={iconColor}
                                        />
                                    </View>
                                    <Headline className="flex-1">
                                        {__("Nouvelle séance")}
                                    </Headline>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    activeOpacity={0.98}
                                    className="w-full bg-surface-light dark:bg-surface-dark rounded-[14px] flex-row items-center p-4 gap-4"
                                    style={cardShadowStyle}
                                >
                                    <View className="w-10 h-10 rounded-full bg-accent-light dark:bg-accent-dark items-center justify-center">
                                        <Monicon
                                            name="solar:magnifer-linear"
                                            size={24}
                                            color={iconColor}
                                        />
                                    </View>
                                    <Headline className="flex-1">
                                        {__("Explorer les séances")}
                                    </Headline>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="flex-1 px-5 gap-3 mb-6">
                            <View className="flex-row justify-between items-center">
                                <Caption>
                                    {__("Mes programmes")}
                                </Caption>
                            </View>

                            <MyPrograms onChangeScrollEnable={setScrollEnabled} />
                        </View>
                    </AutoScrollView>
                </AutoScrollProvider>

                <ChooseProgramModal
                    visible={isModalVisible}
                    onClose={() => setIsModalVisible(false)}
                    onConfirm={(programId) => {
                        setIsModalVisible(false);
                        router.push("/builder");
                    }}
                />
            </SafeAreaView>
        </View>
    );
}
