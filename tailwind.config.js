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
            colors: {
                primary: {
                    light: "#007AFF",
                    dark: "#0A84FF",
                },

                base: {
                    light: "#f2f2f6",
                    dark: "#111113",
                },

                foreground: {
                    light: "#f2f2f6",
                    dark: "#1c1c1e", 
                },

                surface: {
                    light: "#ffffff",
                    dark: "#1c1c1e",

                    modal: {
                        light: "#f7f7fa",
                        dark: "#252527",
                    },
                },

                accent: {
                    light: "#efeff0",
                    dark: "#2c2c2f",
                },

                stroke: {
                    primary: {
                        light: "#007AFF",
                        dark: "#0A84FF",
                    },
                },

                content: {
                    light: "#636366",
                    dark: "#8e8e93",

                    strong: "#1c1c1e", 
                    inverse: "#f2f2f7",
                },
            },
            fontFamily: {
                "sfpro-light": ["SFPro-Light"],
                "sfpro-regular": ["SFPro-Regular"],
                "sfpro-medium": ["SFPro-Medium"],
                "sfpro-semibold": ["SFPro-Semibold"],
                "sfpro-bold": ["SFPro-Bold"],
                "sfpro-display-bold": ["SFPro-Display-Bold"],
                playfair: ["PlayfairDisplay-Regular"],
                jetbrains: ["JetBrainsMono-Regular"],
            },
        },
    },
    plugins: [],
};
