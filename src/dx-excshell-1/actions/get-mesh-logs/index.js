const { Core } = require('@adobe/aio-sdk')
const {
    errorResponse,
    STATE_CONSTANTS,
    initStateStorage,
    safeGetState,
} = require('../utils')

async function main(params) {
    const logger = Core.Logger('get-mesh-logs', {
        level: params.LOG_LEVEL || 'info',
    })

    try {
        logger.info('Fetching API Mesh logs')

        // Initialize state storage with region preference
        const region = params.region || STATE_CONSTANTS.REGIONS.ASIA_PACIFIC
        const state = await initStateStorage(region, logger)

        // Get today's statistics first to get the log IDs
        const today = new Date().toISOString().split('T')[0]
        const todayStatsData = await safeGetState(
            state,
            `meshstats-${today}`,
            logger
        )

        let logs = []
        let totalAvailable = 0

        if (todayStatsData && Array.isArray(todayStatsData.logIds)) {
            const limit = parseInt(params.limit) || 20
            const logIdsToFetch = todayStatsData.logIds.slice(-limit) // Get most recent logs
            totalAvailable = todayStatsData.logIds.length

            logger.info(`Fetching ${logIdsToFetch.length} individual logs`)

            // Fetch individual logs by ID
            for (const logId of logIdsToFetch.reverse()) {
                // Reverse to show newest first
                const logData = await safeGetState(
                    state,
                    `meshlog-${logId}`,
                    logger
                )
                if (logData) {
                    logs.push(logData)
                }
            }
        }

        // Use the existing todayStatsData for stats
        const todayStats = todayStatsData || {
            date: today,
            count: 0,
            logIds: [],
        }

        // Calculate additional statistics
        const stats = {
            today: todayStats,
            todayLogsCount: logs.length,
            requestsInLastHour: logs.filter((log) => {
                const logTime = new Date(log.timestamp)
                const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
                return logTime > oneHourAgo
            }).length,
            mostRecentRequest: logs[0]?.timestamp || null,
            topQueries: getTopQueries(logs),
            region: region,
        }

        return {
            statusCode: 200,
            body: {
                success: true,
                logs: logs,
                statistics: stats,
                requestedLimit: parseInt(params.limit) || 20,
                totalAvailable: totalAvailable,
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
