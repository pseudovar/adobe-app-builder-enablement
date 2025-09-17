/*
 * <license header>
 */

/* This file exposes some common utilities for your actions */

/**
 *
 * Returns a log ready string of the action input parameters.
 * The `Authorization` header content will be replaced by '<hidden>'.
 *
 * @param {object} params action input parameters.
 *
 * @returns {string}
 *
 */
function stringParameters(params) {
    // hide authorization token without overriding params
    let headers = params.__ow_headers || {}
    if (headers.authorization) {
        headers = { ...headers, authorization: '<hidden>' }
    }
    return JSON.stringify({ ...params, __ow_headers: headers })
}

/**
 *
 * Returns the list of missing keys giving an object and its required keys.
 * A parameter is missing if its value is undefined or ''.
 * A value of 0 or null is not considered as missing.
 *
 * @param {object} obj object to check.
 * @param {array} required list of required keys.
 *        Each element can be multi level deep using a '.' separator e.g. 'myRequiredObj.myRequiredKey'
 *
 * @returns {array}
 * @private
 */
function getMissingKeys(obj, required) {
    return required.filter((r) => {
        const splits = r.split('.')
        const last = splits[splits.length - 1]
        const traverse = splits.slice(0, -1).reduce((tObj, split) => {
            tObj = tObj[split] || {}
            return tObj
        }, obj)
        return traverse[last] === undefined || traverse[last] === '' // missing default params are empty string
    })
}

/**
 *
 * Returns the list of missing keys giving an object and its required keys.
 * A parameter is missing if its value is undefined or ''.
 * A value of 0 or null is not considered as missing.
 *
 * @param {object} params action input parameters.
 * @param {array} requiredHeaders list of required input headers.
 * @param {array} requiredParams list of required input parameters.
 *        Each element can be multi level deep using a '.' separator e.g. 'myRequiredObj.myRequiredKey'.
 *
 * @returns {string} if the return value is not null, then it holds an error message describing the missing inputs.
 *
 */
function checkMissingRequestInputs(
    params,
    requiredParams = [],
    requiredHeaders = []
) {
    let errorMessage = null

    // input headers are always lowercase
    requiredHeaders = requiredHeaders.map((h) => h.toLowerCase())
    // check for missing headers
    const missingHeaders = getMissingKeys(
        params.__ow_headers || {},
        requiredHeaders
    )
    if (missingHeaders.length > 0) {
        errorMessage = `missing header(s) '${missingHeaders}'`
    }

    // check for missing parameters
    const missingParams = getMissingKeys(params, requiredParams)
    if (missingParams.length > 0) {
        if (errorMessage) {
            errorMessage += ' and '
        } else {
            errorMessage = ''
        }
        errorMessage += `missing parameter(s) '${missingParams}'`
    }

    return errorMessage
}

/**
 *
 * Extracts the bearer token string from the Authorization header in the request parameters.
 *
 * @param {object} params action input parameters.
 *
 * @returns {string|undefined} the token string or undefined if not set in request headers.
 *
 */
function getBearerToken(params) {
    if (
        params.__ow_headers &&
        params.__ow_headers.authorization &&
        params.__ow_headers.authorization.startsWith('Bearer ')
    ) {
        return params.__ow_headers.authorization.substring('Bearer '.length)
    }
    return undefined
}
/**
 *
 * Returns an error response object and attempts to log.info the status code and error message
 *
 * @param {number} statusCode the error status code.
 *        e.g. 400
 * @param {string} message the error message.
 *        e.g. 'missing xyz parameter'
 * @param {*} [logger] an optional logger instance object with an `info` method
 *        e.g. `new require('@adobe/aio-sdk').Core.Logger('name')`
 *
 * @returns {object} the error object, ready to be returned from the action main's function.
 *
 */
function errorResponse(statusCode, message, logger) {
    if (logger && typeof logger.info === 'function') {
        logger.info(`${statusCode}: ${message}`)
    }
    return {
        statusCode,
        body: {
            error: message,
        },
    }
}

// State storage constants based on Adobe App Builder documentation
// Note: We're using @adobe/aio-lib-state v5.1.0 which doesn't yet support
// the async iterator pattern mentioned in the latest docs, so we use traditional methods
const STATE_CONSTANTS = {
    // TTL values in seconds
    TTL: {
        ONE_HOUR: 60 * 60, // 3600 seconds
        TEN_HOURS: 10 * 60 * 60, // 36000 seconds
        TWENTY_FOUR_HOURS: 24 * 60 * 60, // 86400 seconds
        SEVEN_DAYS: 7 * 24 * 60 * 60, // 604800 seconds
        MAX_TTL: 365 * 24 * 60 * 60, // 31536000 seconds (1 year)
    },

    // Regions based on Adobe documentation
    REGIONS: {
        AMERICAS: 'amer', // North, Central, and South America (stored in US)
        EUROPE: 'emea', // Europe, Middle East, Africa (stored in EU)
        ASIA_PACIFIC: 'apac', // Asia and Pacific (stored in Japan)
    },

    // Storage limits
    LIMITS: {
        MAX_VALUE_SIZE: 1024 * 1024, // 1MB
        MAX_KEY_SIZE: 1024, // 1KB
        MAX_KEYS_PER_WORKSPACE: 200000, // 200K keys
    },
}

/**
 * Initialize Adobe State storage with proper error handling
 * @param {string} region - Region preference (amer, emea, apac)
 * @param {Object} logger - Logger instance
 * @returns {Promise<Object>} Initialized state instance
 */
async function initStateStorage(
    region = STATE_CONSTANTS.REGIONS.ASIA_PACIFIC,
    logger
) {
    try {
        const stateLib = require('@adobe/aio-lib-state')
        return await stateLib.init({ region })
    } catch (error) {
        if (logger) {
            logger.error(
                `Failed to initialize state storage in region ${region}:`,
                error
            )
        }
        throw new Error(`State storage initialization failed: ${error.message}`)
    }
}

/**
 * Safely get value from state with proper error handling and JSON parsing
 * @param {Object} state - State instance
 * @param {string} key - State key
 * @param {Object} logger - Logger instance
 * @returns {Promise<any>} Parsed value or null if not found
 */
async function safeGetState(state, key, logger) {
    try {
        const result = await state.get(key)
        const value = result?.value

        if (!value) {
            return null
        }

        // Try to parse as JSON, fallback to original value if parsing fails
        try {
            return JSON.parse(value)
        } catch (parseError) {
            if (logger) {
                logger.warn(
                    `Failed to parse JSON for key ${key}, returning raw value:`,
                    parseError.message
                )
            }
            return value
        }
    } catch (error) {
        if (logger) {
            logger.warn(`Failed to get state for key ${key}:`, error.message)
        }
        return null
    }
}

/**
 * Safely put value to state with proper error handling and JSON stringification
 * @param {Object} state - State instance
 * @param {string} key - State key
 * @param {any} value - Value to store (will be JSON stringified)
 * @param {Object} options - Options including TTL
 * @param {Object} logger - Logger instance
 * @returns {Promise<boolean>} Success status
 */
async function safePutState(state, key, value, options = {}, logger) {
    try {
        // Always stringify the value to ensure it's stored as a string
        const stringValue =
            typeof value === 'string' ? value : JSON.stringify(value)
        await state.put(key, stringValue, options)
        return true
    } catch (error) {
        if (logger) {
            logger.error(`Failed to put state for key ${key}:`, error.message)
        }
        return false
    }
}

module.exports = {
    errorResponse,
    getBearerToken,
    stringParameters,
    checkMissingRequestInputs,
    STATE_CONSTANTS,
    initStateStorage,
    safeGetState,
    safePutState,
}
