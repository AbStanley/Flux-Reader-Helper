/// <reference types="chrome" />

// Background service worker for handling API requests
// This bypasses CORS/PNA restrictions by fetching from the background context

// @ts-ignore
chrome.runtime.onMessage.addListener((message: any, sender: any, sendResponse: any) => {
    if (message.type === 'PROXY_REQUEST') {
        handleProxyRequest(message.data)
            .then(data => sendResponse({ success: true, data }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Will respond asynchronously
    }
});

chrome.runtime.onConnect.addListener((port: chrome.runtime.Port) => {
    if (port.name === 'PROXY_STREAM_CONNECTION') {
        port.onMessage.addListener((message: any) => {
            if (message.type === 'START_STREAM') {
                handleStreamRequest(message.data, port);
            }
        });
    }
});

async function handleProxyRequest(config: { url: string, method?: string, headers?: any, body?: any }) {
    const { url, method = 'GET', headers = {}, body } = config;

    console.log('[Background] Fetching:', url);

    try {
        const response = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch {
            return text;
        }
    } catch (error) {
        console.error('[Background] Fetch error:', error);
        throw error;
    }
}

async function handleStreamRequest(config: { url: string, method?: string, headers?: any, body?: any }, port: chrome.runtime.Port) {
    const { url, method = 'POST', headers = {}, body } = config;

    try {
        const response = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        });

        if (!response.ok) {
            port.postMessage({ type: 'ERROR', error: `HTTP error! status: ${response.status}` });
            port.disconnect();
            return;
        }

        if (!response.body) {
            port.postMessage({ type: 'ERROR', error: 'No response body' });
            port.disconnect();
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                port.postMessage({ type: 'DONE' });
                break;
            }
            const chunk = decoder.decode(value, { stream: true });
            port.postMessage({ type: 'CHUNK', chunk });
        }

        port.disconnect();

    } catch (error: any) {
        port.postMessage({ type: 'ERROR', error: error.message });
        port.disconnect();
    }
}
