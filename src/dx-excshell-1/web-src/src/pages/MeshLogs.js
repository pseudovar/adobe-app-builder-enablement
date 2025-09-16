import React, { useState, useEffect } from 'react'
import {
    Button,
    Flex,
    View,
    Heading,
    Content,
    ProgressCircle,
    Well,
    Text,
    TableView,
    TableHeader,
    TableBody,
    Column,
    Row,
    Cell,
    StatusLight,
    Divider,
} from '@adobe/react-spectrum'
import { fetchData } from '../lib/utils'

export const MeshLogs = () => {
    const [logs, setLogs] = useState([])
    const [statistics, setStatistics] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const extractRequestsFromNestedStructure = (todayStats) => {
        // Handle the deeply nested structure from state storage
        let requests = []
        let currentLevel = todayStats

        while (currentLevel && typeof currentLevel === 'object') {
            if (Array.isArray(currentLevel.requests)) {
                requests = requests.concat(currentLevel.requests)
            }

            // Navigate deeper into nested value structures
            if (currentLevel.value) {
                currentLevel = currentLevel.value
            } else {
                break
            }
        }

        return requests
    }

    const fetchLogs = async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await fetchData('dx-excshell-1/get-mesh-logs')

            // Extract logs - use direct logs array or extract from nested structure
            let logsToDisplay = result.logs || []

            // If logs array is empty but we have statistics with nested data, extract from there
            if (logsToDisplay.length === 0 && result.statistics?.today) {
                logsToDisplay = extractRequestsFromNestedStructure(
                    result.statistics.today
                )

                // Add unique IDs for table rendering
                logsToDisplay = logsToDisplay.map((log, index) => ({
                    ...log,
                    id: `log-${index}-${log.timestamp}`,
                    userAgent: log.userAgent || 'Unknown',
                }))

                // Sort by timestamp (most recent first)
                logsToDisplay.sort(
                    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
                )
            }

            setLogs(logsToDisplay)

            // Process statistics with extracted data
            const processedStats = {
                ...result.statistics,
                recentLogsCount: logsToDisplay.length,
                mostRecentRequest:
                    logsToDisplay.length > 0
                        ? logsToDisplay[0].timestamp
                        : null,
                requestsInLastHour: logsToDisplay.filter((log) => {
                    const logTime = new Date(log.timestamp)
                    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
                    return logTime > oneHourAgo
                }).length,
                today: {
                    count: logsToDisplay.length,
                },
                topQueries: calculateTopQueries(logsToDisplay),
            }

            setStatistics(processedStats)
        } catch (err) {
            console.error('Failed to fetch mesh logs:', err)
            setError('Failed to fetch logs. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const calculateTopQueries = (logs) => {
        const queryCount = {}

        logs.forEach((log) => {
            const query =
                log.query === 'No query provided' ? 'POST Request' : log.query
            const shortQuery = query
                .substring(0, 50)
                .replace(/\s+/g, ' ')
                .trim()
            queryCount[shortQuery] = (queryCount[shortQuery] || 0) + 1
        })

        return Object.entries(queryCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([query, count]) => ({ query, count }))
    }

    useEffect(() => {
        fetchLogs()
    }, [])

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleString()
    }

    const formatQuery = (query) => {
        // Handle the "No query provided" case with a friendlier display
        if (query === 'No query provided') {
            return 'POST Request (no query details)'
        }

        // Truncate long queries
        return query.length > 100 ? query.substring(0, 100) + '...' : query
    }

    return (
        <View padding="size-200">
            <Flex direction="column" gap="size-300">
                <Flex
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center">
                    <Heading level={1}>API Mesh Request Logs</Heading>
                    <Button
                        variant="cta"
                        onPress={fetchLogs}
                        isDisabled={loading}>
                        {loading ? 'Refreshing...' : 'Refresh Logs'}
                    </Button>
                </Flex>

                {error && (
                    <Well>
                        <StatusLight variant="negative">Error</StatusLight>
                        <Text>{error}</Text>
                    </Well>
                )}

                {loading && <ProgressCircle aria-label="Loading logs..." />}

                {statistics && (
                    <Flex direction="row" gap="size-300">
                        <Well flex={1}>
                            <Heading level={3}>Today&apos;s Activity</Heading>
                            <Text>
                                Total Requests:{' '}
                                <strong>{statistics.today.count}</strong>
                            </Text>
                            <Text>
                                Last Hour:{' '}
                                <strong>{statistics.requestsInLastHour}</strong>
                            </Text>
                            <Text>
                                Available Logs:{' '}
                                <strong>{statistics.recentLogsCount}</strong>
                            </Text>
                        </Well>

                        <Well flex={1}>
                            <Heading level={3}>Most Recent Request</Heading>
                            {statistics.mostRecentRequest ? (
                                <Text>
                                    {formatTimestamp(
                                        statistics.mostRecentRequest
                                    )}
                                </Text>
                            ) : (
                                <Text>No requests logged yet</Text>
                            )}
                        </Well>
                    </Flex>
                )}

                {statistics?.topQueries && statistics.topQueries.length > 0 && (
                    <Well>
                        <Heading level={3}>Top Queries</Heading>
                        {statistics.topQueries.map((item, index) => (
                            <Flex
                                key={index}
                                direction="row"
                                justifyContent="space-between"
                                marginBottom="size-100">
                                <Text>{item.query}</Text>
                                <Text>
                                    <strong>{item.count} times</strong>
                                </Text>
                            </Flex>
                        ))}
                    </Well>
                )}

                <Divider />

                <Heading level={2}>Recent Requests</Heading>

                {logs.length === 0 && !loading ? (
                    <Well>
                        <StatusLight variant="neutral">No Data</StatusLight>
                        <Content>
                            <Text>
                                No API Mesh requests have been logged yet.
                            </Text>
                            <Text>
                                Make some requests to your API Mesh endpoint to
                                see them appear here!
                            </Text>
                        </Content>
                    </Well>
                ) : (
                    <TableView
                        aria-label="Mesh request logs"
                        maxHeight="size-6000">
                        <TableHeader>
                            <Column key="timestamp" width="20%">
                                Timestamp
                            </Column>
                            <Column key="method" width="10%">
                                Method
                            </Column>
                            <Column key="query" width="50%">
                                Query
                            </Column>
                            <Column key="userAgent" width="20%">
                                User Agent
                            </Column>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log) => (
                                <Row key={log.id}>
                                    <Cell>
                                        {formatTimestamp(log.timestamp)}
                                    </Cell>
                                    <Cell>
                                        <StatusLight
                                            variant={
                                                log.method === 'POST'
                                                    ? 'positive'
                                                    : 'neutral'
                                            }>
                                            {log.method}
                                        </StatusLight>
                                    </Cell>
                                    <Cell>
                                        <Text
                                            UNSAFE_style={{
                                                fontFamily: 'monospace',
                                                fontSize: '12px',
                                                fontStyle:
                                                    log.query ===
                                                    'No query provided'
                                                        ? 'italic'
                                                        : 'normal',
                                                color:
                                                    log.query ===
                                                    'No query provided'
                                                        ? '#666'
                                                        : 'inherit',
                                            }}>
                                            {formatQuery(log.query)}
                                        </Text>
                                    </Cell>
                                    <Cell>
                                        <Text
                                            UNSAFE_style={{ fontSize: '12px' }}>
                                            {log.userAgent}
                                        </Text>
                                    </Cell>
                                </Row>
                            ))}
                        </TableBody>
                    </TableView>
                )}
            </Flex>
        </View>
    )
}
