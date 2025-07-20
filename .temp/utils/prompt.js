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
Object.defineProperty(exports, "__esModule", { value: true });
exports.rl = void 0;
exports.askQuestion = askQuestion;
exports.askQuestionWithHiddenInput = askQuestionWithHiddenInput;
const readline = __importStar(require("readline"));
exports.rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
// Helper function to ask a question and wait for user input
function askQuestion(question, defaultValue) {
    return new Promise((resolve) => {
        if (defaultValue) {
            question += ` (default: ${defaultValue})`;
        }
        question += ": ";
        exports.rl.question(question, resolve);
    });
}
// Helper function to ask a question and hides the user input
function askQuestionWithHiddenInput(question, defaultValue) {
    return new Promise((resolve) => {
        const stdin = process.stdin;
        const onData = (char) => {
            const key = char.toString();
            if (key === "\n" || key === "\r" || key === "\u0004") {
                stdin.off("data", onData);
            }
            else {
                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);
                process.stdout.write(question + "*".repeat(exports.rl.line.length));
            }
        };
        stdin.on("data", onData);
        if (defaultValue) {
            question += ` (default: ${defaultValue})`;
        }
        question += ": ";
        exports.rl.question(question, resolve);
    });
}
//# sourceMappingURL=prompt.js.map