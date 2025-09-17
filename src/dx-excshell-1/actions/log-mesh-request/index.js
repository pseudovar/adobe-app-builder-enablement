const { Core } = require('@adobe/aio-sdk')
const {
    errorResponse,
    STATE_CONSTANTS,
    initStateStorage,
    safeGetState,
    safePutState,
} = require('../utils')

// Simple function to generate a unique ID without external dependencies
function generateId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

async function main(params) {
    const logger = Core.Logger('log-mesh-request', {
        level: params.LOG_LEVEL || 'info',
    })

    try {
        logger.info('Logging API Mesh request')

        // Initialize state storage with region preference
        const region = params.region || STATE_CONSTANTS.REGIONS.ASIA_PACIFIC
        const state = await initStateStorage(region, logger)

        // Create log entry
        const logEntry = {
            id: generateId(),
            timestamp: params.timestamp || new Date().toISOString(),
            method: params.method || 'POST',
            url: params.url || 'Unknown URL',
            query: params.query || 'No query provided',
            headers: params.headers || {},
            userAgent: params.headers?.['user-agent'] || 'Unknown',
        }

        logger.info('Created log entry:', logEntry.id)

        // Store individual log entry with proper TTL
        await safePutState(
            state,
            `meshlog-${logEntry.id}`,
            logEntry,
            { ttl: STATE_CONSTANTS.TTL.TEN_HOURS },
            logger
        )

        logger.info('Stored individual log entry with proper TTL')

        // Update request count statistics
        const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
        const statsKey = `meshstats-${today}`
        const todayStatsData = await safeGetState(state, statsKey, logger)

        // Handle stats data with proper defaults
        let todayStats
        if (!todayStatsData || typeof todayStatsData !== 'object') {
            // No existing stats for today or invalid data
            todayStats = {
                date: today,
                count: 0,
                logIds: [],
            }
        } else {
            // Use existing stats
            todayStats = todayStatsData
        }

        // Ensure logIds is an array (defensive programming)
        if (!Array.isArray(todayStats.logIds)) {
            logger.warn('todayStats.logIds is not an array, resetting')
            todayStats.logIds = []
        }

        // Ensure count is a number
        if (typeof todayStats.count !== 'number') {
            logger.warn('todayStats.count is not a number, resetting')
            todayStats.count = 0
        }

        logger.info('todayStats (processed):', todayStats)

        todayStats.count += 1
        todayStats.logIds.push(logEntry.id)

        await safePutState(
            state,
            statsKey,
            todayStats,
            { ttl: STATE_CONSTANTS.TTL.TWENTY_FOUR_HOURS },
            logger
        )

        logger.info('Successfully logged API Mesh request')

        return {
            statusCode: 200,
            body: {
                success: true,
                logId: logEntry.id,
                message: 'Request logged successfully',
                region: region,
                statsForToday: {
                    date: todayStats.date,
                    totalCount: todayStats.count,
                    totalLogIds: todayStats.logIds.length,
                },
            },
        }
    } catch (error) {
        logger.error('Error logging mesh request:', error)
        return errorResponse(
            500,
            `Failed to log request: ${error.message}`,
            logger
        )
    }
}

exports.main = main
