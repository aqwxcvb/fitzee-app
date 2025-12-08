const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const { withMonicon } = require("@monicon/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Add vendor folder to watchFolders for local packages
config.watchFolders = [__dirname, `${__dirname}/vendor`];

// Configure resolver to handle TypeScript files in node_modules
// Metro should handle .ts/.tsx by default, but ensure they're in sourceExts
const defaultSourceExts = config.resolver?.sourceExts || [];
const resolverConfig = {
    ...config.resolver,
};

if (!defaultSourceExts.includes("ts")) {
    resolverConfig.sourceExts = [...defaultSourceExts, "ts", "tsx"];
}

// Force Metro to use React and React Native from the main project
// This prevents "Invalid hook call" errors from multiple React instances
resolverConfig.extraNodeModules = {
    ...resolverConfig.extraNodeModules,
    react: path.resolve(__dirname, "node_modules/react"),
    "react-native": path.resolve(__dirname, "node_modules/react-native"),
};

// Block node_modules resolution in vendor packages to prevent duplicate React instances
resolverConfig.blockList = [
    ...(resolverConfig.blockList || []),
    /vendor\/.*\/node_modules\/react\/.*/,
    /vendor\/.*\/node_modules\/react-native\/.*/,
];

config.resolver = resolverConfig;

// Apply NativeWind first
const nativeWindConfig = withNativeWind(config, { input: "./global.css" });

// Then apply Monicon
const configWithMonicon = withMonicon(nativeWindConfig, {
    icons: [
        "solar:minus-circle-outline",

        // Quick Start & New folder
        "solar:add-circle-linear",
        "solar:add-circle-bold",
        // Routines
        "solar:clipboard-outline",
        "solar:magnifer-linear",
        // Folders
        "solar:folder-bold",
        // Tab bar
        "solar:home-2-bold",
        "solar:home-angle-2-linear",
        "solar:dumbbell-large-minimalistic-linear",
        "solar:dumbbell-large-minimalistic-bold",
        "solar:chart-square-linear",
        "solar:chart-square-bold",
        "solar:user-linear",
        "solar:user-bold",
        "solar:dumbbell-small-outline",
        "solar:clipboard-linear",
        // Program Builder
        "solar:clipboard-list-outline",
        "solar:check-circle-bold",
        "solar:close-circle-bold",
        "solar:list-bold",

        "solar:alt-arrow-down-linear",
        "solar:alt-arrow-left-linear",
        "solar:filter-linear",
        "solar:folder-with-files-linear",
    ],
});

module.exports = configWithMonicon;
