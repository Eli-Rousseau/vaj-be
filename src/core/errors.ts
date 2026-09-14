export class AuthenticationError extends Error {}
export class AuthorizationError extends Error {}
export class BadRequestError extends Error {}
export class ConfigError extends Error {}
export class CustomTypeError extends Error {}
export class DatabaseError extends Error {}
export class DataInconsistencyError extends Error {}
export class HTTPError extends Error {
    constructor(status: number, statusText: string) {
        super(`Failed HTTP request: ${status.toString()} ${statusText}`)
    }
}