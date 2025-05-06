import ts from "typescript";
/**
 * Read the type field from the package.json file in the current working directory.
 * @returns "commonjs" if the type field is not present or is "commonjs", otherwise "module".
 */
export declare const getType: () => "module" | "commonjs";
type _CompileOptions = Pick<ts.CompilerOptions, "allowJs" | "declaration" | "sourceMap" | "emitDeclarationOnly" | "jsx" | "jsxFactory" | "jsxImportSource" | "esModuleInterop" | "target" | "declarationMap" | "lib">;
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
/**
 * Merge the given files into a single file.
 * @param indexFile The main file to be merged.
 * @param otherFiles The other files to be merged.
 * @returns A promise that resolves when the merge is complete.
 */
export declare const mergeFiles: ({ indexFile, otherFiles, }: MergeFilesOptions) => Promise<string>;
/**
 * Remove all files in the given directory.
 * @param dir The directory to clean.
 */
export declare const cleanDir: (dir: string) => Promise<void>;
export declare function compile({ entry, format, outDir, options, clean, }: CompileOptions): Promise<void>;
export {};
