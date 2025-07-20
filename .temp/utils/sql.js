"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSqlScript = runSqlScript;
const child_process_1 = require("child_process");
const util_1 = require("util");
const logger_1 = __importDefault(require("./logger"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
async function runSqlScript(command, stepName) {
    try {
        const { stdout, stderr } = await execAsync(command);
        if (stderr) {
            logger_1.default.debug(`${stepName} generated an error stream:\n${stderr}`);
            process.exit(1);
        }
        logger_1.default.info(`${stepName} finished successfully.`);
        if (stdout) {
            logger_1.default.debug(`${stepName} generated an output stream:\n${stdout}`);
        }
    }
    catch (error) {
        logger_1.default.error(`${stepName} failed: ${error}`);
        process.exit(1);
    }
}
//# sourceMappingURL=sql.js.map