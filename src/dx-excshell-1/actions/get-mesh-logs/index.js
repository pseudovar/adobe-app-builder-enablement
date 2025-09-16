const { Core } = require('@adobe/aio-sdk')
const stateLib = require('@adobe/aio-lib-state')
const { errorResponse } = require('../utils')

async function main(params) {
    const logger = Core.Logger('get-mesh-logs', {
        level: params.LOG_LEVEL || 'info',
    })

    try {
        logger.info('Fetching API Mesh logs')

        // Initialize state storage
        const state = await stateLib.init({ region: 'apac' })

        // Get recent logs
        const recentLogsRaw = await state.get('mesh-logs:recent')
        const recentLogs = Array.isArray(recentLogsRaw) ? recentLogsRaw : []
        const limit = parseInt(params.limit) || 20
        const limitedLogs = recentLogs.slice(0, limit)

        // Get today's statistics
        const today = new Date().toISOString().split('T')[0]
        const todayStats = (await state.get(`mesh-stats:${today}`)) || {
            date: today,
            count: 0,
            requests: [],
        }

        // Calculate additional statistics
        const stats = {
            today: todayStats,
            recentLogsCount: recentLogs.length,
            requestsInLastHour: recentLogs.filter((log) => {
                const logTime = new Date(log.timestamp)
                const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
                return logTime > oneHourAgo
            }).length,
            mostRecentRequest: recentLogs[0]?.timestamp || null,
            topQueries: getTopQueries(recentLogs.slice(0, 100)),
        }

        logger.info(`Returning ${limitedLogs.length} logs`)

        return {
            statusCode: 200,
            body: {
                success: true,
                logs: limitedLogs,
                statistics: stats,
                requestedLimit: limit,
                totalAvailable: recentLogs.length,
            },
        }
    } catch (error) {
        logger.error('Error fetching mesh logs:', error)
        return errorResponse(
            500,
            `Failed to fetch logs: ${error.message}`,
            logger
        )
    }
}

function getTopQueries(logs) {
    const queryCount = {}

    logs.forEach((log) => {
        // Extract the query operation name or first few words
        const query = log.query || 'Unknown'
        const shortQuery = query.substring(0, 50).replace(/\s+/g, ' ').trim()

        queryCount[shortQuery] = (queryCount[shortQuery] || 0) + 1
    })

    // Sort by count and return top 5
    return Object.entries(queryCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([query, count]) => ({ query, count }))
}

exports.main = main
