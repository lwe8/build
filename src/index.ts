import { existsSync, readFileSync } from "node:fs";
import { mkdir, readdir, unlink, writeFile, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import ts from "typescript";
//==
/**
 * Read the type field from the package.json file in the current working directory.
 * @returns "commonjs" if the type field is not present or is "commonjs", otherwise "module".
 */
export const getType = () => {
  const packageJsonFile = join(process.cwd(), "package.json");
  const packageData = readFileSync(packageJsonFile, "utf8");
  const data = JSON.parse(packageData);
  return !data.type || data.type === "commonjs" ? "commonjs" : "module";
};

const replaceFileExtensions = (
  fileName: string,
  format: "esm" | "cjs" | "browser"
) => {
  const type = getType();
  switch (format) {
    case "esm":
      fileName =
        type === "commonjs"
          ? fileName.replace(/.ts/, ".mts").replace(/.js/, ".mjs")
          : fileName;

      break;
    case "cjs":
      fileName =
        type === "module"
          ? fileName.replace(/.ts/, ".cts").replace(/.js/, ".cjs")
          : fileName;
      break;
    case "browser":
      fileName = `${fileName.slice(0, -3)}.global.js`;
      break;
  }
  return fileName;
};
//--
type _CompileOptions = Pick<
  ts.CompilerOptions,
  | "allowJs"
  | "declaration"
  | "sourceMap"
  | "emitDeclarationOnly"
  | "jsx"
  | "jsxFactory"
  | "jsxImportSource"
  | "esModuleInterop"
  | "target"
  | "declarationMap"
  | "lib"
>;
type Esm = {
  entry: string | string[];
  format: "esm";
  outDir?: string;
  clean?: boolean;
  options?: _CompileOptions;
};
type CommonJs = {
  entry: string | string[];
  format: "cjs";
  outDir?: string;
  clean?: boolean;
  options?: _CompileOptions;
};
type Browser = {
  entry: string | string[];
  format: "browser";
  outDir?: string;
  clean?: boolean;
  options?: {
    allowJs?: boolean | undefined;
    outDir?: string | undefined;
    sourceMap?: boolean | undefined;
    target?: ts.ScriptTarget | undefined;
  };
};
export type CompileOptions = Esm | CommonJs | Browser;
export type Format = "esm" | "cjs" | "browser";
//## Merge Files
type IndexFile = {
  /**
   * Entry file path content of this file will place at last position of mearged output file
   */
  path: string;
  /**
   * Number of lines at the tope of this file to remove.
   */
  lines?: number;
};

type OtherFile = {
  path: string;
  lines?: number;
  removeExport?: boolean;
};
export type MergeFilesOptions = {
  indexFile: IndexFile;
  otherFiles?: OtherFile[];
};
// ======
/**
 * Merge the given files into a single file.
 * @param indexFile The main file to be merged.
 * @param otherFiles The other files to be merged.
 * @returns A promise that resolves when the merge is complete.
 */
export const mergeFiles = async ({
  indexFile,
  otherFiles,
}: MergeFilesOptions) => {
  // const pn = dirname(outFilePath);
  // if (!existsSync(pn)) await mkdir(pn);
  const index_code = await readFile(indexFile.path, "utf8");
  const _indexCode = indexFile.lines
    ? index_code.split("\n").slice(indexFile.lines).join("\n")
    : index_code;
  let _otherCode: string;
  if (otherFiles) {
    const other_codes: string[] = [];
    for (const file of otherFiles) {
      const re = file.removeExport ?? false;
      const file_code = await readFile(file.path, "utf8");
      const removedLines = file.lines
        ? file_code.split("\n").slice(file.lines).join("\n")
        : file_code;
      const _removedExport = removedLines.replace(/export\s+/g, "").split("\n");
      const removedExport = re ? _removedExport.join("\n") : removedLines;
      other_codes.push(removedExport);
    }
    _otherCode = other_codes.join("\n");
  } else {
    _otherCode = "";
  }
  return `
          ${_otherCode}
          ${_indexCode}
          `;
};
// ==========
const getModuleType = (format: Format) => {
  let moduleType: ts.ModuleKind = ts.ModuleKind.ES2015;
  if (format === "esm") {
    moduleType = ts.ModuleKind.ESNext;
  } else if (format === "cjs") {
    moduleType = ts.ModuleKind.CommonJS;
  } else if (format === "browser") {
    moduleType = ts.ModuleKind.ES2015;
  }
  return moduleType;
};
// =============
/**
 * Remove all files in the given directory.
 * @param dir The directory to clean.
 */
export const cleanDir = async (dir: string) => {
  const files = await readdir(dir);
  await Promise.all(files.map((file) => unlink(join(dir, file))));
};
// ===========
export async function compile({
  entry,
  format,
  outDir = "./dist",
  options = {},
  clean = false,
}: CompileOptions) {
  const fileNames = Array.isArray(entry) ? entry : [entry];
  const moduleType = getModuleType(format);
  const compilerOptions: ts.CompilerOptions = {
    module: moduleType,
    outDir,
    ...options,
  };

  const createdFiles: Record<string, string> = {};
  const host = ts.createCompilerHost(compilerOptions);

  host.writeFile = (fileName, contents) => {
    createdFiles[replaceFileExtensions(fileName, format)] = contents;
  };

  const program = ts.createProgram(fileNames, compilerOptions, host);
  program.emit();

  const writeTasks = Object.entries(createdFiles).map(
    async ([outName, contents]) => {
      const dir = dirname(outName);
      if (clean && existsSync(dir)) {
        await cleanDir(dir);
      }
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
      return writeFile(outName, contents);
    }
  );

  await Promise.all(writeTasks);
}
