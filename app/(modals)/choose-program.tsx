import { Body, Headline, Title } from "@/components/ui/typography";
import { useTranslation } from "@/i18n";
import { useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";

const ChooseProgram = () => {
	const { __ } = useTranslation();
    const router = useRouter();

    const handleConfirm = () => {
        router.dismissTo("/(stacks)/program-builder");
    };

    const handleCancel = () => {
        router.dismiss();
    };

    return (
        <View className="py-6 bg-surface-primary-light dark:bg-surface-primary-dark">
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
        </View>
    );
}

export default ChooseProgram;