import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, renameSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { libraryRoot, nativeRoot, serviceBinary } from "./gpui.mjs";

const UI_RUNTIME = "ui-runtime.js";
const libraryCrate = resolve(nativeRoot, "..", "..", "react-native-gpui", "rust");

function run(command, args, cwd) {
    const result = spawnSync(command, args, { cwd, stdio: "inherit" });
    if (result.error) throw new Error(`could not start ${command}: ${result.error.message}`);
    if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}`);
}

function stage(source, target) {
    const staging = `${target}.staging`;
    copyFileSync(source, staging);
    renameSync(staging, target);
}

try {
    run("cargo", ["build", "--release"], nativeRoot);
    const library = libraryRoot();
    const uiRuntimeBuilder = join(library, "scripts", "build-ui-runtime.mjs");
    if (existsSync(uiRuntimeBuilder)) run("bun", [uiRuntimeBuilder], library);
    const uiRuntime = join(library, "dist", UI_RUNTIME);
    if (!existsSync(uiRuntime)) throw new Error(`${uiRuntime} is missing. Build the library (npm run build in its ts/ folder).`);
    stage(uiRuntime, join(dirname(serviceBinary), UI_RUNTIME));
    if (process.platform === "darwin") {
        execFileSync("codesign", ["--force", "--sign", "-", "--entitlements", join(libraryCrate, "jsc.entitlements"), serviceBinary]);
    }
    console.log(serviceBinary);
} catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
}
