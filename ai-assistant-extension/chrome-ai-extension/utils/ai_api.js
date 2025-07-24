// AI API Utility for Chrome Extension
class AIApi {
    constructor(model = 'gpt-3.5-turbo') {
        this.apiKey = null;
        this.apiBase = 'https://api.openai.com/v1';
        this.model = model;
        this.maxTokens = 2000;
        this.temperature = 0.7;
        this.conversationHistory = [];
    }

    // Set OpenAI model version
    setModel(model) {
        this.model = model;
    }

    // Initialize API key from storage
    async initialize() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                const result = await chrome.storage.local.get(['openai_api_key']);
                if (result.openai_api_key) {
                    this.apiKey = result.openai_api_key;
                    return true;
                }
            } else {
                // Fallback for testing outside Chrome extension
                const stored = localStorage.getItem('openai_api_key');
                if (stored) {
                    this.apiKey = stored;
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Error initializing API:', error);
            return false;
        }
    }

    // Set API key and save to storage
    async setApiKey(apiKey) {
        try {
            this.apiKey = apiKey;
            if (typeof chrome !== 'undefined' && chrome.storage) {
                await chrome.storage.local.set({ openai_api_key: apiKey });
            } else {
                // Fallback for testing
                localStorage.setItem('openai_api_key', apiKey);
            }
            return true;
        } catch (error) {
            console.error('Error setting API key:', error);
            return false;
        }
    }

    // Check if API key is set
    hasApiKey() {
        return !!this.apiKey;
    }

    // Add message to conversation history
    addToHistory(role, content) {
        this.conversationHistory.push({ role, content });
        
        // Keep only last 20 messages to avoid token limit
        if (this.conversationHistory.length > 20) {
            this.conversationHistory = this.conversationHistory.slice(-20);
        }
    }

    // Clear conversation history
    clearHistory() {
        this.conversationHistory = [];
    }

    // Get conversation history
    getHistory() {
        return [...this.conversationHistory];
    }

    // Send message to AI
    async sendMessage(message, onProgress = null) {
        if (!this.hasApiKey()) {
            throw new Error('API key not set. Please configure your OpenAI API key.');
        }

        // Add user message to history
        this.addToHistory('user', message);

        const systemPrompt = {
            role: 'system',
            content: `คุณคือ AI Assistant ที่ช่วยเหลือผู้ใช้ในการแชท ให้คำแนะนำ วิเคราะห์ข้อมูล และสร้างกราฟ/ตาราง/แผนภูมิ

ความสามารถของคุณ:
1. ตอบคำถามและให้คำแนะนำ
2. วิเคราะห์ข้อมูลที่ผู้ใช้ให้มา
3. สร้างกราฟ แผนภูมิ ตาราง จากข้อมูล
4. แสดงผลลัพธ์ในรูปแบบข้อความ โค้ด หรือข้อมูลสำหรับสร้างกราฟ

เมื่อผู้ใช้ขอให้สร้างกราฟหรือแผนภูมิ ให้ตอบกลับในรูปแบบ JSON ที่มี:
- type: "chart"
- chartType: "line", "bar", "pie", "doughnut", "scatter", "table"
- data: ข้อมูลสำหรับสร้างกราฟ
- title: หัวข้อของกราฟ
- description: คำอธิบายกราฟ

ตัวอย่าง:
\`\`\`json
{
  "type": "chart",
  "chartType": "bar",
  "title": "ยอดขายรายเดือน",
  "description": "แสดงยอดขายในแต่ละเดือน",
  "data": {
    "labels": ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย."],
    "datasets": [{
      "label": "ยอดขาย",
      "data": [12, 19, 3, 5],
      "backgroundColor": ["#00ffff", "#ff00ff", "#ffff00", "#00ff00"]
    }]
  }
}
\`\`\`

ตอบเป็นภาษาไทยเสมอ และใช้ Markdown สำหรับการจัดรูปแบบข้อความ`
        };

        const messages = [systemPrompt, ...this.conversationHistory];

        try {
            const response = await fetch(`${this.apiBase}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    max_tokens: this.maxTokens,
                    temperature: this.temperature,
                    stream: !!onProgress
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
            }

            if (onProgress) {
                return this.handleStreamResponse(response, onProgress);
            } else {
                const data = await response.json();
                const aiResponse = data.choices[0].message.content;
                
                // Add AI response to history
                this.addToHistory('assistant', aiResponse);
                
                return aiResponse;
            }
        } catch (error) {
            console.error('Error sending message to AI:', error);
            throw error;
        }
    }

    // Handle streaming response
    async handleStreamResponse(response, onProgress) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        
                        if (data === '[DONE]') {
                            break;
                        }

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices[0]?.delta?.content;
                            
                            if (content) {
                                fullResponse += content;
                                onProgress(content, fullResponse);
                            }
                        } catch (e) {
                            // Ignore parsing errors for incomplete chunks
                        }
                    }
                }
            }

            // Add AI response to history
            this.addToHistory('assistant', fullResponse);
            
            return fullResponse;
        } catch (error) {
            console.error('Error handling stream response:', error);
            throw error;
        }
    }

    // Export conversation history
    exportHistory() {
        const exportData = {
            timestamp: new Date().toISOString(),
            conversation: this.conversationHistory,
            metadata: {
                model: this.model,
                totalMessages: this.conversationHistory.length
            }
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    // Import conversation history
    importHistory(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.conversation && Array.isArray(data.conversation)) {
                this.conversationHistory = data.conversation;
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error importing history:', error);
            return false;
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIApi;
} else {
    window.AIApi = AIApi;
}

