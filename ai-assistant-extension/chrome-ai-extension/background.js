// Background script for Chrome Extension
chrome.runtime.onInstalled.addListener(() => {
    console.log('AI Assistant Extension installed');
    
    // Set default settings
    chrome.storage.local.set({
        extension_enabled: true,
        theme: 'cyberpunk',
        auto_save_conversations: true
    });
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    // This will open the popup automatically
    // No additional action needed as popup is defined in manifest
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'getTabInfo':
            // Get current tab information
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    sendResponse({
                        url: tabs[0].url,
                        title: tabs[0].title,
                        id: tabs[0].id
                    });
                }
            });
            return true; // Keep message channel open for async response

        case 'saveConversation':
            // Save conversation to storage
            const timestamp = new Date().toISOString();
            const conversationId = `conversation_${timestamp}`;
            
            chrome.storage.local.set({
                [conversationId]: {
                    timestamp,
                    messages: request.messages,
                    tabInfo: request.tabInfo
                }
            }, () => {
                sendResponse({ success: true, id: conversationId });
            });
            return true;

        case 'getConversations':
            // Get all saved conversations
            chrome.storage.local.get(null, (items) => {
                const conversations = {};
                Object.keys(items).forEach(key => {
                    if (key.startsWith('conversation_')) {
                        conversations[key] = items[key];
                    }
                });
                sendResponse(conversations);
            });
            return true;

        case 'deleteConversation':
            // Delete a specific conversation
            chrome.storage.local.remove(request.conversationId, () => {
                sendResponse({ success: true });
            });
            return true;

        case 'exportData':
            // Export all extension data
            chrome.storage.local.get(null, (items) => {
                const exportData = {
                    timestamp: new Date().toISOString(),
                    version: chrome.runtime.getManifest().version,
                    data: items
                };
                sendResponse(exportData);
            });
            return true;

        case 'importData':
            // Import extension data
            try {
                const importData = JSON.parse(request.data);
                if (importData.data) {
                    chrome.storage.local.set(importData.data, () => {
                        sendResponse({ success: true });
                    });
                } else {
                    sendResponse({ success: false, error: 'Invalid data format' });
                }
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
            return true;

        case 'clearAllData':
            // Clear all extension data
            chrome.storage.local.clear(() => {
                // Reset default settings
                chrome.storage.local.set({
                    extension_enabled: true,
                    theme: 'cyberpunk',
                    auto_save_conversations: true
                }, () => {
                    sendResponse({ success: true });
                });
            });
            return true;

        default:
            sendResponse({ error: 'Unknown action' });
    }
});

// Handle storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
        console.log('Storage changed:', changes);
        
        // Notify popup about storage changes if needed
        chrome.runtime.sendMessage({
            action: 'storageChanged',
            changes: changes
        }).catch(() => {
            // Popup might not be open, ignore error
        });
    }
});

// Handle tab updates (optional - for context awareness)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        // Could be used to provide context-aware suggestions
        console.log('Tab updated:', tab.url);
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('AI Assistant Extension started');
});

// Handle extension suspend
chrome.runtime.onSuspend.addListener(() => {
    console.log('AI Assistant Extension suspended');
});

// Utility functions for background operations
const BackgroundUtils = {
    // Generate unique ID
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Format timestamp
    formatTimestamp: (timestamp) => {
        return new Date(timestamp).toLocaleString('th-TH');
    },

    // Validate API key format
    validateApiKey: (apiKey) => {
        return apiKey && typeof apiKey === 'string' && apiKey.startsWith('sk-');
    },

    // Clean old conversations (keep only last 50)
    cleanOldConversations: async () => {
        return new Promise((resolve) => {
            chrome.storage.local.get(null, (items) => {
                const conversations = Object.keys(items)
                    .filter(key => key.startsWith('conversation_'))
                    .map(key => ({ key, timestamp: items[key].timestamp }))
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                if (conversations.length > 50) {
                    const toDelete = conversations.slice(50).map(conv => conv.key);
                    chrome.storage.local.remove(toDelete, () => {
                        console.log(`Cleaned ${toDelete.length} old conversations`);
                        resolve(toDelete.length);
                    });
                } else {
                    resolve(0);
                }
            });
        });
    }
};

// Periodic cleanup (run every hour)
setInterval(() => {
    BackgroundUtils.cleanOldConversations();
}, 60 * 60 * 1000);

// Export utils for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BackgroundUtils };
}

