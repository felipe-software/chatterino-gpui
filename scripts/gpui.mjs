import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const LIBRARY = "@felipe-software/react-native-gpui";
export const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function libraryRoot() {
    for (let dir = appRoot; dir !== dirname(dir); dir = dirname(dir)) {
        const candidate = join(dir, "node_modules", LIBRARY);
        if (existsSync(join(candidate, "package.json"))) return candidate;
    }
    throw new Error(`${LIBRARY} is not installed. Run \`bun install\`, or see "Using an unreleased build of the library" in README.md.`);
}

function cliPath(root) {
    const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
    const bin = typeof manifest.bin === "string" ? manifest.bin : manifest.bin?.rngpui;
    if (!bin) throw new Error(`${LIBRARY} ${manifest.version} has no rngpui CLI`);
    return join(root, bin);
}

export function bundleApp(entry, out, { development = false } = {}) {
    const devFlag = development ? ["--dev"] : [];
    const result = spawnSync("bun", [cliPath(libraryRoot()), "bundle", entry, out, ...devFlag], { stdio: "inherit" });
    if (result.error) throw new Error(`could not start bun: ${result.error.message}`);
    if (result.status !== 0) throw new Error(`rngpui bundle failed with exit code ${result.status}`);
    return out;
}

export async function resolveService(explicitPath) {
    const resolver = await import(pathToFileURL(join(libraryRoot(), "scripts", "service-binary.mjs")).href);
    const env = explicitPath ? { ...process.env, RNGPUI_SERVICE: explicitPath } : process.env;
    const { path, source } = resolver.resolveServiceBinary({ env });
    return { path, source, env: resolver.uiRuntimeEnv(path, { env }) };
}
