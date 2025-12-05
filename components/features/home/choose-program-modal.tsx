import { BottomSheetModal } from "@/components/ui/bottom-sheet-modal";
import { Body, Headline, Title } from "@/components/ui/typography";
import { useTranslation } from "@/i18n";
import { Monicon } from "@monicon/native";
import React, { useState } from "react";
import {
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";

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
            <Title className="px-5 mb-2">
                {__("Choisis un programme")}
            </Title>

            <Body className="px-5 mb-6">
                {__("Sélectionne le programme où enregistrer cette nouvelle séance.")}
            </Body>

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
                    className="bg-primary-light dark:bg-primary-dark rounded-[14px] py-4 items-center justify-center"
                >
                    <Headline className="text-lg text-white font-sfpro-semibold">
                        {__("Confirmer")}
                    </Headline>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => closeWithAnimation?.()}
                    activeOpacity={0.7}
                    className="py-3.5 items-center justify-center"
                >
                    <Body className="text-lg text-content font-sfpro-medium">
                        {__("Annuler")}
                    </Body>
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
    const isDark = colorScheme === "dark";

    const cardShadowStyle = isDark
        ? {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.22,
              shadowRadius: 12,
              elevation: 3,
          }
        : {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 6,
              elevation: 0,
          };

    return (
        <TouchableOpacity
            onPress={onSelect}
            activeOpacity={0.7}
            className={`rounded-[14px] p-4 flex-row items-center gap-4 bg-surface-modal-light dark:bg-surface-modal-dark border-2 ${
                isSelected
                    ? "border-stroke-primary-light dark:border-stroke-primary-dark"
                    : "border-transparent"
            }`}
            style={cardShadowStyle}
        >
            <View
                className={`w-10 h-10 rounded-full items-center justify-center ${
                    isNew ? "bg-primary-light dark:bg-primary-dark" : "bg-accent-light dark:bg-accent-dark"
                }`}
            >
                <Monicon
                    name={program.icon}
                    size={24}
                    color={isNew ? "#ffffff" : isDark ? "#ffffff" : "#1c1c1e"}
                />
            </View>

            <View className="flex-1">
                <Headline className="line-clamp-1">
                    {program.name}
                </Headline>

                {!isNew && (
                    <Body>
                        {program.workouts} {__("séances")}
                    </Body>
                )}
            </View>
        </TouchableOpacity>
    );
}
