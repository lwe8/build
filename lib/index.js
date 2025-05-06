var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { existsSync, readFileSync } from "node:fs";
import { mkdir, readdir, unlink, writeFile, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import ts from "typescript";
//==
/**
 * Read the type field from the package.json file in the current working directory.
 * @returns "commonjs" if the type field is not present or is "commonjs", otherwise "module".
 */
export var getType = function () {
    var packageJsonFile = join(process.cwd(), "package.json");
    var packageData = readFileSync(packageJsonFile, "utf8");
    var data = JSON.parse(packageData);
    return !data.type || data.type === "commonjs" ? "commonjs" : "module";
};
var replaceFileExtensions = function (fileName, format) {
    var type = getType();
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
            fileName = "".concat(fileName.slice(0, -3), ".global.js");
            break;
    }
    return fileName;
};
// ======
/**
 * Merge the given files into a single file.
 * @param indexFile The main file to be merged.
 * @param otherFiles The other files to be merged.
 * @returns A promise that resolves when the merge is complete.
 */
export var mergeFiles = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var index_code, _indexCode, _otherCode, other_codes, _i, otherFiles_1, file, re, file_code, removedLines, _removedExport, removedExport;
    var _c;
    var indexFile = _b.indexFile, otherFiles = _b.otherFiles;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0: return [4 /*yield*/, readFile(indexFile.path, "utf8")];
            case 1:
                index_code = _d.sent();
                _indexCode = indexFile.lines
                    ? index_code.split("\n").slice(indexFile.lines).join("\n")
                    : index_code;
                if (!otherFiles) return [3 /*break*/, 6];
                other_codes = [];
                _i = 0, otherFiles_1 = otherFiles;
                _d.label = 2;
            case 2:
                if (!(_i < otherFiles_1.length)) return [3 /*break*/, 5];
                file = otherFiles_1[_i];
                re = (_c = file.removeExport) !== null && _c !== void 0 ? _c : false;
                return [4 /*yield*/, readFile(file.path, "utf8")];
            case 3:
                file_code = _d.sent();
                removedLines = file.lines
                    ? file_code.split("\n").slice(file.lines).join("\n")
                    : file_code;
                _removedExport = removedLines.replace(/export\s+/g, "").split("\n");
                removedExport = re ? _removedExport.join("\n") : removedLines;
                other_codes.push(removedExport);
                _d.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5:
                _otherCode = other_codes.join("\n");
                return [3 /*break*/, 7];
            case 6:
                _otherCode = "";
                _d.label = 7;
            case 7: return [2 /*return*/, "\n          ".concat(_otherCode, "\n          ").concat(_indexCode, "\n          ")];
        }
    });
}); };
// ==========
var getModuleType = function (format) {
    var moduleType = ts.ModuleKind.ES2015;
    if (format === "esm") {
        moduleType = ts.ModuleKind.ESNext;
    }
    else if (format === "cjs") {
        moduleType = ts.ModuleKind.CommonJS;
    }
    else if (format === "browser") {
        moduleType = ts.ModuleKind.ES2015;
    }
    return moduleType;
};
// =============
/**
 * Remove all files in the given directory.
 * @param dir The directory to clean.
 */
export var cleanDir = function (dir) { return __awaiter(void 0, void 0, void 0, function () {
    var files;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, readdir(dir)];
            case 1:
                files = _a.sent();
                return [4 /*yield*/, Promise.all(files.map(function (file) { return unlink(join(dir, file)); }))];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
// ===========
export function compile(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var fileNames, moduleType, compilerOptions, createdFiles, host, program, writeTasks;
        var _this = this;
        var entry = _b.entry, format = _b.format, _c = _b.outDir, outDir = _c === void 0 ? "./dist" : _c, _d = _b.options, options = _d === void 0 ? {} : _d, _e = _b.clean, clean = _e === void 0 ? false : _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    fileNames = Array.isArray(entry) ? entry : [entry];
                    moduleType = getModuleType(format);
                    compilerOptions = __assign({ module: moduleType, outDir: outDir }, options);
                    createdFiles = {};
                    host = ts.createCompilerHost(compilerOptions);
                    host.writeFile = function (fileName, contents) {
                        createdFiles[replaceFileExtensions(fileName, format)] = contents;
                    };
                    program = ts.createProgram(fileNames, compilerOptions, host);
                    program.emit();
                    writeTasks = Object.entries(createdFiles).map(function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                        var dir;
                        var outName = _b[0], contents = _b[1];
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    dir = dirname(outName);
                                    if (!(clean && existsSync(dir))) return [3 /*break*/, 2];
                                    return [4 /*yield*/, cleanDir(dir)];
                                case 1:
                                    _c.sent();
                                    _c.label = 2;
                                case 2:
                                    if (!!existsSync(dir)) return [3 /*break*/, 4];
                                    return [4 /*yield*/, mkdir(dir, { recursive: true })];
                                case 3:
                                    _c.sent();
                                    _c.label = 4;
                                case 4: return [2 /*return*/, writeFile(outName, contents)];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(writeTasks)];
                case 1:
                    _f.sent();
                    return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=index.js.map