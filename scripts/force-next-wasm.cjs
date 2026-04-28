const fs = require("fs");
const path = require("path");
const originalReadFile = fs.promises.readFile.bind(fs.promises);
const originalMkdir = fs.promises.mkdir.bind(fs.promises);
const originalWriteFile = fs.promises.writeFile.bind(fs.promises);

try {
  Object.defineProperty(process.versions, "webcontainer", {
    configurable: true,
    value: process.versions.webcontainer || "1"
  });
} catch {
  process.versions.webcontainer = process.versions.webcontainer || "1";
}

const distServerDir = path.join(process.cwd(), ".next", "server");
const distStaticCssDir = path.join(process.cwd(), ".next", "static", "css");
const interceptionManifestPath = path.join(distServerDir, "interception-route-rewrite-manifest.js");
const pagesManifestPath = path.join(distServerDir, "pages-manifest.json");
const appLayoutCssAliasPath = path.join(distStaticCssDir, "app", "layout.css");

function syncDevCssAlias() {
  try {
    if (!fs.existsSync(distStaticCssDir)) {
      return;
    }

    const cssFiles = fs
      .readdirSync(distStaticCssDir)
      .filter((fileName) => fileName.endsWith(".css"))
      .sort();

    const sourceFileName = cssFiles.find((fileName) => fileName !== "app");
    if (!sourceFileName) {
      return;
    }

    const sourcePath = path.join(distStaticCssDir, sourceFileName);
    if (!fs.existsSync(sourcePath)) {
      return;
    }

    fs.mkdirSync(path.dirname(appLayoutCssAliasPath), { recursive: true });

    const sourceStat = fs.statSync(sourcePath);
    const aliasStat = fs.existsSync(appLayoutCssAliasPath) ? fs.statSync(appLayoutCssAliasPath) : null;

    if (aliasStat && aliasStat.size === sourceStat.size && aliasStat.mtimeMs >= sourceStat.mtimeMs) {
      return;
    }

    fs.copyFileSync(sourcePath, appLayoutCssAliasPath);
  } catch {
    // Ignore alias sync failures in local dev; Next will retry on the next poll.
  }
}

try {
  fs.mkdirSync(distServerDir, { recursive: true });

  if (!fs.existsSync(interceptionManifestPath)) {
    fs.writeFileSync(interceptionManifestPath, "self.__INTERCEPTION_ROUTE_REWRITE_MANIFEST=[];");
  }

  if (!fs.existsSync(pagesManifestPath)) {
    fs.writeFileSync(pagesManifestPath, "{}");
  }
} catch {
  // Ignore filesystem prep failures here; targeted read fallback below handles the same manifests.
}

syncDevCssAlias();
setInterval(syncDevCssAlias, 500).unref();

try {
  const downloadSwc = require("next/dist/lib/download-swc");

  downloadSwc.downloadWasmSwc = async function downloadWasmSwc(_version, wasmDirectory, variant = "nodejs") {
    const pkgName = `@next/swc-wasm-${variant}`;
    const sourceDir = path.dirname(require.resolve(`${pkgName}/package.json`));
    const targetDir = path.join(wasmDirectory, pkgName);

    if (fs.existsSync(targetDir)) {
      return;
    }

    fs.mkdirSync(targetDir, { recursive: true });

    for (const fileName of ["package.json", "README.md", "wasm.d.ts", "wasm.js", "wasm_bg.wasm"]) {
      const sourceFile = path.join(sourceDir, fileName);
      if (!fs.existsSync(sourceFile)) {
        continue;
      }
      fs.copyFileSync(sourceFile, path.join(targetDir, fileName));
    }
  };
} catch {
  // Next isn't being loaded in this process, so there's nothing to patch.
}

fs.promises.readFile = async function patchedReadFile(filePath, ...args) {
  try {
    return await originalReadFile(filePath, ...args);
  } catch (error) {
    const normalizedPath = typeof filePath === "string" ? filePath : filePath?.toString?.() ?? "";
    const needsPagesManifest =
      error?.code === "ENOENT" && normalizedPath.endsWith(`${path.sep}.next${path.sep}server${path.sep}pages-manifest.json`);

    const needsInterceptionManifest =
      error?.code === "ENOENT" &&
      normalizedPath.endsWith(`${path.sep}.next${path.sep}server${path.sep}interception-route-rewrite-manifest.js`);

    if (!needsPagesManifest && !needsInterceptionManifest) {
      throw error;
    }

    await originalMkdir(path.dirname(normalizedPath), { recursive: true });
    const fallbackContents = needsPagesManifest ? "{}" : "self.__INTERCEPTION_ROUTE_REWRITE_MANIFEST=[];";
    await originalWriteFile(normalizedPath, fallbackContents);
    return Buffer.from(fallbackContents);
  }
};
