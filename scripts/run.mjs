import { spawn } from "node:child_process";
import { join } from "node:path";
import { appRoot, bundleApp, resolveService } from "./gpui.mjs";

const args = new Set(process.argv.slice(2));
const isDev = args.has("--dev");
const bundleOnly = args.has("--bundle-only");
const bundle = join(appRoot, ".build", "chatterino.js");

let service;
try {
    bundleApp(join(appRoot, "src", "main.tsx"), bundle, { development: isDev });
    if (bundleOnly) process.exit(0);
    service = await resolveService();
} catch (error) {
    console.error(error.message);
    process.exit(1);
}

console.error(`[chatterino] ${service.path} (${service.source})`);
const child = spawn(service.path, [], {
    stdio: "inherit",
    env: {
        ...process.env,
        ...service.env,
        RNGPUI_BUNDLE: bundle,
        RNGPUI_FONT_DIR: process.env.RNGPUI_FONT_DIR || join(appRoot, "assets", "fonts"),
        RNGPUI_APP_ID: process.env.RNGPUI_APP_ID || "com.chatterino.gpui",
        RNGPUI_APP_NAME: process.env.RNGPUI_APP_NAME || "Chatterino GPUI",
        RNGPUI_WINDOW_TITLE: process.env.RNGPUI_WINDOW_TITLE || "Chatterino (react-native-gpui)",
    },
});
child.on("exit", (code) => process.exit(code ?? 0));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
