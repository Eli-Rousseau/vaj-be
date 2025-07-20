"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRequestOnMainRouteHandlerWrapper = exports.putRequestOnMainRouteHandlerWrapper = exports.postRequestOnMainRouteHandlerWrapper = exports.getRequestOnMainRouteHandlerWrapper = exports.deleteRequestOnParamRouteHandlerWrapper = exports.putRequestOnParamRouteHandlerWrapper = exports.postRequestOnParamRouteHandlerWrapper = exports.getRequestOnParamRouteHandlerWrapper = exports.getPgClientHandler = exports.routParametersHandler = void 0;
const class_transformer_1 = require("class-transformer");
const server_1 = require("./server");
const database_1 = require("../utils/database");
const routParametersHandler = function (req, res, next, value) {
    req.id = value;
    next();
};
exports.routParametersHandler = routParametersHandler;
const getPgClientHandler = function (req, res, next) {
    try {
        req.pgClient = (0, database_1.getPgClient)();
    }
    catch (error) {
        res
            .status(500)
            .json({
            error: `Encountered an error when getting the postgresql client: ${error}`,
        })
            .end();
        return;
    }
    next();
};
exports.getPgClientHandler = getPgClientHandler;
const getRequestOnParamRouteHandlerWrapper = function (clsName, cls) {
    const getRequestOnParamRouteHandler = async function (req, res) {
        // Retrieve the record reference
        const reference = req.id;
        // Format the database query
        const querySelectRecord = `
    SELECT *
    FROM shop.${clsName}
    WHERE reference = '${reference}';    
        `;
        // Run the query on the database
        let row;
        try {
            const queryResult = await req.pgClient.query(querySelectRecord);
            row = queryResult.rows[0];
        }
        catch (error) {
            res
                .status(400)
                .json({
                error: `Failed to execute the query on the database: ${error}`,
                query: querySelectRecord,
            })
                .end();
            return;
        }
        // Verify whether a record could be returned
        if (!row) {
            res
                .status(400)
                .json({
                error: `No record found for identifier: ${reference}`,
                query: querySelectRecord,
            })
                .end();
            return;
        }
        // Convert record into instance
        const record = (0, class_transformer_1.plainToInstance)(cls, row);
        // Reconvert the instance to output
        const output = (0, class_transformer_1.instanceToPlain)(record);
        // Finish the response
        res.status(200).json(output).end();
        return;
    };
    return getRequestOnParamRouteHandler;
};
exports.getRequestOnParamRouteHandlerWrapper = getRequestOnParamRouteHandlerWrapper;
const postRequestOnParamRouteHandlerWrapper = function (clsName, cls) {
    const postRequestOnParamRouteHandler = async function (req, res) {
        res
            .status(400)
            .json({
            error: "Invalid request: unable to insert based on identifier.",
        })
            .end();
        return;
    };
    return postRequestOnParamRouteHandler;
};
exports.postRequestOnParamRouteHandlerWrapper = postRequestOnParamRouteHandlerWrapper;
const putRequestOnParamRouteHandlerWrapper = function (clsName, cls) {
    const putRequestOnParamRouteHandler = async function (req, res) {
        // Retrieve the record reference
        const reference = req.id;
        // Retrieve the request body
        const body = req.body;
        // Verify whether the inputs is an object
        if (typeof body !== "object" || body === null || Array.isArray(body)) {
            res
                .status(400)
                .json({
                error: `Expected body with a single object. Received: ${body}`,
            })
                .end();
            return;
        }
        // Check whether this is a enum class
        let isEnumClass;
        try {
            const enumInstance = (0, class_transformer_1.plainToInstance)(cls, { reference: "check" });
            const fields = Object.keys(enumInstance);
            isEnumClass = fields.length === 1;
        }
        catch {
            isEnumClass = false;
        }
        if (isEnumClass) {
            res
                .status(400)
                .json({
                error: `Invalid request: The transformer class ${clsName} has only one field, which is interpreted as an enum. PUT requests are not supported for enum-based endpoints.`,
            })
                .end();
            return;
        }
        // Convert plain objects into instances
        let instance;
        try {
            instance = (0, class_transformer_1.plainToInstance)(cls, body);
        }
        catch (error) {
            res
                .status(400)
                .json({
                error: `Failed to tranform the plain object into an class instance: ${error}`,
                record: body,
            })
                .end();
            return;
        }
        // Filter out the autogenerated fields to exclude
        let fields = Object.keys(instance);
        fields = fields.filter((field) => !server_1.GLOBAL_AUTOGENERATED_FIELDS.includes(field) &&
            !["reference"].includes(field));
        // Reconvert the instances to plain
        const plain = (0, class_transformer_1.instanceToPlain)(instance);
        // Retrieve all the record values
        const recordValues = fields.map((field) => {
            return `${field} = ${plain[field] === null
                ? "NULL"
                : typeof plain[field] === "string"
                    ? `'${plain[field]}'`
                    : plain[field]}`;
        });
        // Format the database query
        const queryUpdateRecord = `
    UPDATE shop.${clsName}
    SET ${recordValues.join(",\n")}
    WHERE reference = ${reference}
    RETURNING *;    
        `;
        // Run the query on the database
        let row;
        try {
            const queryResult = await req.pgClient.query(queryUpdateRecord);
            row = queryResult.rows[0];
        }
        catch (error) {
            res
                .status(400)
                .json({
                error: `Failed to execute the query on the database: ${error}`,
                query: queryUpdateRecord,
            })
                .end();
            return;
        }
        // Verify whether a record could be returned
        if (!row) {
            res
                .status(400)
                .json({
                error: `No record found for identifier: ${reference}`,
                query: queryUpdateRecord,
            })
                .end();
            return;
        }
        // Convert record into instance
        const record = (0, class_transformer_1.plainToInstance)(cls, row);
        // Reconvert the instance to output
        const output = (0, class_transformer_1.instanceToPlain)(record);
        // Finish the response
        res.status(200).json(output).end();
        return;
    };
    return putRequestOnParamRouteHandler;
};
exports.putRequestOnParamRouteHandlerWrapper = putRequestOnParamRouteHandlerWrapper;
const deleteRequestOnParamRouteHandlerWrapper = function (clsName, cls) {
    const deleteRequestOnParamRouteHandler = async function (req, res) {
        // Retrieve the record reference
        const reference = req.id;
        // Format the database query
        const queryDeleteInstance = `
    DELETE FROM shop.${clsName}
    WHERE reference = '${reference}'
    RETURNING *;    
        `;
        // Run the query on the database
        let row;
        try {
            const queryResult = await req.pgClient.query(queryDeleteInstance);
            row = queryResult.rows[0];
        }
        catch (error) {
            res
                .status(400)
                .json({
                error: `Failed to execute the query on the database: ${error}`,
                query: queryDeleteInstance,
            })
                .end();
            return;
        }
        // Verify whether a record could be returned
        if (!row) {
            res
                .status(400)
                .json({
                error: `No record found for identifier: ${reference}`,
                query: queryDeleteInstance,
            })
                .end();
            return;
        }
        // Convert record into instance
        const record = (0, class_transformer_1.plainToInstance)(cls, row);
        // Reconvert the instance to output
        const output = (0, class_transformer_1.instanceToPlain)(record);
        // Finish the response
        res.status(200).json(output).end();
        return;
    };
    return deleteRequestOnParamRouteHandler;
};
exports.deleteRequestOnParamRouteHandlerWrapper = deleteRequestOnParamRouteHandlerWrapper;
const getRequestOnMainRouteHandlerWrapper = function (clsName, cls) {
    const getRequestOnMainRouteHandler = async function (req, res) {
        // Retrieve the query params
        const limit = req.limit;
        const offset = req.offset;
        // Format the database query
        const querySelectRecords = `
        SELECT *
        FROM shop.${clsName}
        ${limit ? "LIMIT " + limit + (offset ? " OFFSET " + offset : "") : ""};
            `;
        // Run the query on the database
        let rows = [];
        try {
            const queryResult = await req.pgClient.query(querySelectRecords);
            rows = queryResult.rows;
        }
        catch (error) {
            res
                .status(400)
                .json({
                error: `Failed to execute the query on the database: ${error}`,
                query: querySelectRecords,
            })
                .end();
            return;
        }
        // Verify whether one or more records could be returned
        if (!rows) {
            res
                .status(400)
                .json({
                error: "No records could be retrieved upon execution of the database query.",
                query: querySelectRecords,
            })
                .end();
            return;
        }
        // Convert records into instances
        let records = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const record = (0, class_transformer_1.plainToInstance)(cls, row);
            records.push(record);
        }
        // Reconvert the instances to outputs
        let outputs = [];
        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            const output = (0, class_transformer_1.instanceToPlain)(record);
            outputs.push(output);
        }
        // Finish the response
        res.status(200).json(outputs).end();
        return;
    };
    return getRequestOnMainRouteHandler;
};
exports.getRequestOnMainRouteHandlerWrapper = getRequestOnMainRouteHandlerWrapper;
const postRequestOnMainRouteHandlerWrapper = function (clsName, cls) {
    const postRequestOnMainRouteHandler = async function (req, res) {
        // Retrieve the request body
        let body = req.body;
        // Verify whether the inputs is an array
        const inputIsArray = Array.isArray(body);
        const inputIsObject = typeof body === "object";
        if (!inputIsArray && !inputIsObject) {
            res
                .status(400)
                .json({
                error: `Expected body with a single instance or an array of ${clsName}. Received: ${body}`,
            })
                .end();
            return;
        }
        // Transform object into a list of objects
        if (!inputIsArray) {
            body = [body];
        }
        // Convert plain objects into instances
        let instances = [];
        for (let i = 0; i < body.length; i++) {
            const plain = body[i];
            try {
                const instance = (0, class_transformer_1.plainToInstance)(cls, plain);
                instances.push(instance);
            }
            catch (error) {
                res
                    .status(400)
                    .json({
                    error: `Failed to tranform the plain object into an class instance: ${error}`,
                    record: plain,
                })
                    .end();
                return;
            }
        }
        // Filter out the autogenerated fields to exclude
        let fields = Object.keys(instances[0]);
        fields = fields.filter((field) => (field === "reference" && fields.length === 1) ||
            (field !== "reference" && !server_1.GLOBAL_AUTOGENERATED_FIELDS.includes(field)));
        // Reconvert the instances to plain
        let plains = [];
        for (let i = 0; i < instances.length; i++) {
            const instance = instances[i];
            const plain = (0, class_transformer_1.instanceToPlain)(instance);
            plains.push(plain);
        }
        // Retrieve all the record values
        let valuesRecords = [];
        for (let i = 0; i < plains.length; i++) {
            const plain = plains[i];
            const valuesRecord = fields.map((field) => plain[field] === undefined
                ? "DEFAULT"
                : plain[field] === null
                    ? "NULL"
                    : typeof plain[field] === "string"
                        ? `'${plain[field]}'`
                        : plain[field]);
            valuesRecords.push(`(${valuesRecord.join(", ")})`);
        }
        // Format the database query
        const queryInsertInstances = `
    INSERT INTO shop.${clsName} (${fields.join(", ")})
    VALUES
    ${valuesRecords.join(",\n")}
    RETURNING *;
        `;
        // Run the query on the database
        let rows = [];
        try {
            const queryResult = await req.pgClient.query(queryInsertInstances);
            rows = queryResult.rows;
        }
        catch (error) {
            res
                .status(400)
                .json({
                error: `Failed to execute the query on the database: ${error}`,
                query: queryInsertInstances,
            })
                .end();
            return;
        }
        // Verify whether one or more records could be returned
        if (!rows) {
            res
                .status(400)
                .json({
                error: "No records could be retrieved upon execution of the database query.",
                query: queryInsertInstances,
            })
                .end();
            return;
        }
        // Convert records into instances
        let records = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const record = (0, class_transformer_1.plainToInstance)(cls, row);
            records.push(record);
        }
        // Reconvert the instances to outputs
        let outputs = [];
        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            const output = (0, class_transformer_1.instanceToPlain)(record);
            outputs.push(output);
        }
        // Retransform list of objects into an single object
        if (!inputIsArray) {
            outputs = outputs[0];
        }
        // Finish the response
        res.status(200).json(outputs).end();
        return;
    };
    return postRequestOnMainRouteHandler;
};
exports.postRequestOnMainRouteHandlerWrapper = postRequestOnMainRouteHandlerWrapper;
const putRequestOnMainRouteHandlerWrapper = function (clsName, cls) {
    const putRequestOnMainRouteHandler = async function (req, res) {
        // Retrieve the request body
        let body = req.body;
        // Verify whether the inputs is an array
        const inputIsArray = Array.isArray(body);
        const inputIsObject = typeof body === "object";
        if (!inputIsArray && !inputIsObject) {
            res
                .status(400)
                .json({
                error: `Expected body with a single instance or an array of ${clsName}. Received: ${body}`,
            })
                .end();
            return;
        }
        // Check whether this is a enum class
        let isEnumClass;
        try {
            const enumInstance = (0, class_transformer_1.plainToInstance)(cls, { reference: "check" });
            const fields = Object.keys(enumInstance);
            isEnumClass = fields.length === 1;
        }
        catch {
            isEnumClass = false;
        }
        if (isEnumClass) {
            res
                .status(400)
                .json({
                error: `Invalid request: The transformer class ${clsName} has only one field, which is interpreted as an enum. PUT requests are not supported for enum-based endpoints.`,
            })
                .end();
            return;
        }
        // Transform object into a list of objects
        if (!inputIsArray) {
            body = [body];
        }
        // Convert plain objects into instances
        let instances = [];
        for (let i = 0; i < body.length; i++) {
            const plain = body[i];
            try {
                const instance = (0, class_transformer_1.plainToInstance)(cls, plain);
                instances.push(instance);
            }
            catch (error) {
                res
                    .status(400)
                    .json({
                    error: `Failed to tranform the plain object into an class instance: ${error}`,
                    record: plain,
                })
                    .end();
                return;
            }
        }
        // Filter out the autogenerated fields to exclude
        let fields = Object.keys(instances[0]);
        fields = fields.filter((field) => !server_1.GLOBAL_AUTOGENERATED_FIELDS.includes(field));
        // Reconvert the instances to plain
        let plains = [];
        for (let i = 0; i < instances.length; i++) {
            const instance = instances[i];
            const plain = (0, class_transformer_1.instanceToPlain)(instance);
            plains.push(plain);
        }
        // Retrieve all the record values
        let valuesRecords = [];
        for (let i = 0; i < plains.length; i++) {
            const plain = plains[i];
            const valuesRecord = fields.map((field) => plain[field] === null
                ? "NULL"
                : typeof plain[field] === "string"
                    ? `'${plain[field]}'`
                    : plain[field]);
            valuesRecords.push(`(${valuesRecord.join(", ")})`);
        }
        // Retrieve all the fields to update
        const updateFields = [];
        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            if (field === "reference") {
                continue;
            }
            updateFields.push(`${field} = temp_updates.${field}`);
        }
        // Format the database queries
        const queryDropTemporaryTable = `
    DROP TABLE IF EXISTS temp_updates;
        `;
        const queryCreateTemporaryTable = `
    CREATE TEMP TABLE temp_updates 
    (LIKE shop."${clsName}" INCLUDING DEFAULTS INCLUDING CONSTRAINTS);
        `;
        const queryInsertinstances = `
    INSERT INTO temp_updates (${fields.join(", ")})
    VALUES
    ${valuesRecords.join(",\n")};    
        `;
        const queryUpdateInstances = `
    UPDATE shop."${clsName}"
    SET
    ${updateFields.join(",\n")}
    FROM temp_updates
    WHERE "${clsName}".reference = temp_updates.reference
    RETURNING "${clsName}".*;
        `;
        // Run the query on the database
        let rows = [];
        try {
            await req.pgClient.query(queryDropTemporaryTable);
            await req.pgClient.query(queryCreateTemporaryTable);
            await req.pgClient.query(queryInsertinstances);
            const queryResult = await req.pgClient.query(queryUpdateInstances);
            rows = queryResult.rows;
        }
        catch (error) {
            res
                .status(400)
                .json({
                error: `Failed to execute the query on the database: ${error}`,
                query: queryUpdateInstances,
            })
                .end();
            return;
        }
        // Verify whether one or more records could be returned
        if (!rows) {
            res
                .status(400)
                .json({
                error: "No records could be retrieved upon execution of the database query.",
                query: queryUpdateInstances,
            })
                .end();
            return;
        }
        // Convert records into instances
        let records = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const record = (0, class_transformer_1.plainToInstance)(cls, row);
            records.push(record);
        }
        // Reconvert the instances to outputs
        let outputs = [];
        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            const output = (0, class_transformer_1.instanceToPlain)(record);
            outputs.push(output);
        }
        // Retransform list of objects into an single object
        if (!inputIsArray) {
            outputs = outputs[0];
        }
        // Finish the response
        res.status(200).json(outputs).end();
        return;
    };
    return putRequestOnMainRouteHandler;
};
exports.putRequestOnMainRouteHandlerWrapper = putRequestOnMainRouteHandlerWrapper;
const deleteRequestOnMainRouteHandlerWrapper = function (clsName, cls) {
    const deleteRequestOnMainRouteHandler = async function (req, res) {
        // Retrieve the request body
        let body = req.body;
        // Verify whether the inputs is an array
        const inputIsArray = Array.isArray(body);
        const inputIsObject = typeof body === "object";
        if (!inputIsArray && !inputIsObject) {
            res
                .status(400)
                .json({
                error: `Expected body with a single instance or an array of ${clsName}. Received: ${body}`,
            })
                .end();
            return;
        }
        // Transform object into a list of objects
        if (!inputIsArray) {
            body = [body];
        }
        // Convert plain objects into instances
        let instances = [];
        for (let i = 0; i < body.length; i++) {
            const plain = body[i];
            try {
                const instance = (0, class_transformer_1.plainToInstance)(cls, plain);
                instances.push(instance);
            }
            catch (error) {
                res
                    .status(400)
                    .json({
                    error: `Failed to tranform the plain object into an class instance: ${error}`,
                    record: plain,
                })
                    .end();
                return;
            }
        }
        // Filter out the autogenerated fields to exclude
        let fields = Object.keys(instances[0]);
        fields = fields.filter((field) => !server_1.GLOBAL_AUTOGENERATED_FIELDS.includes(field));
        // Reconvert the instances to plain
        let plains = [];
        for (let i = 0; i < instances.length; i++) {
            const instance = instances[i];
            const plain = (0, class_transformer_1.instanceToPlain)(instance);
            plains.push(plain);
        }
        // Retrieve all the record references
        let referencesRecords = [];
        for (let i = 0; i < plains.length; i++) {
            const plain = plains[i];
            const referenceRecord = plain["reference"];
            referencesRecords.push(`'${referenceRecord}'`);
        }
        // Format the database query
        const queryDeleteInstances = `
    DELETE FROM shop.${clsName}
    WHERE reference IN (${referencesRecords.join(", ")})
    RETURNING *;    
        `;
        // Run the query on the database
        let rows = [];
        try {
            const queryResult = await req.pgClient.query(queryDeleteInstances);
            rows = queryResult.rows;
        }
        catch (error) {
            res
                .status(400)
                .json({
                error: `Failed to execute the query on the database: ${error}`,
                query: queryDeleteInstances,
            })
                .end();
            return;
        }
        // Verify whether one or more records could be returned
        if (!rows) {
            res
                .status(400)
                .json({
                error: "No records could be retrieved upon execution of the database query.",
                query: queryDeleteInstances,
            })
                .end();
            return;
        }
        // Convert records into instances
        let records = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const record = (0, class_transformer_1.plainToInstance)(cls, row);
            records.push(record);
        }
        // Reconvert the instances to outputs
        let outputs = [];
        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            const output = (0, class_transformer_1.instanceToPlain)(record);
            outputs.push(output);
        }
        // Retransform list of objects into an single object
        if (!inputIsArray) {
            outputs = outputs[0];
        }
        // Finish the response
        res.status(200).json(outputs).end();
        return;
    };
    return deleteRequestOnMainRouteHandler;
};
exports.deleteRequestOnMainRouteHandlerWrapper = deleteRequestOnMainRouteHandlerWrapper;
//# sourceMappingURL=request-handlers.js.map