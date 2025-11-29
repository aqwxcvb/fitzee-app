import React from "react";
import { NativeModules, Platform } from "react-native";
import { en } from "./locales/en";
import { fr } from "./locales/fr";

export type Language = "fr" | "en";
const translations: Record<Language, Record<string, string>> = { fr, en };

interface TranslationContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    __: (text: string) => string;
}

const TranslationContext = React.createContext<TranslationContextType | undefined>(undefined);

function getSystemLanguage(): Language {
    try {
        const locale = Platform.OS === "ios"
            ? NativeModules.SettingsManager?.settings?.AppleLocale || NativeModules.SettingsManager?.settings?.AppleLanguages?.[0]
            : NativeModules.I18nManager?.localeIdentifier;
        
        if (locale) {
            if (locale.startsWith("fr")) {
                return "fr";
            }
            
            if (locale.startsWith("en")) {
                return "en";
            }
        }
    } catch (e) { }

    return "fr";
}

export function TranslationProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = React.useState<Language>(getSystemLanguage());
    
    const __ = (text: string): string => {
        if (language === "fr") {
            return text;
        }
        
        const currentLangTranslations = translations[language];
        if (currentLangTranslations && currentLangTranslations[text]) {
            return currentLangTranslations[text];
        }
        
        const englishTranslations = translations.en;
        if (englishTranslations && englishTranslations[text]) {
            return englishTranslations[text];
        }
        
        return text;
    };

    return React.createElement(TranslationContext.Provider, { value: { language, setLanguage, __ } }, children);
}

export function useTranslation() {
    const context = React.useContext(TranslationContext);
    
    if (context === undefined) {
        throw new Error("useTranslation must be used within a TranslationProvider");
    }

    return context;
}
