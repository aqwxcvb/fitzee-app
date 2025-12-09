import { Body, Headline, Title } from "@/components/ui/typography";
import { useTranslation } from "@/i18n";
import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
    TouchableOpacity,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useColorScheme, View } from "react-native";

type ChooseProgramProps = {
    visible: boolean;
    onClose: () => void;
};

export function ChooseProgram({ visible, onClose }: ChooseProgramProps) {
    const { __ } = useTranslation();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const isDark = colorScheme === "dark";

    const backgroundStyle = useMemo(() => ({
        backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
    }), [isDark]);

    const handleIndicatorStyle = useMemo(() => ({
        backgroundColor: isDark ? "#48484A" : "#D1D1D6",
    }), [isDark]);

    useEffect(() => {
        const modal = bottomSheetModalRef.current;
        if(!modal) {
            return;
        }

        if(visible) {
            modal.present();
        } else {
            modal.dismiss();
        }
    }, [visible]);

    const handleCancel = useCallback(() => onClose(), [onClose]);
    const handleDismiss = useCallback(() => onClose(), [onClose]);

    const handleConfirm = useCallback(() => {
        router.push("/(stacks)/program-builder");
        onClose();
    }, [router, onClose]);

    const renderBackdrop = useCallback((props: any) => (
        <BottomSheetBackdrop
            {...props}
            pressBehavior="close"
            appearsOnIndex={0}
            disappearsOnIndex={-1}
        />
    ), []);

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            onDismiss={handleDismiss}
            enablePanDownToClose
            backdropComponent={renderBackdrop}
            backgroundStyle={backgroundStyle}
            handleIndicatorStyle={handleIndicatorStyle}
        >
            <BottomSheetView className="pb-8 bg-surface-primary-light dark:bg-surface-primary-dark">
                <Title className="px-5 mb-2 text-content-primary-light dark:text-content-primary-dark">
                    {__("Choisis un programme")}
                </Title>

                <Body className="px-5 mb-6 text-content-secondary-light dark:text-content-secondary-dark">
                    {__("Sélectionne le programme où enregistrer cette nouvelle séance.")}
                </Body>

                <View className="px-5 mt-7 gap-2">
                    <TouchableOpacity
                        onPress={handleConfirm}
                        activeOpacity={0.8}
                        className="bg-accent-primary-light dark:bg-accent-primary-dark rounded-xl py-4 items-center justify-center"
                    >
                        <Headline className="text-lg !text-accent-primary-label-light dark:!text-accent-primary-label-dark font-sfpro-semibold">
                            {__("Confirmer")}
                        </Headline>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleCancel}
                        activeOpacity={0.7}
                        className="py-3.5 items-center justify-center"
                    >
                        <Body className="text-lg !text-content-secondary-light dark:!text-content-secondary-dark font-sfpro-medium">
                            {__("Annuler")}
                        </Body>
                    </TouchableOpacity>
                </View>
            </BottomSheetView>
        </BottomSheetModal>
    );
}