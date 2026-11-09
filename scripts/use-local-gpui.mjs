import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { LIBRARY, appRoot } from "./gpui.mjs";

const source = process.argv[2];
if (!source || !existsSync(source)) {
    console.error("usage: bun scripts/use-local-gpui.mjs <directory with the library's .tgz files>");
    process.exit(1);
}

function tarballManifest(path) {
    const result = spawnSync("tar", ["-xzOf", path, "package/package.json"], { encoding: "utf8" });
    if (result.status !== 0) return undefined;
    return JSON.parse(result.stdout);
}

function compareVersions(a, b) {
    const partsA = a.split(/[.-]/).map(Number);
    const partsB = b.split(/[.-]/).map(Number);
    for (let index = 0; index < 3; index += 1) {
        if (partsA[index] !== partsB[index]) return partsA[index] - partsB[index];
    }
    return 0;
}

function matchesHost(manifest) {
    const osMatches = !manifest.os || manifest.os.includes(process.platform);
    const cpuMatches = !manifest.cpu || manifest.cpu.includes(process.arch);
    return osMatches && cpuMatches;
}

const dir = resolve(source);
const tarballs = readdirSync(dir)
    .filter((name) => name.endsWith(".tgz"))
    .map((name) => ({ path: join(dir, name), manifest: tarballManifest(join(dir, name)) }))
    .filter((tarball) => tarball.manifest?.name?.startsWith(LIBRARY));
const newestFirst = (list) => [...list].sort((a, b) => compareVersions(b.manifest.version, a.manifest.version));
const main = newestFirst(tarballs.filter((tarball) => tarball.manifest.name === LIBRARY))[0];
if (!main) {
    console.error(`no ${LIBRARY} tarball in ${dir}`);
    process.exit(1);
}
const platform = tarballs.find(
    (tarball) => tarball.manifest.name !== LIBRARY && tarball.manifest.version === main.manifest.version && matchesHost(tarball.manifest),
);
if (!platform) console.warn(`no ${LIBRARY}-${process.platform}-${process.arch} ${main.manifest.version} tarball in ${dir}; set RNGPUI_SERVICE to run the app`);

const local = [main, platform].filter(Boolean);
const overrides = Object.fromEntries(local.map((tarball) => [tarball.manifest.name, `file:${tarball.path}`]));
const manifest = JSON.parse(readFileSync(join(appRoot, "package.json"), "utf8"));
const staged = {
    name: manifest.name,
    private: true,
    dependencies: { ...manifest.dependencies, ...overrides },
    devDependencies: manifest.devDependencies,
    overrides,
};

const stage = join(appRoot, ".local-gpui");
rmSync(stage, { recursive: true, force: true });
mkdirSync(stage);
writeFileSync(join(stage, "package.json"), `${JSON.stringify(staged, null, 4)}\n`);
const install = spawnSync("bun", ["install", "--no-save"], { cwd: stage, stdio: "inherit" });
if (install.status !== 0) {
    rmSync(stage, { recursive: true, force: true });
    process.exit(install.status ?? 1);
}
rmSync(join(appRoot, "node_modules"), { recursive: true, force: true });
renameSync(join(stage, "node_modules"), join(appRoot, "node_modules"));
rmSync(stage, { recursive: true, force: true });
for (const tarball of local) console.log(`${tarball.manifest.name}@${tarball.manifest.version} from ${tarball.path}`);
