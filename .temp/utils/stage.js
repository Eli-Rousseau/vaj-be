"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadStage = loadStage;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const logger_1 = __importDefault(require("./logger"));
var Stage;
(function (Stage) {
    Stage["dev"] = "dev";
    Stage["prod"] = "prod";
})(Stage || (Stage = {}));
// Async helper function for loading the environmental variables
function loadStage() {
    return new Promise((resolve, reject) => {
        // Determine the stage from the command arguments
        const stage = process.argv.includes("prod") ? Stage.prod : Stage.dev;
        // Saving the stage to process.env
        process.env["STAGE"] = stage;
        logger_1.default.info(`Loading the "${stage}" environmental variables.`);
        // Determine the root of the project
        const root = process.cwd();
        // Read the content of the root
        fs.readdir(root, (error, files) => {
            if (error) {
                logger_1.default.error(`Unable to read files from project root: ${error}`);
                return reject(error);
            }
            // Filter the relevant .env files
            const envFiles = files.filter((file) => {
                return file.includes(`${stage}`) && file.includes(".env");
            });
            // Initialize a variable map
            const variables = new Map();
            // Number of env files
            let filesLeft = envFiles.length;
            if (filesLeft === 0) {
                logger_1.default.warning(`No environment files found for stage '${stage}'.`);
                return resolve();
            }
            envFiles.forEach((fileName) => {
                const filePath = path.join(root, fileName);
                // Reading the variables from the file content
                fs.readFile(filePath, "utf-8", (error, data) => {
                    if (error) {
                        logger_1.default.error(`Could not read file ${fileName}: ${error}`);
                    }
                    else {
                        const lines = data.split(/\n/);
                        lines.forEach((line) => {
                            const match = line.match(/^([A-Z0-9_]+)=(.+)$/);
                            if (match) {
                                const key = match[1];
                                const value = match[2];
                                variables.set(key, value);
                            }
                        });
                    }
                    filesLeft--;
                    // Save the variables in the process.env
                    if (filesLeft === 0) {
                        variables.forEach((value, key) => {
                            process.env[key] = value;
                        });
                        logger_1.default.debug(`Loaded ${variables.size} environment variables.`);
                        resolve();
                    }
                });
            });
        });
    });
}
//# sourceMappingURL=stage.js.map