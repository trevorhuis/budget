import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.resolve(__dirname, "..");
const sourcePath = path.join(apiDir, "src", "schemas.ts");
const outputDir = path.resolve(apiDir, "..", "web", "src", "lib");
const outputPath = path.join(outputDir, "schemas.ts");

const header = `// AUTO-GENERATED FILE. DO NOT EDIT.
// Source: api/src/schemas.ts
// Run \`pnpm --dir api build:schemas\` to regenerate.

`;

const source = await readFile(sourcePath, "utf8");

await mkdir(outputDir, { recursive: true });
await writeFile(outputPath, `${header}${source}`, "utf8");
