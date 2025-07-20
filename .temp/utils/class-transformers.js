"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromJSON = exports.toJSON = exports.fromDatetime = exports.toDatetime = exports.fromTime = exports.toTime = exports.fromDay = exports.toDay = exports.fromInteger = exports.toInteger = void 0;
const toInteger = function (value, options = { isNullable: false, isUndefinable: false }) {
    if (options.hasOwnProperty("isNullable") &&
        options.isNullable &&
        value === null) {
        return null;
    }
    if (options.hasOwnProperty("isUndefinable") &&
        options.isUndefinable &&
        value === undefined) {
        return undefined;
    }
    if (typeof value !== "number") {
        throw new Error(`Expected a numeric value. Received: ${value}`);
    }
    return Math.round(value);
};
exports.toInteger = toInteger;
const fromInteger = function (value, options = { isNullable: false, isUndefinable: false }) {
    if (options.hasOwnProperty("isNullable") &&
        options.isNullable &&
        value === null) {
        return null;
    }
    if (options.hasOwnProperty("isUndefinable") &&
        options.isUndefinable &&
        value === undefined) {
        return undefined;
    }
    if (typeof value !== "number") {
        throw new Error(`Expected a numeric value. Received: ${value}`);
    }
    return Math.round(value);
};
exports.fromInteger = fromInteger;
const toDay = function (value, options = { isNullable: false, isUndefinable: false }) {
    if (options.hasOwnProperty("isNullable") &&
        options.isNullable &&
        value === null) {
        return null;
    }
    if (options.hasOwnProperty("isUndefinable") &&
        options.isUndefinable &&
        value === undefined) {
        return undefined;
    }
    if (value instanceof Date) {
        return value;
    }
    const isDayPattern = /\d{4}-\d{2}-\d{2}/;
    if (typeof value !== "string" || !isDayPattern.test(value)) {
        throw new Error(`Expected a day value. Received: ${value}`);
    }
    const dayValue = value.match(isDayPattern)?.[0];
    const [year, month, day] = dayValue.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
};
exports.toDay = toDay;
const fromDay = function (value, options = { isNullable: false, isUndefinable: false }) {
    if (options.hasOwnProperty("isNullable") &&
        options.isNullable &&
        value === null) {
        return null;
    }
    if (options.hasOwnProperty("isUndefinable") &&
        options.isUndefinable &&
        value === undefined) {
        return undefined;
    }
    if (!(value instanceof Date)) {
        throw new Error(`Expected an Date instance. Recieved: ${value}`);
    }
    const year = value.getUTCFullYear().toString();
    const month = (value.getUTCMonth() + 1).toString().padStart(2, "0");
    const day = value.getUTCDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
};
exports.fromDay = fromDay;
const toTime = function (value, options = { isNullable: false, isUndefinable: false }) {
    if (options.hasOwnProperty("isNullable") &&
        options.isNullable &&
        value === null) {
        return null;
    }
    if (options.hasOwnProperty("isUndefinable") &&
        options.isUndefinable &&
        value === undefined) {
        return undefined;
    }
    if (value instanceof Date) {
        return value;
    }
    const isTimePattern = /\d{2}:\d{2}:\d{2}\.\d{3,6}/;
    if (typeof value !== "string" || !isTimePattern.test(value)) {
        throw new Error(`Expected a time value. Received: ${value}`);
    }
    const timeValue = value.match(isTimePattern)?.[0];
    const [hours, minutes, seconds] = timeValue.split(":").map(Number);
    const milliseconds = (seconds - Math.floor(seconds)) * 1000;
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCFullYear(), now.getUTCDay(), hours, minutes, Math.floor(seconds), milliseconds));
};
exports.toTime = toTime;
const fromTime = function (value, options = { isNullable: false, isUndefinable: false }) {
    if (options.hasOwnProperty("isNullable") &&
        options.isNullable &&
        value === null) {
        return null;
    }
    if (options.hasOwnProperty("isUndefinable") &&
        options.isUndefinable &&
        value === undefined) {
        return undefined;
    }
    if (!(value instanceof Date)) {
        throw new Error(`Expected an Date instance. Recieved: ${value}`);
    }
    const hours = value.getUTCHours().toString().padStart(2, "0");
    const minutes = value.getUTCMinutes().toString().padStart(2, "0");
    const seconds = value.getUTCSeconds().toString().padStart(2, "0");
    const milliseconds = (value.getUTCMilliseconds() / 1000).toPrecision(6);
    return `${hours}:${minutes}:${seconds}.${milliseconds.slice(2, milliseconds.length)}`;
};
exports.fromTime = fromTime;
const toDatetime = function (value, options = { isNullable: false, isUndefinable: false }) {
    if (options.hasOwnProperty("isNullable") &&
        options.isNullable &&
        value === null) {
        return null;
    }
    if (options.hasOwnProperty("isUndefinable") &&
        options.isUndefinable &&
        value === undefined) {
        return undefined;
    }
    if (value instanceof Date) {
        return value;
    }
    const isDatetimePattern = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{6}/;
    if (typeof value !== "string" || !isDatetimePattern.test(value)) {
        throw new Error(`Expected a day value. Received: ${value}`);
    }
    const datetimeValue = value.match(isDatetimePattern)?.[0];
    const splittedDatetime = datetimeValue.split(" ");
    const [year, month, day] = splittedDatetime[0].split("-").map(Number);
    const [hours, minutes, seconds] = splittedDatetime[1].split(":").map(Number);
    const milliseconds = (seconds - Math.floor(seconds)) * 1000;
    return new Date(Date.UTC(year, month - 1, day, hours, minutes, Math.floor(seconds), milliseconds));
};
exports.toDatetime = toDatetime;
const fromDatetime = function (value, options = { isNullable: false, isUndefinable: false }) {
    if (options.hasOwnProperty("isNullable") &&
        options.isNullable &&
        value === null) {
        return null;
    }
    if (options.hasOwnProperty("isUndefinable") &&
        options.isUndefinable &&
        value === undefined) {
        return undefined;
    }
    if (!(value instanceof Date)) {
        throw new Error(`Expected an Date instance. Recieved: ${value}`);
    }
    const year = value.getUTCFullYear().toString();
    const month = (value.getUTCMonth() + 1).toString().padStart(2, "0");
    const day = value.getUTCDate().toString().padStart(2, "0");
    const hours = value.getUTCHours().toString().padStart(2, "0");
    const minutes = value.getUTCMinutes().toString().padStart(2, "0");
    const seconds = value.getUTCSeconds().toString().padStart(2, "0");
    const milliseconds = (value.getUTCMilliseconds() / 1000).toPrecision(6);
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds.slice(2, milliseconds.length)}`;
};
exports.fromDatetime = fromDatetime;
const toJSON = function (value, options = { isNullable: false, isUndefinable: false }) {
    if (options.hasOwnProperty("isNullable") &&
        options.isNullable &&
        value === null) {
        return null;
    }
    if (options.hasOwnProperty("isUndefinable") &&
        options.isUndefinable &&
        value === undefined) {
        return undefined;
    }
    if (typeof value !== "string") {
        throw new Error(`Expected an JSON instance. Recieved: ${value}`);
    }
    return JSON.parse(value);
};
exports.toJSON = toJSON;
const fromJSON = function (value, options = { isNullable: false, isUndefinable: false }) {
    if (options.hasOwnProperty("isNullable") &&
        options.isNullable &&
        value === null) {
        return null;
    }
    if (options.hasOwnProperty("isUndefinable") &&
        options.isUndefinable &&
        value === undefined) {
        return undefined;
    }
    return JSON.stringify(value);
};
exports.fromJSON = fromJSON;
//# sourceMappingURL=class-transformers.js.map