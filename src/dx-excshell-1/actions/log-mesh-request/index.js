const { Core } = require('@adobe/aio-sdk')
const stateLib = require('@adobe/aio-lib-state')
const { errorResponse } = require('../utils')

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

        // Initialize state storage
        const state = await stateLib.init({ region: 'apac' })

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

        // Store individual log entry
        await state.put(`mesh-log:${logEntry.id}`, logEntry, { ttl: 3600 }) // 1 hour TTL

        // Update recent logs list
        const recentLogsRaw = await state.get('mesh-logs:recent')
        const recentLogs = Array.isArray(recentLogsRaw) ? recentLogsRaw : []
        recentLogs.unshift(logEntry)

        // Keep only the last 50 logs
        if (recentLogs.length > 50) {
            recentLogs.length = 50
        }

        await state.put('mesh-logs:recent', recentLogs, { ttl: 3600 })

        // Update request count statistics
        const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
        const statsKey = `mesh-stats:${today}`
        let todayStatsRaw = await state.get(statsKey)

        // Handle case where state might return string instead of object
        let todayStats
        if (!todayStatsRaw) {
            // No existing stats for today
            todayStats = {
                date: today,
                count: 0,
                requests: [],
            }
        } else if (typeof todayStatsRaw === 'string') {
            // Parse JSON string
            try {
                todayStats = JSON.parse(todayStatsRaw)
            } catch (parseError) {
                logger.warn(
                    'Failed to parse existing stats, creating new:',
                    parseError
                )
                todayStats = {
                    date: today,
                    count: 0,
                    requests: [],
                }
            }
        } else {
            // Already an object
            todayStats = todayStatsRaw
        }

        // Ensure requests is an array (defensive programming)
        if (!Array.isArray(todayStats.requests)) {
            logger.warn('todayStats.requests is not an array, resetting')
            todayStats.requests = []
        }

        // Ensure count is a number
        if (typeof todayStats.count !== 'number') {
            logger.warn('todayStats.count is not a number, resetting')
            todayStats.count = 0
        }

        console.log('todayStats (processed):', todayStats)

        todayStats.count += 1
        todayStats.requests.push({
            timestamp: logEntry.timestamp,
            method: logEntry.method,
            query: logEntry.query.substring(0, 100),
        })

        // Keep only last 100 requests per day
        if (todayStats.requests.length > 100) {
            todayStats.requests = todayStats.requests.slice(-100)
        }

        await state.put(statsKey, todayStats, { ttl: 86400 }) // 24 hours

        logger.info('Successfully logged API Mesh request')

        return {
            statusCode: 200,
            body: {
                success: true,
                logId: logEntry.id,
                message: 'Request logged successfully',
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
