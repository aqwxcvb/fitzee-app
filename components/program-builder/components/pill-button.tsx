import { ActionSheetOption } from "@/components/ui/action-sheet";
import { ActionSheet } from "@/components/ui/action-sheet/action-sheet";
import { CarretIcon, PlusFilledIcon, PlusIcon } from "@/components/ui/icons";
import { TouchableOpacity, View } from "react-native";

type PillButtonProps = {
    onScrollToTop: () => void;
}

export function PillButton({ onScrollToTop }: PillButtonProps) {
    const plusOptions: ActionSheetOption[] = [
        { 
            label: "Créer un exercice personnalisé", 
            icon: <PlusFilledIcon size={24} className="text-accent-primary-light dark:text-accent-primary-dark" />, 
            onPress: () => console.log("Créer un exercice personnalisé"),
        },
    ];
    return (
            <View className="absolute bottom-8 right-6">
                <View className="flex-row rounded-full bg-accent-primary-light dark:bg-accent-primary-dark shadow-lg overflow-hidden">
                    <TouchableOpacity
                        onPress={onScrollToTop}
                        className="w-16 h-16 items-center justify-center"
                    >
                        <CarretIcon size={22} strokeWidth={2} className="text-accent-primary-label-light dark:text-accent-primary-label-dark rotate-180" />
                    </TouchableOpacity>

                    <View className="w-[1px] h-1/2 self-center bg-accent-primary-stroke-muted-light dark:bg-accent-primary-stroke-muted-dark" />

                    <ActionSheet options={plusOptions}>
                        <TouchableOpacity className="w-16 h-16 items-center justify-center">
                            <PlusIcon size={22} strokeWidth={2} className="text-accent-primary-label-light dark:text-accent-primary-label-dark" />
                        </TouchableOpacity>
                    </ActionSheet>
                </View>
            </View>
    );
}
