/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    darkMode: "class",
    theme: {
        extend: {
            /*colors: {
                // Couleurs de base
                background: {
                    light: "#fafafa",
                    dark: "#010101",
                },
                foreground: {
                    light: "#3a3a3c",
                    dark: "#ffffff",
                },
                // Couleurs primaires
                primary: {
                    DEFAULT: "#ff3b30",
                    foreground: "#ffffff",
                },
                // Couleurs secondaires
                secondary: {
                    light: "#f2f2f5",
                    dark: "#2c2c2f",
                    "foreground-light": "#3a3a3c",
                    "foreground-dark": "#ffffff",
                },
                // Couleurs muted
                muted: {
                    light: "#fafafa",
                    dark: "#010101",
                    foreground: "#8e8e93",
                },
                // Couleurs accent
                accent: {
                    light: "#ffffff",
                    dark: "#1c1c1e",
                    "foreground-light": "#3a3a3c",
                    "foreground-dark": "#ffffff",
                },
                // Couleurs destructive
                destructive: {
                    DEFAULT: "#ff3b30",
                    foreground: "#ffffff",
                },
                // Couleurs card
                card: {
                    light: "#f7f7fa",
                    dark: "#1c1c1e",
                    "dark-alt": "#252527",
                    "foreground-light": "#3a3a3c",
                    "foreground-dark": "#ffffff",
                },
                // Couleurs popover
                popover: {
                    light: "#ffffff",
                    dark: "#1c1c1e",
                    "foreground-light": "#3a3a3c",
                    "foreground-dark": "#ffffff",
                },
                // Couleurs border
                border: {
                    light: "#f5f5f7",
                    dark: "#202022",
                },
                // Couleurs input
                input: {
                    light: "#ffffff",
                    dark: "#1c1c1e",
                },
                // Couleurs ring
                ring: {
                    light: "#000000",
                    dark: "#000000",
                },
            },*/
            colors: {
                primary: "#ff3b30",
                
                base: {
                    light: "#f2f2f7",
                    dark: "#010101",
                },

                foreground: {
                    light: "#ffffff",
                    dark: "#1a1a1c",
                },
            
                surface: {
                    light: "#fafafa",
                    dark: "#1c1c1e",

                    modal: {
                        light: "#f7f7fa",
                        dark: "#252527",
                    },
                },
            
                accent: {
                    light: "#e5e5ea",
                    dark: "#2c2c2f",
                },

                stroke: {
                    primary: "#ff3b2f",

                    light: "#e5e5ea",
                    dark: "#2C2C2E",
                },

                content: {
                    "DEFAULT": "#8e8e93",
                }
            },
            fontFamily: {
                "geist": ["Geist-Regular"],
                "geist-medium": ["Geist-Medium"],
                "geist-semibold": ["Geist-SemiBold"],
                "geist-bold": ["Geist-Bold"],
                "playfair": ["PlayfairDisplay-Regular"],
                "jetbrains": ["JetBrainsMono-Regular"],
            },
        },
    },
    plugins: [],
};
