/*
 * <license header>
 */

/**
 *
 * Invokes a web action
 *
 * @param  {string} actionUrl
 * @param {object} headers
 * @param  {object} params
 *
 * @returns {Promise<string|object>} the response
 *
 */

import allActions from '../config.json'

// remove the deprecated key
const actions = Object.keys(allActions).reduce((obj, key) => {
    if (key.lastIndexOf('/') > -1) {
        obj[key] = allActions[key]
    }
    return obj
}, {})

export async function actionWebInvoke(
    actionUrl,
    headers = {},
    params = {},
    options = { method: 'POST' }
) {
    const actionHeaders = {
        'Content-Type': 'application/json',
        ...headers,
    }

    const fetchConfig = {
        headers: actionHeaders,
    }

    if (window.location.hostname === 'localhost') {
        actionHeaders['x-ow-extra-logging'] = 'on'
    }

    fetchConfig.method = options.method.toUpperCase()

    if (fetchConfig.method === 'GET') {
        actionUrl = new URL(actionUrl)
        Object.keys(params).forEach((key) =>
            actionUrl.searchParams.append(key, params[key])
        )
    } else if (fetchConfig.method === 'POST') {
        fetchConfig.body = JSON.stringify(params)
    }

    const response = await fetch(actionUrl, fetchConfig)

    let content = await response.text()

    if (!response.ok) {
        throw new Error(
            `failed request to '${actionUrl}' with status: ${response.status} and message: ${content}`
        )
    }
    try {
        content = JSON.parse(content)
    } catch (e) {
        // response is not json
    }
    return content
}

export async function fetchData(actionName, headers = {}, params = {}) {
    const response = await actionWebInvoke(actions[actionName], headers, params)
    return response
}

export default {
    fetchData,
    actionWebInvoke,
}
