"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Colors = {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",
    FgBlack: "\x1b[30m",
    FgRed: "\x1b[31m",
    FgGreen: "\x1b[32m",
    FgYellow: "\x1b[33m",
    FgBlue: "\x1b[34m",
    FgMagenta: "\x1b[35m",
    FgCyan: "\x1b[36m",
    FgWhite: "\x1b[37m",
    FgGray: "\x1b[90m",
    BgBlack: "\x1b[40m",
    BgRed: "\x1b[41m",
    BgGreen: "\x1b[42m",
    BgYellow: "\x1b[43m",
    BgBlue: "\x1b[44m",
    BgMagenta: "\x1b[45m",
    BgCyan: "\x1b[46m",
    BgWhite: "\x1b[47m",
    BgGray: "\x1b[100m",
};
// Static class that is used to display standardized info, warning, debug, and error logs
class Logger {
    static info(message) {
        console.log(`${Colors.FgBlue}[INFO]${Colors.Reset}\t${new Date().toLocaleString()}\t${message}`);
    }
    static warning(message) {
        console.warn(`${Colors.FgMagenta}[WARNING]${Colors.Reset}\t${new Date().toLocaleString()}\t${message}`);
    }
    static debug(message) {
        if (process.env.STAGE === "dev") {
            console.debug(`${Colors.FgGray}[DEBUG]${Colors.Reset}\t${new Date().toLocaleString()}\t${message}`);
        }
    }
    static error(message) {
        console.error(`${Colors.FgRed}[ERROR]${Colors.Reset}\t${new Date().toLocaleString()}\t${message}`);
    }
}
exports.default = Logger;
//# sourceMappingURL=logger.js.map