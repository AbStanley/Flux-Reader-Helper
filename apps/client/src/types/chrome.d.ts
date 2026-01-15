/**
 * Chrome Extension API Type Definitions
 * Extends the base Chrome types with specific message and response types
 */

export interface ChromeMessage {
    type: string;
    data?: unknown;
}

export interface ProxyRequestMessage extends ChromeMessage {
    type: 'PROXY_REQUEST';
    data: {
        url: string;
        method?: string;
        headers?: Record<string, string>;
        body?: string;
    };
}

export interface OpenSidePanelMessage extends ChromeMessage {
    type: 'OPEN_SIDE_PANEL';
}

export interface StreamMessage extends ChromeMessage {
    type: 'START_STREAM';
    data: {
        url: string;
        method?: string;
        headers?: Record<string, string>;
        body?: string;
    };
}

export interface ChromeResponse {
    success: boolean;
    data?: unknown;
    error?: string;
}

export interface ChromeStorageResult {
    pendingText?: string;
}

export type ChromeMessageHandler = (
    message: ChromeMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ChromeResponse) => void
) => boolean | void;

export type ChromePortMessageHandler = (message: ChromeMessage) => void;
