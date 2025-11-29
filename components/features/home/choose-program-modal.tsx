import { BottomSheetModal } from "@/components/ui/bottom-sheet-modal";
import { useTranslation } from "@/i18n";
import { Monicon } from "@monicon/native";
import React, { useState } from "react";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";

interface Program {
    id: string;
    name: string;
    workouts: number;
    icon: string;
    color: string;
}

interface ChooseProgramModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (programId: string) => void;
}

const PROGRAMS: Program[] = [
    {
        id: "strength",
        name: "Full Body",
        workouts: 3,
        icon: "solar:dumbbell-small-outline",
        color: "#FFFFFF",
    },
];

interface ModalContentProps {
    closeWithAnimation?: () => void;
    onConfirm: (programId: string) => void;
}

function ModalContent({ closeWithAnimation, onConfirm }: ModalContentProps) {
    const { __ } = useTranslation();
    const [selectedProgram, setSelectedProgram] = useState<string>("strength");

    const handleConfirm = () => {
        onConfirm(selectedProgram);
        closeWithAnimation?.();
    };

    return (
        <>
            <Text className="text-3xl tracking-tight px-5 mb-2 text-black dark:text-white font-geist-bold">
                {__("Choisis un programme")}
            </Text>

            <Text className="text-base leading-snug text-content px-5 mb-6 font-geist">
                {__("Sélectionne le programme où enregistrer cette nouvelle séance.")}
            </Text>

            <View className="px-5 gap-3">
                {PROGRAMS.map((program) => (
                    <ProgramCard
                        key={program.id}
                        program={program}
                        isSelected={selectedProgram === program.id}
                        onSelect={() => setSelectedProgram(program.id)}
                    />
                ))}

                <ProgramCard
                    program={{
                        id: "new",
                        name: __("Créer un nouveau programme"),
                        workouts: 0,
                        icon: "solar:add-circle-bold",
                        color: "#ff3b30",
                    }}
                    isSelected={selectedProgram === "new"}
                    onSelect={() => setSelectedProgram("new")}
                    isNew
                />
            </View>

            <View className="px-5 mt-7 gap-2">
                <TouchableOpacity
                    onPress={handleConfirm}
                    activeOpacity={0.8}
                    className="bg-primary rounded-2xl py-4 items-center justify-center"
                >
                    <Text className="text-lg text-white font-geist-semibold">
                        {__("Confirmer")}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => closeWithAnimation?.()}
                    activeOpacity={0.7}
                    className="py-3.5 items-center justify-center"
                >
                    <Text className="text-lg text-content font-geist-medium">
                        {__("Annuler")}
                    </Text>
                </TouchableOpacity>
            </View>
        </>
    );
}

export function ChooseProgramModal({
    visible,
    onClose,
    onConfirm,
}: ChooseProgramModalProps) {
    return (
        <BottomSheetModal visible={visible} onClose={onClose}>
            <ModalContent onConfirm={onConfirm} />
        </BottomSheetModal>
    );
}

function ProgramCard({
    program,
    isSelected,
    onSelect,
    isNew = false,
}: {
    program: Program;
    isSelected: boolean;
    onSelect: () => void;
    isNew?: boolean;
}) {
    const { __ } = useTranslation();
    const colorScheme = useColorScheme();

    return (
        <TouchableOpacity
            onPress={onSelect}
            activeOpacity={0.7}
            className={`rounded-2xl p-4 flex-row items-center gap-4 bg-surface-modal-light dark:bg-surface-modal-dark border ${isSelected ? `border-stroke-primary` : `border-stroke-light dark:border-stroke-dark`}`}
        >
            <View className={`w-12 h-12 rounded-full items-center justify-center ${isNew ? "bg-primary" : "bg-accent-light dark:bg-accent-dark"}`}>
                <Monicon
                    name={program.icon}
                    size={26}
                    color={isNew ? "white" : colorScheme === "dark" ? "white" : "black"}
                />
            </View>

            <View className="flex-1">
                <Text className="line-clamp-1 text-lg text-black dark:text-white font-geist-semibold">
                    {program.name}
                </Text>
                {!isNew && (
                    <Text className="text-sm text-content font-geist">
                        {program.workouts} {__("séances")}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
}
