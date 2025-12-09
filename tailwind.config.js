/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}"
    ],
    presets: [require("nativewind/preset")],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                base: {
                    primary: {
                        dark: "#000000",
                        light: "#f2f2f6"
                    },
                    secondary: {
                        dark: "#1c1c1e",
                        light: "#f2f2f7"
                    }
                },
                surface: {
                    primary: {
                        dark: "#1c1c1e",
                        light: "#ffffff",

                        muted: {
                            dark: "#2A2A2C",
                            light: "#F2F2F7"
                        }
                    },
                    secondary: {
                        dark: "#2c2c2e",
                        light: "#ffffff",

                        muted: {
                            dark: "#3A3A3C",
                            light: "#EDEDED"
                        }
                    }
                },
                content: {
                    primary: {
                        dark: "#ffffff",
                        light: "#000000"
                    },
                    secondary: {
                        dark: "#8d8d93",
                        light: "#85858b"
                    },
                    tertiary: {
                        dark: "#9e9ea5",
                        light: "#8a8a8e"
                    }
                },
                accent: {
                    primary: {
                        dark: "#0A84FF",
                        light: "#007AFF",
                        
                        muted: {
                            dark: "#5CA3FF",
                            light: "#5CA3FF"
                        },

                        label: {
                            dark: "#ffffff",
                            light: "#ffffff"
                        },

                        stroke: {
                            dark: "#0A84FF",
                            light: "#007AFF",

                            muted: {
                                dark: "#5CA3FF",
                                light: "#5CA3FF"
                            }
                        }
                    },
                },
                icon: {
                    primary: "#ffffff",
                    secondary: {
                        dark: "#59595d",
                        light: "#c5c5c6"
                    },
                    tertiary: {
                        dark: "#656569",
                        light: "#c5c5c7"
                    }
                },
                selector: {
                    active: {
                        dark: "#5a5a5f",
                        light: "#ffffff"
                    },
                    inactive: {
                        dark: "#1c1c1f",
                        light: "#eeeeef"
                    },
                    divider: {
                        dark: "#3d3d41",
                        light: "#d6d6d9"
                    },
                    content: {
                        dark: "#ffffff",
                        light: "#000000"
                    }
                },
                stroke: {
                    primary: {
                        dark: "#717176",
                        light: "#9d9da0"
                    },
                    secondary: {
                        dark: "#444447",
                        light: "#d1d1d6"
                    }
                }
            },
            fontFamily: {
                "sfpro-light": ["SFPro-Light"],
                "sfpro-regular": ["SFPro-Regular"],
                "sfpro-medium": ["SFPro-Medium"],
                "sfpro-semibold": ["SFPro-Semibold"],
                "sfpro-bold": ["SFPro-Bold"],
                "sfpro-display-bold": ["SFPro-Display-Bold"],
                playfair: ["PlayfairDisplay-Regular"],
                jetbrains: ["JetBrainsMono-Regular"]
            }
        }
    },
    plugins: []
};
