import { ActionSheet } from "@/components/ui/action-sheet/action-sheet";
import { ActionSheetOption } from "@/components/ui/action-sheet/types";
import { CarretIcon, CrossCircleIcon } from "@/components/ui/icons";
import { useTranslation } from "@/i18n";
import React, { useCallback, useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export function MuscleFilter() {
    const { __ } = useTranslation();
    const [selectedMuscle, setSelectedMuscle] = useState<string>("");

    const isSelected = !!selectedMuscle;
    const baseTextColor = isSelected ? "text-base-primary-light dark:text-base-primary-dark" : "text-content-primary-light dark:text-content-primary-dark";
    const baseIconColor = isSelected ? "text-base-primary-light dark:text-base-primary-dark" : "text-content-primary-light dark:text-content-primary-dark";
    
    const toggleMuscle = useCallback((muscle: string) => {
        setSelectedMuscle(prev => prev === muscle ? "" : muscle);
    }, []);

    const SelectionCircle = useCallback(({ name }: { name: string }) => (
        <View className={
            `w-4 h-4 rounded-full border border-content-primary-light dark:border-content-primary-dark 
            ${selectedMuscle === name ? "bg-content-primary-light dark:bg-content-primary-dark" : "bg-transparent"}
        `} />
    ), [selectedMuscle]);

    const muscleOptions: ActionSheetOption[] = useMemo(() => ([
        {
            category: __("Haut du corps"),
            label: "Pectoraux",
            icon: <SelectionCircle name="Pectoraux" />,
            onPress: () => toggleMuscle("Pectoraux"),
        },
        {
            category: __("Haut du corps"),
            label: "Triceps",
            icon: <SelectionCircle name="Triceps" />,
            onPress: () => toggleMuscle("Triceps"),
        },
        {
            category: __("Haut du corps"),
            label: "Biceps",
            icon: <SelectionCircle name="Biceps" />,
            onPress: () => toggleMuscle("Biceps"),
        },
        {
            category: __("Haut du corps"),
            label: "Épaules",
            icon: <SelectionCircle name="Épaules" />,
            onPress: () => toggleMuscle("Épaules"),
        },
        {
            category: __("Haut du corps"),
            label: "Dorsaux",
            icon: <SelectionCircle name="Dorsaux" />,
            onPress: () => toggleMuscle("Dorsaux"),
        },
        {
            category: __("Bas du corps"),
            label: "Quadriceps",
            icon: <SelectionCircle name="Quadriceps" />,
            onPress: () => toggleMuscle("Quadriceps"),
        },
        {
            category: __("Bas du corps"),
            label: "Ischio-jambiers",
            icon: <SelectionCircle name="Ischio-jambiers" />,
            onPress: () => toggleMuscle("Ischio-jambiers"),
        },
        {
            category: __("Bas du corps"),
            label: "Fessiers",
            icon: <SelectionCircle name="Fessiers" />,
            onPress: () => toggleMuscle("Fessiers"),
        },
        {
            category: __("Bas du corps"),
            label: "Mollets",
            icon: <SelectionCircle name="Mollets" />,
            onPress: () => toggleMuscle("Mollets"),
        },
        {
            category: __("Haut du corps"),
            label: "Abdominaux",
            icon: <SelectionCircle name="Abdominaux" />,
            onPress: () => toggleMuscle("Abdominaux"),
        },
    ]), [toggleMuscle, SelectionCircle]);

    return (
        <ActionSheet options={muscleOptions}>
            <TouchableOpacity 
                className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl 
                            ${isSelected ? "bg-base-primary-dark dark:bg-base-primary-light" : "bg-surface-primary-muted-light dark:bg-surface-primary-muted-dark"}`}
            >
                {isSelected && (
                    <CrossCircleIcon 
                        size={18} 
                        className="text-base-primary-light dark:text-base-primary-dark" 
                    />
                )}
                        
                <Text className={`font-sfpro-medium ${baseTextColor}`}>
                    {isSelected ? __(selectedMuscle) : __("Tous les muscles")}
                </Text>

                {!isSelected && (
                    <CarretIcon 
                        size={18} 
                        className={`-ml-1 ${baseIconColor}`} 
                    />
                )}
            </TouchableOpacity>
        </ActionSheet>
    );
}